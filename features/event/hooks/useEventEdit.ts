import { useQuery } from '@tanstack/react-query';
import { getEventEdit } from '../api/event';

export function useEventEdit(eventId?: string) {
  return useQuery({
    queryKey: ['editEventData', eventId],
    queryFn: () => getEventEdit(eventId!),
    enabled: !!eventId,
    staleTime: 30_000,
  });
}
