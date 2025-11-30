import { Database } from '@typ/database';
import { supabase } from '@lib/supabase';
import { getSupabaseClient } from '@lib/supabase-dev';
import { logger } from '@lib/utils/logger';
import {
  PaymentHistoryStatusType,
  PaymentStatus,
  PaymentUIConstants,
} from '@con/payments';
import {
  getDateRangeFromFilter,
  TimeFilterType,
} from '@top/hooks/useTimeFilter';

type PaymentRequest = Database['public']['Tables']['payment_requests']['Row'];
type PaymentRequestInsert =
  Database['public']['Tables']['payment_requests']['Insert'];
type PaymentRequestMember =
  Database['public']['Tables']['payment_request_members']['Row'];
type PaymentRequestMemberInsert =
  Database['public']['Tables']['payment_request_members']['Insert'];
type StripeAccount = Database['public']['Tables']['stripe_accounts']['Row'];

interface CreatePaymentRequestData {
  title: string;
  description?: string;
  amountPence: number;
  dueDate: string;
  paymentType: 'required' | 'optional';
  teamId: string;
  memberIds: string[];
}

interface PaymentRequestWithMembers extends PaymentRequest {
  payment_request_members?: PaymentRequestMember[];
}

interface PaymentHistoryItem {
  id: string;
  title: string;
  team_name: string;
  amount_pence: number;
  payment_date: string;
  status: PaymentHistoryStatusType;
  stripe_payment_intent_id?: string;
}

