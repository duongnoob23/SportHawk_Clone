import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShText } from '@top/components';
import { useEventDefaults } from '@top/lib/utils/event';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { EventDetailData } from '../types';
import { parseEventNotes } from '../utils';
type EventDetailCardProps = {
  eventItem?: EventDetailData;
};

const EventSquadsCard = ({ eventItem }: EventDetailCardProps) => {
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

  const description = useMemo(() => {
    if (eventItem?.event_squads.length !== 0) {
      let content = eventItem?.event_squads[0].selectionNotes;
      console.log('CONTENT', content);
      return content;
    } else {
      let content = 'No message';
      return content;
    }
  }, [eventItem?.event_squads]);

  return (
    <View style={styles.detailsCard}>
      {/* Start Date/Time */}
      <View style={styles.detailRow}>
        <View style={styles.detailContent}>
          <ShText variant={ShTextVariant.Caption} style={styles.detailLabel}>
            Message
          </ShText>
          <ShText variant={ShTextVariant.Body} style={styles.detailValue}>
            {description}
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

export default EventSquadsCard;
