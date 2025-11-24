function mapInvitationStatusToRsvp(status: InvitationStatusType) {
  switch (status) {
    case INVITATION_STATUS.ACCEPTED:
      return RSVP_RESPONSE.YES;
    case INVITATION_STATUS.DECLINED:
      return RSVP_RESPONSE.NO;
    case INVITATION_STATUS.MAYBE:
      return RSVP_RESPONSE.MAYBE;
    default:
      return RSVP_RESPONSE.PENDING;
  }
}

function mapRsvpToInvitationStatus(
  response: RSVPResponseType
): InvitationStatus {
  switch (response) {
    case RSVP_RESPONSE.YES:
      return INVITATION_STATUS.ACCEPTED;
    case RSVP_RESPONSE.MAYBE:
      return INVITATION_STATUS.MAYBE;
    case RSVP_RESPONSE.NO:
      return INVITATION_STATUS.DECLINED;
    default:
      return INVITATION_STATUS.PENDING;
  }
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InvitationStatus } from '@top/features/teams/constants';
import { logger } from '@top/lib/utils/logger';
import { EventInvitation } from '../../../lib/api/events';
import { RSVPResponseType } from '../../teams/types';
import { getUpdateEventInvitationHandGesture } from '../api/event';
import { INVITATION_STATUS, RSVP_RESPONSE } from '../constants/eventResponse';
import {
  EventLocation,
  InvitationResponder,
  InvitationStatusType,
  RSVPCounts,
} from '../types';
import { UpdateEventInvitationHandGestureType } from '../types/event';

type DetailsProps = {
  counts: RSVPCounts;
  responders: InvitationResponder[];
  eventLocation: EventLocation | undefined;
  dataInvitations: EventInvitation;
};

export function useUpdateEventByIdInvitationHandGesture(
  onSuccess?: (eventId: string, userId: string) => void,
  onError?: (error: unknown) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEventInvitationHandGestureType) => {
      return getUpdateEventInvitationHandGesture(payload);
    },

    onMutate: async ({
      id,
      userId,
      eventId,
      preResponse,
      response,
      teamId,
    }) => {
      await queryClient.cancelQueries({
        queryKey: ['eventDetailsData', eventId, userId, teamId],
      });
      await queryClient.cancelQueries({
        queryKey: ['invitationStatus', eventId, userId, teamId],
      });

      const prevDetails = queryClient.getQueryData<any>([
        'eventDetailsData',
        eventId,
        userId,
        teamId,
      ]);

      queryClient.setQueryData<DetailsProps>(
        ['eventDetailsData', eventId, userId, teamId],
        old => {
          if (!old) return old;

          const oldStatus = mapInvitationStatusToRsvp(preResponse);
          const newStatus = response;
          const updatedCounts = { ...old.counts };

          switch (oldStatus) {
            case RSVP_RESPONSE.YES:
              updatedCounts.yes -= 1;
              break;
            case RSVP_RESPONSE.NO:
              updatedCounts.no -= 1;
              break;
            case RSVP_RESPONSE.MAYBE:
              updatedCounts.maybe -= 1;
              break;
            case RSVP_RESPONSE.PENDING:
              updatedCounts.none -= 1;
              break;
          }

          switch (newStatus) {
            case RSVP_RESPONSE.YES:
              updatedCounts.yes += 1;
              break;
            case RSVP_RESPONSE.NO:
              updatedCounts.no += 1;
              break;
            case RSVP_RESPONSE.MAYBE:
              updatedCounts.maybe += 1;
              break;
          }

          return {
            ...old,
            counts: updatedCounts,
            dataInvitations: {
              ...old.dataInvitations,
              invitation_status: mapRsvpToInvitationStatus(response),
            },
            responders: old.responders.map((r: any) =>
              r.id === id
                ? {
                    ...r,
                    invitation_status: mapRsvpToInvitationStatus(response),
                  }
                : r
            ),
          };
        }
      );

      return { prevDetails };
    },

    onError: (error, { eventId, userId, teamId }, context) => {
      console.error('❌ Failed to update RSVP:', error);
      if (context?.prevDetails) {
        queryClient.setQueryData(
          ['eventDetailsData', eventId, userId, teamId],
          context.prevDetails
        );
      }

      if (onError) onError(error);
    },

    onSuccess: (_, { eventId, userId, teamId }) => {
      logger.log('✅ RSVP updated successfully');
      if (onSuccess) onSuccess(eventId, userId);
      queryClient.invalidateQueries({
        queryKey: ['eventDetailsData', eventId, userId, teamId],
      });
    },

    // onSettled: (_,_,variables) => {
    //   queryClient.invalidateQueries({ queryKey: ['eventDetailsData', eventId, userId, teamId] });
    // },
  });
}
