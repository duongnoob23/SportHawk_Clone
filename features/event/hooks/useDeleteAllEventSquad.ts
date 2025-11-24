import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeleteAllEventSquad } from '../api/event';
import { DeleteAllEventSquadType } from '../types/event';

export const useDeleteAllEventSquad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteAllEventSquadType) =>
      getDeleteAllEventSquad(payload),
    onSuccess: (data, variables) => {
      console.log(
        '✅ Delete All Eventsquad by eventId success:',
        variables.eventId
      );
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
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
      queryClient.invalidateQueries({
        queryKey: ['IsSelectedData', variables.eventId, variables.userId],
      });
    },
    onError: error => {
      console.error('❌ Delete All Eventsquad by eventId failed:', error);
    },
  });
};
