import { logger } from '@lib/utils/logger';
import { supabase } from '@lib/supabase';

interface CreatePaymentIntentRequest {
  paymentRequestMemberId: string;
  amountPence: number;
  currency: string;
  paymentRequestId: string;
  userId: string;
  paymentMethodType?: 'card' | 'apple' | 'google';
}

interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const createPaymentIntent = async (
  request: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> => {
  const { data, error } = await supabase.functions.invoke(
    'stripe-create-payment',
    {
      body: {
        payment_request_member_id: request.paymentRequestMemberId,
        amount_pence: request.amountPence,
        currency: request.currency,
        payment_request_id: request.paymentRequestId,
        user_id: request.userId,
        payment_method_type: request.paymentMethodType || 'card',
      },
    }
  );

  if (error) {
    logger.error('Failed to create payment intent:', error);
    throw new Error(error.message || 'Failed to create payment intent');
  }

  if (!data?.client_secret) {
    logger.error('No client_secret in response:', data);
    throw new Error('Failed to create payment intent');
  }

  return {
    clientSecret: data.client_secret,
    paymentIntentId: data.payment_intent_id || '',
  };
};
