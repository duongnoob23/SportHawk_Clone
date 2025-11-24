import { useQuery } from '@tanstack/react-query';
import { getEventSquadsSelect } from '../api/event';
import { EventSquadsSelectData } from '../types';

export const useEventSquadsSelect = (eventId?: string, userId?: string) => {
  return useQuery<EventSquadsSelectData>({
    queryKey: ['IsSelectedData', eventId, userId],
    queryFn: async ({ queryKey }) => {
      const [, eventId, userId] = queryKey as [
        string,
        string | undefined,
        string | undefined,
      ];
      return getEventSquadsSelect(eventId!, userId!);
    },
    enabled: !!eventId && !!userId,
  });
};
