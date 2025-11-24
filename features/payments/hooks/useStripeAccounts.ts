import { useQuery } from '@tanstack/react-query';
import { getTeamStripeAccount } from '@top/features/payments/apis/stripeAccounts';

export const useGetTeamStripeAccount = (teamId: string) => {
  return useQuery({
    queryKey: ['stripeAccount', teamId],
    queryFn: () => getTeamStripeAccount(teamId),
    enabled: !!teamId,
  });
};
