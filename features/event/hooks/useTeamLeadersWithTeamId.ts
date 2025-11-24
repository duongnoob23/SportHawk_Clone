import { useQuery } from '@tanstack/react-query';
import { getTeamLeadersWithTeamId } from '../api/event';

export function useTeamLeadersWithTeamId(teamId?: string) {
  return useQuery({
    queryKey: ['teamLeadersWithTeamId', teamId],
    queryFn: () => getTeamLeadersWithTeamId(teamId!),
    placeholderData: { leaderData: [], userIds: [] },
    enabled: !!teamId,
    staleTime: 30_000,
  });
}
