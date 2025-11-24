import { useMutation } from '@tanstack/react-query';
import { CreateEventData } from '@top/lib/api/events';
import { createEvent } from '../api/event';

export function useCreateEvent() {
  return useMutation({
    mutationFn: ({
      payload,
      userId,
    }: {
      payload: CreateEventData;
      userId: string;
    }) => createEvent(payload, userId),
  });
}
