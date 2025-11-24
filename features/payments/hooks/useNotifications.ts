import { useMutation } from '@tanstack/react-query';
import { sendPaymentNotifications } from '@top/features/payments/apis/notifications';

export const useSendPaymentNotifications = () => {
  return useMutation({
    mutationFn: ({
      paymentRequestId,
      memberIds,
    }: {
      paymentRequestId: string;
      memberIds: string[];
    }) => sendPaymentNotifications(paymentRequestId, memberIds),
  });
};
