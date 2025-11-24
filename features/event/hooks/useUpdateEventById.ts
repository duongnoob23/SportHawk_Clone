import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEventById } from '../api/event';
import { UpdateEventByIdType } from '../types/event';

export function useUpdateEventById(
  onSuccess?: (data: any) => void,
  onError?: (error: unknown) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEventByIdType) => {
      return updateEventById(payload);
    },
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [
          'EventDetailFix',
          variables.eventId,
          variables.adminId,
          variables.teamId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
      queryClient.invalidateQueries({
        queryKey: ['invitationStatus', variables.adminId, variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ['eventSquad', variables.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ['editEventData', data.id] });

      if (variables.teamId) {
        queryClient.invalidateQueries({
          queryKey: ['editMemberData', variables.teamId, data.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['editLeaderData', variables.teamId, data.id],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ['IsSelectedData', variables.eventId, variables.adminId],
      });

      if (onSuccess) onSuccess(data);
    },
    onError,
  });
}
