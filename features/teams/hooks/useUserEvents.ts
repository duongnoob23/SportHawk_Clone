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
      if (!userId) {
        console.warn(
          'useUserEvents: userId is undefined, returning empty array'
        );
        return [];
      }
      const res = await getUserEvents(teamId, userId, timeFilter);
      return res;
    },
    enabled: !!userId && userId !== undefined,
  });
}
