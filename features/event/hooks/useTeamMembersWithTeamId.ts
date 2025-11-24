import { useQuery } from '@tanstack/react-query';
import { getTeamMembersWithTeamId } from '../api/event';

export function useTeamMembersWithTeamId(teamId?: string) {
  return useQuery({
    queryKey: ['teamMembersWithTeamId', teamId],
    queryFn: () => getTeamMembersWithTeamId(teamId!),
    placeholderData: { memberData: [], userIds: [] },
    enabled: !!teamId,
    staleTime: 30_000,
  });
}
