import { getUserPaymentRequests } from '@lib/api/payments';
import { useQuery } from '@tanstack/react-query';
import { TimeFilterType } from '@top/hooks/useTimeFilter';

export function useTeamPaymentRequests(
  teamId?: string,
  userId?: string,
  timeFilter?: TimeFilterType
) {
  return useQuery<Awaited<ReturnType<typeof getUserPaymentRequests>>>({
    queryKey: ['payments', teamId, userId, timeFilter],
    queryFn: () =>
      getUserPaymentRequests(teamId as string, userId as string, timeFilter),
    enabled: !!teamId && !!userId,
  });
}