import { logger } from '@lib/utils/logger';
import { supabase } from '@lib/supabase';

export const sendPaymentNotifications = async (
  paymentRequestId: string,
  memberIds: string[]
): Promise<void> => {
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
      throw error;
    }

    logger.log('Payment notifications sent successfully');
  } catch (err) {
    logger.error('Notification error:', err);
    throw err;
  }
};
