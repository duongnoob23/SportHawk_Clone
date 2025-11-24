import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ReminderRequest {
  payment_request_id: string;
  recipient_ids: string[] | 'all';
  reminder_type: 'individual' | 'bulk';
}

interface ReminderResponse {
  success: boolean;
  reminders_sent: number;
  failed_recipients?: string[];
  last_reminder_timestamp: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body: ReminderRequest = await req.json();
    const { payment_request_id, recipient_ids, reminder_type } = body;

    // Get payment request details
    const { data: paymentRequest, error: paymentError } = await supabase
      .from('payment_requests')
      .select('*, teams(name)')
      .eq('id', payment_request_id)
      .single();

    if (paymentError || !paymentRequest) {
      return new Response(
        JSON.stringify({ error: 'Payment request not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify user is team admin
    const { data: userRole, error: roleError } = await supabase
      .from('user_team_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('team_id', paymentRequest.team_id)
      .single();

    if (roleError || userRole?.role !== 'admin') {
      return new Response(
        JSON.stringify({
          error: 'Permission denied. Only team admins can send reminders.',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get unpaid members
    let unpaidMembersQuery = supabase
      .from('payment_request_members')
      .select('*, profiles:user_id(*)')
      .eq('payment_request_id', payment_request_id)
      .eq('payment_status', 'unpaid');

    // Filter by specific recipients if not 'all'
    if (recipient_ids !== 'all' && Array.isArray(recipient_ids)) {
      unpaidMembersQuery = unpaidMembersQuery.in('user_id', recipient_ids);
    }

    const { data: unpaidMembers, error: membersError } =
      await unpaidMembersQuery;

    if (membersError) {
      throw new Error('Failed to fetch unpaid members');
    }

    if (!unpaidMembers || unpaidMembers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          reminders_sent: 0,
          last_reminder_timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check rate limiting (1 reminder per user per 24 hours)
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();
    const { data: recentReminders } = await supabase
      .from('payment_reminders')
      .select('user_id')
      .eq('payment_request_id', payment_request_id)
      .in(
        'user_id',
        unpaidMembers.map(m => m.user_id)
      )
      .gte('created_at', twentyFourHoursAgo);

    const recentReminderUserIds = new Set(
      recentReminders?.map(r => r.user_id) || []
    );
    const eligibleMembers = unpaidMembers.filter(
      m => !recentReminderUserIds.has(m.user_id)
    );

    if (eligibleMembers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          reminders_sent: 0,
          failed_recipients: unpaidMembers.map(m => m.user_id),
          last_reminder_timestamp: new Date().toISOString(),
          message: 'All recipients have been reminded within the last 24 hours',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare notifications
    const notifications = eligibleMembers.map(member => ({
      user_id: member.user_id,
      title: 'Payment Reminder',
      body: `Reminder: Payment of £${(paymentRequest.amount_pence / 100).toFixed(2)} for "${paymentRequest.title}" is due`,
      data: {
        type: 'payment_reminder',
        payment_request_id: payment_request_id,
        deep_link: `/payments/${payment_request_id}`,
      },
      push_token: member.profiles?.push_token,
    }));

    // Send push notifications (using Expo Push Notifications)
    const successfulRecipients: string[] = [];
    const failedRecipients: string[] = [];

    for (const notification of notifications) {
      if (!notification.push_token) {
        failedRecipients.push(notification.user_id);
        continue;
      }

      try {
        // Send to Expo Push Notification Service
        const expoPushResponse = await fetch(
          'https://exp.host/--/api/v2/push/send',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: notification.push_token,
              title: notification.title,
              body: notification.body,
              data: notification.data,
              priority: 'high',
            }),
          }
        );

        if (expoPushResponse.ok) {
          successfulRecipients.push(notification.user_id);
        } else {
          failedRecipients.push(notification.user_id);
        }
      } catch (error) {
        console.error('Push notification error:', error);
        failedRecipients.push(notification.user_id);
      }
    }

    // Log reminders in database
    if (successfulRecipients.length > 0) {
      const reminderLogs = successfulRecipients.map(userId => ({
        payment_request_id,
        user_id: userId,
        reminder_type,
        sent_by: user.id,
      }));

      await supabase.from('payment_reminders').insert(reminderLogs);

      // Update last_reminder_sent on payment request
      await supabase
        .from('payment_requests')
        .update({ last_reminder_sent: new Date().toISOString() })
        .eq('id', payment_request_id);
    }

    const response: ReminderResponse = {
      success: true,
      reminders_sent: successfulRecipients.length,
      failed_recipients:
        failedRecipients.length > 0 ? failedRecipients : undefined,
      last_reminder_timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-payment-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
