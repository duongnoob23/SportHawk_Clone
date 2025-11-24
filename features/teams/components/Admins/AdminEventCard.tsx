import { ShIcon, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { getEventTypeLabel } from '@con/eventTypes';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import type { Event } from '@lib/api/events';
import { useEventDefaults } from '@lib/utils/event';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface AdminEventCardProps {
  event: Event;
  onManageEvent: (event: Event) => void;
  onManageSquad: (event: Event) => void;
  onManageLeaders: (event: Event) => void;
  onEditEvent: (event: Event) => void;
}

export const AdminEventCard: React.FC<AdminEventCardProps> = ({
  event,
  onManageEvent,
  onManageSquad,
  onManageLeaders,
  onEditEvent,
}) => {
  const { formatEventDate, formatEventTime } = useEventDefaults();
  const eventTypeLabel = getEventTypeLabel(event.event_type);
  const formattedDate = formatEventDate(event.event_date);
  const formattedTime = formatEventTime(event.start_time);
  const locationLabel =
    event.location_name || event.location || 'Location to be confirmed';

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardTouchable}
        activeOpacity={0.9}
        onPress={() => onManageEvent(event)}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            <ShText variant={ShTextVariant.Subheading} style={styles.title}>
              {event.title || 'Untitled Event'}
            </ShText>
            <ShText variant={ShTextVariant.Caption} style={styles.subtitle}>
              {event.opponent || 'Upcoming fixture'}
            </ShText>
          </View>
          <View style={styles.typeTag}>
            <ShText variant={ShTextVariant.Caption} style={styles.typeTagText}>
              {eventTypeLabel}
            </ShText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <ShIcon
            name={IconName.CalendarOutline}
            size={spacing.iconSizeSmall}
            color={colorPalette.stoneGrey}
          />
          <ShText variant={ShTextVariant.Body} style={styles.detailText}>
            {formattedDate}
          </ShText>
          <ShText> </ShText>
          <ShIcon
            name={IconName.Clock}
            size={spacing.iconSizeSmall}
            color={colorPalette.stoneGrey}
          />
          <ShText variant={ShTextVariant.Body} style={styles.detailText}>
            {formattedTime}
          </ShText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fullWidthButton, styles.primaryActionButton]}
        onPress={() => onManageEvent(event)}
        activeOpacity={0.85}
      >
        <ShText variant={ShTextVariant.Button} style={styles.primaryActionText}>
          Manage Event
        </ShText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: spacing.borderWidthThin,
    borderColor: 'rgba(158, 155, 151, 0.2)',
    borderRadius: spacing.eventCardBorderRadius,
    padding: spacing.eventCardPadding,
    gap: spacing.lg,
  },
  cardTouchable: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  titleSection: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colorPalette.textLight,
  },
  subtitle: {
    color: colorPalette.stoneGrey,
  },
  typeTag: {
    paddingVertical: spacing.eventTypeTagPadding,
    paddingHorizontal: spacing.eventTypeTagPaddingHorizontal,
    borderRadius: spacing.eventTypeTagBorderRadius,
    backgroundColor: 'rgba(158, 155, 151, 0.2)',
  },
  typeTagText: {
    color: colorPalette.textLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.eventTimeRowGap,
  },
  detailIcon: {
    marginLeft: spacing.lg,
  },
  detailText: {
    color: colorPalette.stoneGrey,
    flexShrink: 1,
  },
  fullWidthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: spacing.eventButtonBorderRadius,
  },
  primaryActionButton: {
    backgroundColor: colorPalette.primaryGold,
    minHeight: spacing.buttonHeightMedium,
  },
  primaryActionText: {
    color: colorPalette.baseDark,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: spacing.eventButtonGap,
    flexWrap: 'wrap',
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: 'rgba(158, 155, 151, 0.2)',
    borderWidth: spacing.borderWidthThin,
    borderColor: 'rgba(158, 155, 151, 0.35)',
  },
  secondaryActionText: {
    color: colorPalette.textLight,
  },
});
