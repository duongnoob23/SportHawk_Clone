import { logger } from '@lib/utils/logger';
import { supabase } from '@lib/supabase';
import { PaymentRequestStatus } from '@top/features/payments/constants/paymentStatus';

export interface CancelPaymentRequestInput {
  paymentRequestId: string;
  reason: string;
}

export interface CancelPaymentRequestResult {
  success: boolean;
  paymentRequestId: string;
  cancelledAt: string;
}

/**
 * Cancels a payment request with reason
 */
export const cancelPaymentRequest = async (
  input: CancelPaymentRequestInput
): Promise<CancelPaymentRequestResult> => {
  try {
    logger.log('Cancelling payment request:', {
      paymentRequestId: input.paymentRequestId,
      reason: input.reason,
    });

    const { data, error } = await supabase
      .from('payment_requests')
      .update({
        request_status: PaymentRequestStatus.CANCELLED,
        cancellation_reason: input.reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', input.paymentRequestId)
      .select(
        `
        id,
        requestStatus:request_status,
        cancelledAt:cancelled_at,
        cancellationReason:cancellation_reason
      `
      )
      .single();

    if (error) {
      logger.error('Failed to cancel payment request:', error);
      throw error;
    }

    logger.log('Payment request cancelled successfully:', {
      paymentRequestId: data.id,
      cancelledAt: data.cancelledAt,
    });

    return {
      success: true,
      paymentRequestId: data.id,
      cancelledAt: data.cancelledAt,
    };
  } catch (err) {
    logger.error('Error cancelling payment request:', err);
    throw err;
  }
};
