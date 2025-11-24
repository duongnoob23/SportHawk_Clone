import { useQuery } from '@tanstack/react-query';
import { getTeam } from '@top/features/payments/apis/teams';

export const useGetTeam = (teamId: string) => {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => getTeam(teamId),
    enabled: !!teamId,
  });
};