interface PaymentDetail extends PaymentHistoryItem {
  description: string;
  requested_by: {
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  transaction_fee_pence?: number;
  net_amount_pence?: number;
}

export const paymentsApi = {
  async getTeamStripeAccount(teamId: string): Promise<StripeAccount | null> {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('stripe_accounts')
        .select('*')
        .eq('team_id', teamId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (error) {
        if (error.code === 'PGRST116') {
          logger.log('No Stripe account found for team:', teamId);
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to get team Stripe account:', error);
      throw error;
    }
  },

  async createPaymentRequest(
    data: CreatePaymentRequestData
  ): Promise<PaymentRequest> {
    try {
      const { getAuthUser } = await import('@lib/utils/get-auth-user');
      const { getSupabaseClient } = await import('@lib/supabase-dev');
      const user = await getAuthUser();
      const client = getSupabaseClient();

      logger.log('Creating payment request:', data.title);

      const paymentRequestInsert: PaymentRequestInsert = {
        team_id: data.teamId,
        created_by: user.id,
        title: data.title,
        description: data.description || null,
        amount_pence: data.amountPence,
        due_date: data.dueDate,
        payment_type: data.paymentType,
        request_status: 'active',
        total_members: data.memberIds.length,
        paid_members: 0,
        total_collected_pence: 0,
      };

      const { data: paymentRequest, error: requestError } = await client
        .from('payment_requests')
        .insert(paymentRequestInsert)
        .select()
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (requestError) {
        logger.error('Failed to create payment request:', requestError);
        throw requestError;
      }

      const memberInserts: PaymentRequestMemberInsert[] = data.memberIds.map(
        memberId => ({
          payment_request_id: paymentRequest.id,
          user_id: memberId,
          payment_status: 'unpaid',
          amount_pence: data.amountPence,
          currency: 'GBP',
        })
      );

      const { error: membersError } = await client
        .from('payment_request_members')
        .insert(memberInserts);

      if (membersError) {
        logger.error('Failed to create payment request members:', membersError);
        throw membersError;
      }

      await this.sendPaymentNotifications(paymentRequest.id, data.memberIds);

      logger.log('Payment request created successfully:', paymentRequest.id);
      return paymentRequest;
    } catch (error) {
      logger.error('Error in createPaymentRequest:', error);
      throw error;
    }
  },

  async sendPaymentNotifications(
    paymentRequestId: string,
    memberIds: string[]
  ): Promise<void> {
    try {
      logger.log('Sending payment notifications for:', paymentRequestId);

      const { error } = await supabase.functions.invoke(
        'send-payment-notifications',
        {
          body: {
            paymentRequestId,
            memberIds,
          },
        }
      );

      if (error) {
        logger.error('Failed to send notifications:', error);
      }
    } catch (err) {
      logger.error('Notification error:', err);
    }
  },

  async getUserPaymentRequests(
    userId: string,
    teamId?: string,
    timeFilter?: TimeFilterType
  ): Promise<PaymentRequestWithMembers[]> {
    try {
      const client = getSupabaseClient();
      let query = client
        .from('payment_request_members')
        .select(
          `
        *,
        payment_requests!inner(
          *,
          teams(
            id,
            name
          )
        )
      `
        )
        .eq('user_id', userId);

      if (teamId && teamId !== 'all') {
        query = query.eq('payment_requests.team_id', teamId);
      }

      const dateRange = getDateRangeFromFilter(timeFilter);
      if (dateRange) {
        if (dateRange.startDate) {
          query = query.gte(
            'payment_requests.created_at',
            dateRange.startDate.toISOString()
          );
        }
        if (dateRange.endDate) {
          query = query.lte(
            'payment_requests.created_at',
            dateRange.endDate.toISOString()
          );
        }
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get user payment requests:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUserPaymentRequests:', error);
      throw error;
    }
  },

  async getTeamPaymentRequests(
    teamId: string
  ): Promise<PaymentRequestWithMembers[]> {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('payment_requests')
        .select(
          `
          *,
          payment_request_members(*)
        `
        )
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get team payment requests:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getTeamPaymentRequests:', error);
      throw error;
    }
  },

  async getPaymentRequestDetails(
    paymentRequestId: string
  ): Promise<PaymentRequestWithMembers | null> {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('payment_requests')
        .select(
          `
          *,
          payment_request_members(
            *,
            user:users(
              id,
              first_name,
              last_name,
              avatar_url
            )
          )
        `
        )
        .eq('id', paymentRequestId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (error) {
        logger.error('Failed to get payment request details:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in getPaymentRequestDetails:', error);
      throw error;
    }
  },

  async getPaymentDetail(paymentId: string): Promise<any> {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('payment_requests')
        .select(
          `
          *,
          teams (
            id,
            name,
            team_photo_url
          ),
          profiles!payment_requests_created_by_fkey (
            id,
            first_name,
            last_name,
            profile_photo_uri
          )
        `
        )
        .eq('id', paymentId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (error) {
        logger.error('Failed to get payment detail:', error);
        throw error;
      }

      // Transform the data to match the PaymentDetail interface
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        amountPence: data.amount_pence,
        dueDate: data.due_date,
        paymentType: data.payment_type,
        createdBy: {
          id: data.profiles?.id || '',
          name: data.profiles
            ? `${data.profiles.first_name || ''} ${data.profiles.last_name || ''}`.trim() ||
              'Unknown'
            : 'Unknown',
          avatarUrl: data.profiles?.profile_photo_uri,
        },
        team: {
          id: data.teams?.id || '',
          name: data.teams?.name || 'Unknown Team',
          imageUrl: data.teams?.team_photo_url,
        },
        paymentStatus: data.request_status,
        userPaymentStatus: 'pending', // This would need to be fetched from payment_request_members
      };
    } catch (error) {
      logger.error('Error in getPaymentDetail:', error);
      throw error;
    }
  },

  async cancelPaymentRequest(paymentRequestId: string): Promise<void> {
    try {
      const { getAuthUser } = await import('@lib/utils/get-auth-user');
      const { getSupabaseClient } = await import('@lib/supabase-dev');
      const user = await getAuthUser();
      const client = getSupabaseClient();

      const { error } = await client
        .from('payment_requests')
        .update({ request_status: 'cancelled' })
        .eq('id', paymentRequestId)
        .eq('created_by', user.id);

      if (error) {
        logger.error('Failed to cancel payment request:', error);
        throw error;
      }

      logger.log('Payment request cancelled:', paymentRequestId);
    } catch (error) {
      logger.error('Error in cancelPaymentRequest:', error);
      throw error;
    }
  },

  async initiatePayment(paymentRequestMemberId: string): Promise<{
    clientSecret: string;
    amount: number;
    currency: string;
    paymentIntentId: string;
    paymentId: string;
  }> {
    try {
      logger.log('Initiating payment for member:', paymentRequestMemberId);

      const { data, error } = await supabase.functions.invoke(
        'stripe-create-payment',
        {
          body: {
            payment_request_member_id: paymentRequestMemberId,
          },
        }
      );

      if (error) {
        logger.error('Failed to initiate payment:', error);
        throw new Error(error.message || 'Failed to create payment intent');
      }

      return data;
    } catch (error) {
      logger.error('Error in initiatePayment:', error);
      throw error;
    }
  },

  async checkPaymentStatus(paymentRequestMemberId: string): Promise<{
    status: 'unpaid' | 'paid' | 'failed' | 'processing';
    paidAt?: string;
    failureReason?: string;
  }> {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('payment_request_members')
        .select('payment_status, paid_at, failure_reason')
        .eq('id', paymentRequestMemberId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (error) {
        logger.error('Failed to check payment status:', error);
        throw error;
      }

      return {
        status: data.payment_status,
        paidAt: data.paid_at,
        failureReason: data.failure_reason,
      };
    } catch (error) {
      logger.error('Error in checkPaymentStatus:', error);
      throw error;
    }
  },

  async updatePaymentStatus(
    paymentRequestMemberId: string,
    status: 'paid' | 'failed' | 'processing'
  ): Promise<void> {
    try {
      logger.log('Updating payment status:', {
        paymentRequestMemberId,
        status,
      });

      const updateData: any = {
        payment_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      const client = getSupabaseClient();
      const { error } = await client
        .from('payment_request_members')
        .update(updateData)
        .eq('id', paymentRequestMemberId);

      if (error) {
        logger.error('Failed to update payment status:', error);
        throw error;
      }

      logger.log('Payment status updated successfully');
    } catch (error) {
      logger.error('Error in updatePaymentStatus:', error);
      throw error;
    }
  },

  async getUserPaymentHistory(userId: string): Promise<PaymentHistoryItem[]> {
    try {
      logger.log('[PAY-006] Fetching payment history for user:', userId);

      const client = getSupabaseClient();
      const { data, error } = await client
        .from('payment_request_members')
        .select(
          `
          id,
          payment_request_id,
          amount_pence,
          payment_status,
          paid_at,
          stripe_payment_intent_id,
          payment_requests!inner (
            title,
            description,
            created_by,
            teams!inner (
              name
            )
          )
        `
        )
        .eq('user_id', userId)
        .eq('payment_status', PaymentStatus.PAID)
        .order('paid_at', { ascending: false })
        .limit(PaymentUIConstants.PAYMENT_HISTORY_LIMIT);

      if (error) {
        logger.error('[PAY-006] Failed to load payment history:', error);
        throw error;
      }

      logger.log(
        '[PAY-006] Payment history loaded:',
        data?.length || 0,
        'items'
      );

      return (data || []).map(item => ({
        id: item.id,
        title: item.payment_requests.title,
        team_name: item.payment_requests.teams.name,
        amount_pence: item.amount_pence,
        payment_date: item.paid_at,
        status: PaymentStatus.PAID as PaymentHistoryStatusType,
        stripe_payment_intent_id: item.stripe_payment_intent_id,
      }));
    } catch (error) {
      logger.error('[PAY-006] Error loading payments:', error);
      throw error;
    }
  },

  async getPaymentHistoryDetail(paymentId: string): Promise<PaymentDetail> {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('payment_request_members')
        .select(
          `
          *,
          payment_requests!inner (
            title,
            description,
            created_by,
            teams!inner (
              name
            ),
            profiles!payment_requests_created_by_fkey (
              first_name,
              last_name,
              profile_photo_uri
            )
          ),
          payment_transactions (
            amount_pence,
            platform_fee_pence,
            net_amount_pence,
            stripe_charge_id
          )
        `
        )
        .eq('id', paymentId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (error) {
        logger.error('[PAY-006] Failed to load payment detail:', error);
        throw error;
      }

      logger.log('[PAY-006] Payment detail loaded for:', paymentId);

      const fullName = data.payment_requests.profiles
        ? `${data.payment_requests.profiles.first_name || ''} ${data.payment_requests.profiles.last_name || ''}`.trim() ||
          'Unknown'
        : 'Unknown';

      return {
        id: data.id,
        title: data.payment_requests.title,
        team_name: data.payment_requests.teams.name,
        amount_pence: data.amount_pence,
        payment_date: data.paid_at,
        status: data.payment_status as PaymentHistoryStatusType,
        description: data.payment_requests.description || '',
        requested_by: {
          name: fullName,
          avatar_url: data.payment_requests.profiles?.profile_photo_uri,
        },
        created_at: data.created_at,
        transaction_fee_pence:
          data.payment_transactions?.[0]?.platform_fee_pence,
        net_amount_pence: data.payment_transactions?.[0]?.net_amount_pence,
        stripe_payment_intent_id: data.stripe_payment_intent_id,
      };
    } catch (error) {
      logger.error('[PAY-006] Error in getPaymentHistoryDetail:', error);
      throw error;
    }
  },
};

// Helper function to transform database payment requests to the UI format
export async function getUserPaymentRequests(
  teamId: string,
  userId: string,
  timeFilter?: TimeFilterType
) {
  try {
    const data = await paymentsApi.getUserPaymentRequests(
      userId,
      teamId,
      timeFilter
    );

    // Transform the data to match the UI PaymentRequest interface
    return data.map((item: any) => ({
      id: item.payment_request_id || item.id,
      title: item.payment_requests?.title || '',
      amountPence: item.amount_pence || 0,
      dueDate: item.payment_requests?.due_date || null,
      paymentType: item.payment_requests?.payment_type || 'optional',
      paymentStatus: item.payment_status || 'pending',
      teamName: item.payment_requests?.teams?.name || '',
      createdAt: item.created_at || item.payment_requests?.created_at || '',
    }));
  } catch (error) {
    logger.error('Error fetching payment requests:', error);
    return [];
  }
}
