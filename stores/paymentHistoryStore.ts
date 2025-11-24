import { create } from 'zustand';
import { paymentsApi } from '@lib/api/payments';
import { logger } from '@lib/utils/logger';
import {
  PaymentSortOptions,
  PaymentSortType,
} from '@top/features/payments/constants';
import { PaymentHistoryStatusType } from '@top/features/payments/types';

interface PaymentHistoryItem {
  id: string;
  title: string;
  team_name: string;
  amount_pence: number;
  payment_date: string;
  status: PaymentHistoryStatusType;
  stripe_payment_intent_id?: string;
}

interface PaymentHistoryStore {
  payments: PaymentHistoryItem[];
  isLoading: boolean;
  error: string | null;
  sortBy: PaymentSortType;

  fetchPaymentHistory: (userId: string) => Promise<void>;
  setSortBy: (sort: PaymentSortType) => void;
  clearHistory: () => void;
}

export const usePaymentHistoryStore = create<PaymentHistoryStore>(
  (set, get) => ({
    payments: [],
    isLoading: false,
    error: null,
    sortBy: PaymentSortOptions.RECENT,

    fetchPaymentHistory: async (userId: string) => {
      set({ isLoading: true, error: null });

      logger.log('[PAY-006] Refreshing payment list');

      try {
        const data = await paymentsApi.getUserPaymentHistory(userId);

        // Apply current sort
        const sortedData = sortPayments(data, get().sortBy);

        set({ payments: sortedData, isLoading: false });

        logger.debug('[PAY-006] Store state updated:', {
          sortBy: get().sortBy,
          itemCount: data.length,
        });
      } catch (error: any) {
        logger.error('[PAY-006] Failed to fetch payment history:', error);
        set({
          error: error.message || 'Failed to load payment history',
          isLoading: false,
        });
      }
    },

    setSortBy: (sortBy: PaymentSortType) => {
      logger.log('[PAY-006] Sort changed to:', sortBy);

      set({ sortBy });
      const { payments } = get();

      const sorted = sortPayments(payments, sortBy);
      set({ payments: sorted });

      logger.debug('[PAY-006] Payments re-sorted with:', sortBy);
    },

    clearHistory: () => {
      logger.log('[PAY-006] Clearing payment history store');
      set({ payments: [], error: null });
    },
  })
);

// Helper function to sort payments
function sortPayments(
  data: PaymentHistoryItem[],
  sortBy: PaymentSortType
): PaymentHistoryItem[] {
  return [...data].sort((a, b) => {
    switch (sortBy) {
      case PaymentSortOptions.RECENT:
        return (
          new Date(b.payment_date).getTime() -
          new Date(a.payment_date).getTime()
        );
      case PaymentSortOptions.OLDEST:
        return (
          new Date(a.payment_date).getTime() -
          new Date(b.payment_date).getTime()
        );
      case PaymentSortOptions.AMOUNT_HIGH:
        return b.amount_pence - a.amount_pence;
      case PaymentSortOptions.AMOUNT_LOW:
        return a.amount_pence - b.amount_pence;
      default:
        return 0;
    }
  });
}
