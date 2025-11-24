import { useQuery } from '@tanstack/react-query';
import { getEventDetail } from '../api/event';
import { EventDetailData } from '../types';
import { EventDetailType } from '../types/event';

export const useEventDetail = (payload: EventDetailType) => {
  return useQuery<EventDetailData>({
    queryKey: [
      'EventDetailFix',
      payload.eventId,
      payload.userId,
      payload.teamId,
    ],
    queryFn: async ({ queryKey }) => {
      const [, eventId, userId, teamId] = queryKey as [
        string,
        string | undefined,
        string | undefined,
        string | undefined,
      ]; // 👈 ép kiểu rõ ràng
      return getEventDetail(payload);
    },
    enabled: !!payload.eventId && !!payload.teamId && !!payload,
  });
};
