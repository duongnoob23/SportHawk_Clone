import { useQuery } from '@tanstack/react-query';
import { getEventSquad } from '../api/event';
import { EventSquadData } from '../types/event';

export function useEventSquad(payload?: EventSquadData) {
  return useQuery({
    queryKey: ['eventSquad', payload?.eventId],
    queryFn: () => getEventSquad(payload!),
  });
}
