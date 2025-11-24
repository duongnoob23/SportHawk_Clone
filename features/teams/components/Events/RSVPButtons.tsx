import { ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { useUser } from '@hks/useUser';
import {
  EVENT_TYPE,
  INVITATION_STATUS,
  RSVP_RESPONSE,
} from '@top/features/event/constants/eventResponse';
import { useEventInvitationsStatus } from '@top/features/event/hooks/useEventInvitationsStatus';
import { useEventDetailsResponseNotification } from '@top/features/event/hooks/useNotification';
import { useUpdateEventInvitationHandGestures } from '@top/features/event/hooks/useUpdateEventInvitationHandGestures';
import { InvitationStatusType } from '@top/features/event/types';
import { useEventDefaults } from '@top/lib/utils/event';
import { logger } from '@top/lib/utils/logger';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { RSVPResponseType, TimeFilterType, UserEvent } from '../../types';

type Props = {
  eventId?: string;
  teamId?: string;
  handGesture?: (response: RSVPResponseType) => void;
  eventFilter?: TimeFilterType;
  eventItem?: UserEvent;
};

export default function RSVPButtons({
  eventId,
  teamId,
  handGesture,
  eventFilter,
  eventItem,
}: Props) {
  const { formatEventDate, formatEventTime } = useEventDefaults();
  const { mutate: updateHandGestrue } = useUpdateEventInvitationHandGestures();
  const { user } = useUser();
  const userId = user?.id;
  const { data: initData } = useEventInvitationsStatus({
    eventId,
    userId,
  });
  const [currentStatus, setCurrentStatus] = useState<InvitationStatusType>(
    INVITATION_STATUS.PENDING
  );

  useEffect(() => {
    setCurrentStatus(initData?.invitationStatus || INVITATION_STATUS.PENDING);
  }, [initData]);

  const { mutateAsync: createRSVPNoti, isPending: isPendingRSVPNoti } =
    useEventDetailsResponseNotification();

  const handleThumbs = async (response: RSVPResponseType) => {
    try {
      await updateHandGestrue({
        eventId: eventId,
        userId: userId,
        response: response,
        teamId: teamId,
        eventFilter: eventFilter,
      });

      const playerName = `${user?.user_metadata.first_name} ${user?.user_metadata.last_name}`;
      const userIdAdmin = eventItem?.event.created_by;

      const eventDate = formatEventDate(eventItem?.event.event_date);
      const startTime = formatEventTime(eventItem?.event.start_time);

      const eventTitle =
        eventItem?.event.event_type == EVENT_TYPE.TRAINING
          ? 'Training'
          : eventItem?.event.event_type == EVENT_TYPE.OTHER
            ? 'Other'
            : eventItem?.event.title;

      if (userIdAdmin && playerName && response && eventItem && eventId) {
        await createRSVPNoti({
          userId: userIdAdmin,
          playerName: playerName,
          availabilityStatus: response,
          eventName: eventItem?.event.title,
          eventDate: `${eventDate} ${startTime}`,
          eventId: eventId,
          eventTitle: eventTitle!,
        });
      } else {
        logger.log('Missing params in createRSVPNoti');
        return;
      }
    } catch (error) {
      console.error('Error when thumbs in RSVP button');
      throw error;
    }
  };

  return (
    <View style={styles.rsvpButtons}>
      <TouchableOpacity
        style={[
          styles.rsvpButton,
          currentStatus === INVITATION_STATUS.ACCEPTED && styles.rsvpAttending,
        ]}
        onPress={() => handleThumbs(RSVP_RESPONSE.YES)}
      >
        <View style={{ padding: spacing.xxs }}>
          <ShText style={styles.rsvpEmoji}>👍🏼</ShText>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.rsvpButton,
          currentStatus === INVITATION_STATUS.MAYBE && styles.rsvpMaybe,
        ]}
        onPress={() => handleThumbs(RSVP_RESPONSE.MAYBE)}
      >
        <View style={{ padding: spacing.xxs }}>
          <ShText style={styles.rsvpEmoji}>🫳🏼</ShText>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.rsvpButton,
          currentStatus === INVITATION_STATUS.DECLINED &&
            styles.rsvpNotAttending,
        ]}
        onPress={() => handleThumbs(RSVP_RESPONSE.NO)}
      >
        <View style={{ padding: spacing.xxs }}>
          <ShText style={styles.rsvpEmoji}>👎🏼</ShText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  rsvpButtons: {
    flexDirection: 'row',
    gap: spacing.eventButtonGap,
  },
  rsvpButton: {
    flex: 1,
    height: spacing.eventButtonHeight,
    backgroundColor: `rgba(0, 0, 0, 0.3)`,
    // backgroundColor: 'red',
    borderWidth: spacing.borderWidthThin,
    borderColor: `rgba(158, 155, 151, 0.2)`,
    borderRadius: spacing.eventButtonBorderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rsvpButtonYes: {
    // Default state
  },
  rsvpButtonYesActive: {
    backgroundColor: `rgba(39, 174, 96, 0.8)`,
  },
  rsvpButtonMaybe: {
    // Default state
  },
  rsvpButtonMaybeActive: {
    backgroundColor: `rgba(243, 156, 18, 0.8)`,
  },
  rsvpButtonNo: {
    // Default state
  },
  rsvpButtonNoActive: {
    backgroundColor: `rgba(231, 76, 60, 0.8)`,
  },
  rsvpEmoji: {
    fontSize: spacing.lg,
  },
  rsvpAttending: {
    backgroundColor: colorPalette.attending,
  },
  rsvpNotAttending: {
    backgroundColor: colorPalette.not_attending,
  },
  rsvpMaybe: {
    backgroundColor: colorPalette.maybe,
  },
});
