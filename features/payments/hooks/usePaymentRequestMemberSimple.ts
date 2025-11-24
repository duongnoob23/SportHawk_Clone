import { useQuery } from '@tanstack/react-query';
import { getPaymentRequestMemberSimple, GetPaymentRequestMemberType } from '..';

export const usePaymentRequestMemberSimple = (
  payload: GetPaymentRequestMemberType
) => {
  return useQuery({
    queryKey: [
      'PaymentRequestMmeberSimple',
      payload.teamId,
      payload.paymentRequestId,
    ],
    queryFn: () => getPaymentRequestMemberSimple(payload),
    placeholderData: { memberData: [], userIds: [] },
    enabled: !!payload.teamId && !!payload.paymentRequestId,
    staleTime: 30_000,
  });
};
