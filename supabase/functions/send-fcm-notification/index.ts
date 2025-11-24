// Edge Function: send-fcm-notification
// Sends FCM v1 push notifications when a row is inserted into public.notifications
// Uses service-account.json for Firebase authentication

import { createClient } from 'npm:@supabase/supabase-js@2';
import { JWT } from 'npm:google-auth-library@9';
import serviceAccount from '../service-account.json' with { type: 'json' };

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string; // composite: "<main>,<detail>"
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  priority?: string | null;
  delivery_status?: string | null;
  delivery_attempts?: number | null;
  last_delivery_attempt?: string | null;
  created_at: string;
  expires_at?: string | null;
}

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: Notification;
  schema: 'public';
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const getAccessToken = ({
  clientEmail,
  privateKey,
}: {
  clientEmail: string;
  privateKey: string;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    jwtClient.authorize(
      (err: Error | null, tokens: { access_token?: string }) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens.access_token!);
      }
    );
  });
};

Deno.serve(async (req: Request) => {
  const payload: WebhookPayload = await req.json();

  // Only process INSERT events for notifications table
  if (payload.type !== 'INSERT' || payload.table !== 'notifications') {
    return new Response('Event ignored', { status: 200 });
  }

  const notification = payload.record;

  // Get user's FCM token from device_tokens table
  const { data: deviceToken, error: tokenError } = await supabase
    .from('device_tokens')
    .select('token')
    .eq('user_id', notification.user_id)
    .eq('is_active', true)
    .order('last_used', { ascending: false })
    .limit(1)
    .single();

  if (tokenError || !deviceToken) {
    console.error(
      'No active device token found for user:',
      notification.user_id
    );

    // Update notification as failed
    await supabase
      .from('notifications')
      .update({
        delivery_status: 'failed',
        delivery_attempts: (notification.delivery_attempts || 0) + 1,
        last_delivery_attempt: new Date().toISOString(),
      })
      .eq('id', notification.id);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'No active device token found',
        notification_id: notification.id,
      }),
      { status: 404 }
    );
  }

  const fcmToken = deviceToken.token as string;

  // Get Firebase access token using service account
  const accessToken = await getAccessToken({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  });

  // Build FCM data payload
  const fcmData: Record<string, string> = {
    notification_id: notification.id,
    notification_type: notification.notification_type,
    related_entity_type: notification.related_entity_type || '',
    related_entity_id: notification.related_entity_id || '',
    userId: notification.user_id,
  };

  // Add custom data if present
  if (notification.data) {
    Object.entries(notification.data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        fcmData[key] =
          typeof value === 'string' ? value : JSON.stringify(value);
      }
    });
  }

  // Send FCM message
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          data: fcmData,
          notification: {
            title: notification.title,
            body: notification.message,
          },
        },
      }),
    }
  );

  const resData = await res.json();

  // Update notification delivery status
  const success = res.status >= 200 && res.status <= 299;
  await supabase
    .from('notifications')
    .update({
      delivery_status: success ? 'delivered' : 'failed',
      delivery_attempts: (notification.delivery_attempts || 0) + 1,
      last_delivery_attempt: new Date().toISOString(),
    })
    .eq('id', notification.id);

  if (!success) {
    console.error('FCM error:', resData);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'FCM delivery failed',
        details: resData,
        notification_id: notification.id,
      }),
      { status: 500 }
    );
  }

  console.log('FCM message sent successfully:', {
    notification_id: notification.id,
    user_id: notification.user_id,
    fcm_response: resData,
  });

  return new Response(
    JSON.stringify({
      success: true,
      notification_id: notification.id,
      fcm_response: resData,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
});
