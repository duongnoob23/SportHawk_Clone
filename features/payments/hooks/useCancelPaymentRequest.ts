import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@lib/utils/logger';
import {
  cancelPaymentRequest,
  CancelPaymentRequestInput,
} from '@top/features/payments/apis/cancelPaymentRequest';
import { useAdminPaymentStore } from '@sto/adminPaymentStore';

/**
 * Hook to cancel a payment request
 */
export const useCancelPaymentRequest = () => {
  const queryClient = useQueryClient();
  const { fetchTeamPaymentRequests, currentPayment } = useAdminPaymentStore();

  return useMutation({
    mutationFn: (input: CancelPaymentRequestInput) =>
      cancelPaymentRequest(input),
    onSuccess: async data => {
      // Invalidate payment request queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['paymentRequest'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequestWithMember'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });

      // Refresh the admin payment store if we have a current payment
      if (currentPayment?.team_id) {
        await fetchTeamPaymentRequests(currentPayment.team_id);
      }

      logger.log('Payment request cancelled successfully:', {
        paymentRequestId: data.paymentRequestId,
        cancelledAt: data.cancelledAt,
      });
    },
    onError: error => {
      logger.error('Failed to cancel payment request:', error);
    },
  });
};
