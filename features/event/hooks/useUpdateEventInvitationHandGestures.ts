import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@top/lib/utils/logger';
import { getUpdateEventInvitationHandGestures } from '../api/event';
import { UpdateEventInvitationHandGesturesType } from '../types/event';

export function useUpdateEventInvitationHandGestures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      userId,
      response,
      teamId,
      eventFilter,
    }: UpdateEventInvitationHandGesturesType) => {
      const result = getUpdateEventInvitationHandGestures({
        eventId,
        userId,
        response,
        teamId,
        eventFilter,
      });
      return result;
    },
    onSuccess: (data, value) => {
      logger.log('✅ Specific invitation updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['invitationStatus', value.userId, value.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'eventDetailsData',
          value.eventId,
          value.userId,
          value.teamId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['EventDetailFix', value.eventId, value.userId, value.teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ['IsSelectedData', value.eventId, value.userId],
      });
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
    },
    onError: error => {
      logger.error('❌ Failed to useUpdateEventInvitationHandGestures', error);
    },
  });
}
