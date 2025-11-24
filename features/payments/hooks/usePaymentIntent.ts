import { useMutation } from '@tanstack/react-query';
import { createPaymentIntent } from '@top/features/payments';

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: createPaymentIntent,
  });
};
