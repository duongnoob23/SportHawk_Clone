import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShIcon, ShText } from '@top/components';
import { useEventDefaults } from '@top/lib/utils/event';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { EventDetailData } from '../types';
import { parseEventNotes } from '../utils';
type EventDetailCardProps = {
  eventItem?: EventDetailData;
};

const EventDetailCard = ({ eventItem }: EventDetailCardProps) => {
  const { formatEventDate, formatEventTime } = useEventDefaults();

  const result = parseEventNotes(eventItem?.notes);

  const eventDate = useMemo(() => {
    if (eventItem?.eventDate) {
      return formatEventDate(eventItem.eventDate);
    }
  }, [eventItem]);
  const startTime = useMemo(() => {
    if (eventItem?.startTime) {
      return formatEventTime(eventItem?.startTime);
    }
  }, [eventItem]);

  return (
    <View style={styles.detailsCard}>
      {/* Start Date/Time */}
      <View style={styles.detailRow}>
        <ShIcon
          name={IconName.CalendarOutline}
          size={spacing.iconSizeSmall}
          color={colorPalette.stoneGrey}
        />
        <View style={styles.detailContent}>
          <ShText variant={ShTextVariant.Caption} style={styles.detailLabel}>
            Starts
          </ShText>
          <ShText variant={ShTextVariant.Body} style={styles.detailValue}>
            {`${eventDate} • ${startTime} `}
          </ShText>
        </View>
      </View>

      {/* Meet Time */}
      <View style={styles.detailRow}>
        <ShIcon
          name={IconName.Clock}
          size={spacing.iconSizeSmall}
          color={colorPalette.stoneGrey}
        />
        <View style={styles.detailContent}>
          <ShText variant={ShTextVariant.Caption} style={styles.detailLabel}>
            Meet
          </ShText>
          <ShText variant={ShTextVariant.Body} style={styles.detailValue}>
            {result.meetTime || '13:30'}
          </ShText>
        </View>
      </View>

      {/* Location */}
      <View style={styles.detailRow}>
        <ShIcon
          name={IconName.LocationPin}
          size={spacing.iconSizeSmall}
          color={colorPalette.stoneGrey}
        />
        <View style={styles.detailContent}>
          <ShText variant={ShTextVariant.Caption} style={styles.detailLabel}>
            Location
          </ShText>
          <ShText variant={ShTextVariant.Body} style={styles.detailValue}>
            {eventItem?.locationName || 'Fremington Sports Ground'}
          </ShText>
          <ShText variant={ShTextVariant.Caption} style={styles.detailSubValue}>
            {eventItem?.locationAddress || 'No address'}
          </ShText>
        </View>
      </View>

      {/* Kit Colour */}
      <View style={styles.detailRow}>
        <ShIcon
          name={IconName.Shirt}
          size={spacing.iconSizeSmall}
          color={colorPalette.stoneGrey}
        />
        <View style={styles.detailContent}>
          <ShText variant={ShTextVariant.Caption} style={styles.detailLabel}>
            Kit Colour
          </ShText>
          <ShText variant={ShTextVariant.Body} style={styles.detailValue}>
            {result.kitColor || 'Black and White'}
          </ShText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailsCard: {
    backgroundColor: `rgba(0, 0, 0, 0.3)`,
    borderWidth: spacing.borderWidthThin,
    borderColor: `rgba(158, 155, 151, 0.2)`,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    gap: spacing.xs,
  },
  detailLabel: {
    color: colorPalette.stoneGrey,
  },
  detailValue: {
    color: colorPalette.textLight,
  },
  detailSubValue: {
    color: colorPalette.stoneGrey,
    marginTop: spacing.xs,
  },
});

export default EventDetailCard;
