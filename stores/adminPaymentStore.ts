import { create } from 'zustand';
import { supabase } from '@lib/supabase';
import { logger } from '@lib/utils/logger';
import { Database } from '@typ/database';
import { PaymentRequestStatus } from '@top/features/payments/constants/paymentStatus';

type PaymentRequest = Database['public']['Tables']['payment_requests']['Row'];
type PaymentRequestMember =
  Database['public']['Tables']['payment_request_members']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AdminPaymentRequest extends PaymentRequest {
  payment_request_members?: PaymentRequestMember[];
  profiles?: Profile;
  paid_count?: number;
  total_count?: number;
  teams?: {
    id: string;
    name: string;
    team_photo_url?: string;
    team_type?: string;
  };
}

export interface PaymentMemberDetail {
  user_id: string;
  name: string;
  avatar_url: string | null;
  payment_status: 'paid' | 'unpaid';
  amount_pence: number;
  paid_at?: string;
}

interface AdminPaymentStore {
  // List state
  paymentRequests: AdminPaymentRequest[];
  rawPaymentRequests: AdminPaymentRequest[]; // Store unfiltered data
  isLoadingList: boolean;
  listError: string | null;
  currentFilter: 'all' | 'this_week' | 'today' | 'this_month' | 'overdue';

  // Detail state
  currentPayment: AdminPaymentRequest | null;
  paymentMembers: PaymentMemberDetail[];
  isLoadingDetail: boolean;
  detailError: string | null;

  // Actions
  fetchTeamPaymentRequests: (teamId: string) => Promise<void>;
  fetchPaymentDetail: (paymentId: string) => Promise<void>;
  updatePaymentRequest: (
    paymentId: string,
    updates: Partial<PaymentRequest>
  ) => Promise<void>;
  cancelPaymentRequest: (paymentId: string, reason: string) => Promise<void>;
  sendReminders: (paymentId: string, recipientIds: string[]) => Promise<void>;
  setFilter: (filter: AdminPaymentStore['currentFilter']) => void;
  clearStore: () => void;
}

