import { useQuery } from '@tanstack/react-query';
import { getTeamAdminsSimple } from '../api/event';
import { LeaderData1 } from '../types';

export function useTeamAdminsSimple(teamId?: string, eventId?: string) {
  return useQuery<{ leaderData: LeaderData1[]; userIds: string[] }>({
    queryKey: ['editLeaderData', teamId, eventId],
    queryFn: () => getTeamAdminsSimple(teamId!, eventId!),
    placeholderData: { leaderData: [], userIds: [] },
    enabled: !!teamId && !!eventId,
    staleTime: 30_000,
  });
}
