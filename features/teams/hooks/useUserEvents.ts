import { getUserEvents } from '@lib/api/events';
import { useQuery } from '@tanstack/react-query';
import { EventInvitation } from '@top/features/event/types/event';
import { TimeFilterType } from '@top/hooks/useTimeFilter';

export function useUserEvents(
  teamId?: string,
  userId?: string,
  timeFilter?: TimeFilterType
) {
  return useQuery<EventInvitation[]>({
    queryKey: ['userEvents', userId, teamId, timeFilter],
    queryFn: async () => {
      const res = await getUserEvents(
        teamId as string,
        userId as string,
        timeFilter
      );
      return res;
    },
    enabled: !!userId,
  });
}
