import { ShIcon, ShSpacer, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { fontSizes, fontWeights, ShTextVariant } from '@con/typography';
import { useEventDefaults } from '@lib/utils/event';
import { getEventTypeLabel } from '@top/constants/eventTypes';
import { RSVP_RESPONSE } from '@top/features/event/constants/eventResponse';
import { useEventSquadsSelect } from '@top/features/event/hooks/useEventSquadsSelect';
import { checkInvitationsStatus } from '@top/features/event/utils';
import { useUser } from '@top/hooks/useUser';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import RSVPButtons from './RSVPButtons';
import { EventInvitation } from '@top/features/event/types/event';
import { TimeFilterType } from '@top/hooks/useTimeFilter';

type EventCardProps = {
  eventItem: EventInvitation;
  onNavigate: (eventItem: EventInvitation) => void;
  eventFilter: TimeFilterType;
};

export default function EventCard({
  eventItem,
  onNavigate,
  eventFilter,
}: EventCardProps) {
  const { formatEventDate, formatEventTime } = useEventDefaults();
  const { user } = useUser();
  const userId = user?.id;

  const { data: dataEventCard } = useEventSquadsSelect(
    eventItem.event_id,
    userId
  );
  const isSelectedData = useMemo(() => {
    return dataEventCard?.eventSquads;
  }, [dataEventCard]);

  const isStatusData = useMemo(() => {
    return dataEventCard?.eventInvitations;
  }, [dataEventCard]);

  const isSelected = useMemo(() => {
    if (isSelectedData && userId) {
      const value = checkInvitationsStatus(isSelectedData, userId);
      return value;
    } else {
      return 0;
    }
  }, [isSelectedData]);

  const checkDisplayBell = useMemo(() => {
    return (
      isStatusData?.invitationStatus == 'pending' &&
      isSelectedData?.length === 0
    );
  }, [dataEventCard]);

  return (
    <View style={styles.eventCard}>
      <TouchableOpacity
        onPress={() => onNavigate(eventItem)}
        activeOpacity={0.7}
      >
        <View style={[styles.eventCardHeader]}>
          <View style={styles.eventCardTitleSection}>
            <ShText variant={ShTextVariant.Total} style={styles.eventTitle}>
              {eventItem.event.title}
            </ShText>
            <ShText
              variant={ShTextVariant.LabelLight}
              style={styles.eventTeamName}
            >
              {eventItem.event.teams?.name || 'Team'}
            </ShText>
          </View>
          <View style={styles.eventTypeTag}>
            <ShText
              variant={ShTextVariant.Caption}
              style={styles.eventTypeText}
            >
              {getEventTypeLabel(eventItem.event.event_type)}
            </ShText>
          </View>
          {checkDisplayBell && (
            <View style={{ marginLeft: spacing.sm }}>
              <ShIcon
                name={IconName.Alert}
                size={spacing.eventAlertIconSize}
                color={colorPalette.primaryGold}
                style={styles.eventAlertIcon}
              />
            </View>
          )}
        </View>
        <ShSpacer size={spacing.md} />

        <View style={styles.eventTimeRow}>
          <ShIcon
            name={IconName.CalendarOutline}
            size={spacing.iconSizeSmall}
            color={colorPalette.stoneGrey}
          />
          <ShText variant={ShTextVariant.Body} style={styles.eventDateTime}>
            {formatEventDate(eventItem.event.event_date)}
          </ShText>
          <ShText> </ShText>
          <ShIcon
            name={IconName.Clock}
            size={spacing.iconSizeSmall}
            color={colorPalette.stoneGrey}
          />
          <ShText variant={ShTextVariant.Body} style={styles.eventDateTime}>
            {formatEventTime(eventItem.event.start_time)}
          </ShText>
        </View>
      </TouchableOpacity>

      {isSelected === 0 ? (
        <RSVPButtons
          eventId={eventItem.event.id}
          teamId={eventItem.event.team_id}
          eventFilter={eventFilter}
          eventItem={eventItem}
        />
      ) : isSelected === 1 ? (
        <View style={styles.youAreIn}>
          <ShText style={styles.youAreInText}>Not this time!</ShText>
        </View>
      ) : (
        <View style={styles.youAreIn}>
          <ShText style={styles.youAreInText}>You&#39;re in!</ShText>
        </View>
      )}

      {eventItem.rsvp_response && (
        <ShText variant={ShTextVariant.Caption} style={styles.rsvpStatusText}>
          {eventItem.rsvp_response === RSVP_RESPONSE.YES
            ? 'You responded: Yes'
            : eventItem.rsvp_response === RSVP_RESPONSE.MAYBE
              ? 'You responded: Maybe'
              : 'You responded: No'}
        </ShText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: `rgba(0, 0, 0, 0.3)`,
    borderWidth: spacing.borderWidthThin,
    borderColor: `rgba(158, 155, 151, 0.2)`,
    borderRadius: spacing.eventCardBorderRadius,
    padding: spacing.eventCardPadding,
    // marginBottom: spacing.eventCardMarginBottom,
    gap: spacing.eventCardGap,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventCardTitleSection: {
    flex: 1,
  },
  eventTitle: {
    marginBottom: spacing.xs,
  },
  eventTeamName: {
    color: colorPalette.stoneGrey,
  },
  eventTypeTag: {
    backgroundColor: `rgba(158, 155, 151, 0.2)`,
    paddingVertical: spacing.eventTypeTagPadding,
    paddingHorizontal: spacing.eventTypeTagPaddingHorizontal,
    borderRadius: spacing.eventTypeTagBorderRadius,
    marginLeft: spacing.md,
  },
  eventTypeText: {
    color: colorPalette.textLight,
  },
  eventAlertIcon: {
    marginLeft: spacing.sm,
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.eventTimeRowGap,
  },
  eventDateTime: {
    color: colorPalette.stoneGrey,
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: spacing.eventButtonGap,
    marginTop: spacing.xs,
  },
  rsvpStatusText: {
    color: colorPalette.textLight,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  youAreIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: spacing.eventButtonHeight,
    padding: spacing.sm,
  },
  youAreInText: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.medium,
  },
});
