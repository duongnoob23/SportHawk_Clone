import { useQuery } from '@tanstack/react-query';
import { getTeamEvents } from '@lib/api/events';
import { TimeFilterType } from '@top/hooks/useTimeFilter';

export function useTeamEvents(teamId?: string, timeFilter?: TimeFilterType) {
  return useQuery({
    queryKey: ['teamEvents', teamId, timeFilter],
    queryFn: () => getTeamEvents(teamId as string, timeFilter),
    enabled: Boolean(teamId),
  });
}