export const useAdminPaymentStore = create<AdminPaymentStore>((set, get) => ({
  // Initial state
  paymentRequests: [],
  rawPaymentRequests: [],
  isLoadingList: false,
  listError: null,
  currentFilter: 'all',
  currentPayment: null,
  paymentMembers: [],
  isLoadingDetail: false,
  detailError: null,

  fetchTeamPaymentRequests: async (teamId: string) => {
    set({ isLoadingList: true, listError: null });
    logger.log('[PAY-007] Fetching payment requests for team:', teamId);

    try {
      // Fetch payment requests with member counts
      const { data, error } = await supabase
        .from('payment_requests')
        .select(
          `
          *,
          payment_request_members!inner(
            id,
            payment_status
          ),
          teams:team_id (
            id,
            name,
            team_photo_url
          )
        `
        )
        .eq('team_id', teamId)
        .neq('request_status', PaymentRequestStatus.CANCELLED)
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Process data to add paid/total counts
      const processedData =
        data?.map(request => {
          const members = request.payment_request_members || [];
          const paidCount = members.filter(
            (m: any) => m.payment_status === 'paid'
          ).length;
          const totalCount = members.length;

          return {
            ...request,
            paid_count: paidCount,
            total_count: totalCount,
          };
        }) || [];

      // Store raw unfiltered data and apply current filter
      const filtered = applyFilter(processedData, get().currentFilter);

      set({
        rawPaymentRequests: processedData, // Store raw data for re-filtering
        paymentRequests: filtered,
        isLoadingList: false,
      });

      logger.debug('[PAY-007] Payments loaded:', {
        total: processedData.length,
        filtered: filtered.length,
        filter: get().currentFilter,
      });
    } catch (error: any) {
      logger.error('[PAY-007] Failed to fetch payment requests:', error);
      set({
        listError: error.message || 'Failed to load payment requests',
        isLoadingList: false,
      });
    }
  },

  fetchPaymentDetail: async (paymentId: string) => {
    set({ isLoadingDetail: true, detailError: null });
    logger.log('[PAY-007] Fetching payment details:', paymentId);

    try {
      // Fetch payment request details
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_requests')
        .select(
          `
          *,
          profiles:created_by(
            id,
            first_name,
            last_name,
            profile_photo_uri
          )
        `
        )
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;

      // Fetch member details
      const { data: memberData, error: memberError } = await supabase
        .from('payment_request_members')
        .select(
          `
          *,
          profiles:user_id(
            id,
            first_name,
            last_name,
            profile_photo_uri
          )
        `
        )
        .eq('payment_request_id', paymentId);

      if (memberError) throw memberError;

      // Process member data
      const members: PaymentMemberDetail[] =
        memberData?.map(member => ({
          user_id: member.user_id,
          name: `${member.profiles?.first_name || ''} ${member.profiles?.last_name || ''}`.trim(),
          avatar_url: member.profiles?.profile_photo_uri || null,
          payment_status: member.payment_status as 'paid' | 'unpaid',
          amount_pence: member.amount_pence,
          paid_at: member.paid_at,
        })) || [];

      set({
        currentPayment: paymentData,
        paymentMembers: members,
        isLoadingDetail: false,
      });

      logger.debug('[PAY-007] Payment detail loaded:', {
        paymentId,
        memberCount: members.length,
      });
    } catch (error: any) {
      logger.error('[PAY-007] Failed to fetch payment detail:', error);
      set({
        detailError: error.message || 'Failed to load payment details',
        isLoadingDetail: false,
      });
    }
  },

  updatePaymentRequest: async (
    paymentId: string,
    updates: Partial<PaymentRequest>
  ) => {
    logger.log('[PAY-007] Updating payment request:', { paymentId, updates });

    try {
      const { error } = await supabase
        .from('payment_requests')
        .update(updates)
        .eq('id', paymentId);

      if (error) throw error;

      // Refresh current payment if it's being viewed
      if (get().currentPayment?.id === paymentId) {
        await get().fetchPaymentDetail(paymentId);
      }

      logger.log('[PAY-007] Payment updated successfully');
    } catch (error: any) {
      logger.error('[PAY-007] Failed to update payment:', error);
      throw error;
    }
  },

  cancelPaymentRequest: async (paymentId: string, reason: string) => {
    logger.log('[PAY-007] Cancelling payment request:', { paymentId, reason });

    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      logger.log('[PAY-007] Payment cancelled successfully');
    } catch (error: any) {
      logger.error('[PAY-007] Failed to cancel payment:', error);
      throw error;
    }
  },

  sendReminders: async (paymentId: string, recipientIds: string[]) => {
    logger.log('[PAY-007] Sending reminders:', {
      paymentId,
      recipients: recipientIds.length,
    });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke(
        'send-payment-reminders',
        {
          body: {
            payment_request_id: paymentId,
            recipient_ids: recipientIds,
            reminder_type: recipientIds.length > 1 ? 'bulk' : 'individual',
          },
        }
      );

      if (response.error) throw response.error;

      logger.log('[PAY-007] Reminders sent successfully:', response.data);
    } catch (error: any) {
      logger.error('[PAY-007] Failed to send reminders:', error);
      throw error;
    }
  },

  setFilter: (filter: AdminPaymentStore['currentFilter']) => {
    logger.log('[PAY-007] Filter changed to:', filter);

    // Re-apply filter to raw unfiltered data
    const { rawPaymentRequests } = get();
    const filtered = applyFilter(rawPaymentRequests, filter);

    set({
      currentFilter: filter,
      paymentRequests: filtered,
    });

    logger.debug('[PAY-007] Filter applied:', {
      filter,
      total: rawPaymentRequests.length,
      filtered: filtered.length,
    });
  },

  clearStore: () => {
    logger.log('[PAY-007] Clearing admin payment store');
    set({
      paymentRequests: [],
      rawPaymentRequests: [],
      currentPayment: null,
      paymentMembers: [],
      listError: null,
      detailError: null,
    });
  },
}));

// Helper function to apply filters
function applyFilter(
  data: AdminPaymentRequest[],
  filter: AdminPaymentStore['currentFilter']
): AdminPaymentRequest[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today': {
      return data.filter(p => {
        const dueDate = new Date(p.due_date);
        return dueDate.toDateString() === today.toDateString();
      });
    }

    case 'this_week': {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return data.filter(p => {
        const dueDate = new Date(p.due_date);
        return dueDate >= today && dueDate <= weekFromNow;
      });
    }

    case 'this_month': {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return data.filter(p => {
        const dueDate = new Date(p.due_date);
        return dueDate >= today && dueDate <= endOfMonth;
      });
    }

    case 'overdue': {
      return data.filter(p => {
        const dueDate = new Date(p.due_date);
        const status = (p as any).status;
        return (
          dueDate < today &&
          status !== PaymentRequestStatus.CANCELLED &&
          status !== PaymentRequestStatus.COMPLETED
        );
      });
    }

    case 'all':
    default:
      return data;
  }
}
