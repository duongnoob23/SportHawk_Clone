import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEvent } from '../api/event';
import { DeleteEventData } from '../types/event';

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeleteEventData) => deleteEvent(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
    },
  });
};
