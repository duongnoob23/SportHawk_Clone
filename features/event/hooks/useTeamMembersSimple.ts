import { useQuery } from '@tanstack/react-query';
import { getTeamMembersSimple } from '../api/event';
import { TeamMembersSimpleData } from '../types/event';

export function useTeamMembersSimple(payload: TeamMembersSimpleData) {
  return useQuery({
    queryKey: ['editMemberData', payload.teamId, payload.eventId],
    queryFn: () => getTeamMembersSimple(payload),
    placeholderData: { memberData: [], userIds: [] },
    enabled: !!payload.teamId && !!payload.eventId,
    staleTime: 30_000,
  });
}
