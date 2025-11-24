import { useQuery } from '@tanstack/react-query';
import { getEventInvitationsStatus } from '../api/event';
import { EventInvitationsStatusType } from '../types/event';

export function useEventInvitationsStatus(payload: EventInvitationsStatusType) {
  return useQuery({
    queryKey: ['invitationStatus', payload.userId, payload.eventId],
    queryFn: ({ queryKey }) => {
      const [, userId, eventId] = queryKey;
      return getEventInvitationsStatus(payload);
    },
    enabled: !!payload.userId && !!payload.eventId,
    staleTime: 30_000,
  });
}
