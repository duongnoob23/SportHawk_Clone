import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@top/lib/utils/logger';
import { getUpsertEventsquad } from '../api/event';
import { UpsertEventsquadType } from '../types/event';

export function useUpsertEventsquad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertEventsquadType) => getUpsertEventsquad(payload),

    onSuccess: (data, variables) => {
      logger.log('✅ Squad members updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['eventSquad', variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'EventDetailFix',
          variables.eventId,
          variables.userId,
          variables.teamId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['IsSelectedData', variables.eventId, variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
      queryClient.invalidateQueries({ queryKey: ['eventSquad',variables.eventId] });
    },

    onError: error => {
      console.error('❌ Failed to update squad:', error);
    },
  });
}
