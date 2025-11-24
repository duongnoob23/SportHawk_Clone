import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShIcon, ShSpacer, ShText } from '@top/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { EventCounts, TimeFilterType } from '../../types/index';
type Props = {
  eventFilter: TimeFilterType;
  eventCounts: EventCounts;
};

const EmptyEventState = ({ eventFilter, eventCounts }: Props) => {
  return (
    <View style={styles.emptyTabContent}>
      <ShIcon
        name={IconName.CalendarDefault}
        size={spacing.iconSizeXLarge}
        color={colorPalette.primaryGold}
      />

      <ShSpacer size={spacing.lg} />

      <ShText variant={ShTextVariant.Subheading} style={styles.centerText}>
        {eventFilter === 'this_week' && eventCounts.nextWeek > 0
          ? `No events this week`
          : eventFilter === 'next_week' && eventCounts.thisWeek > 0
            ? `No events next week`
            : `You don't have any events`}
      </ShText>

      <ShSpacer size={spacing.md} />

      <ShText variant={ShTextVariant.Body} style={styles.centerText}>
        {eventFilter === 'this_week' && eventCounts.nextWeek > 0
          ? `But you have ${eventCounts.nextWeek} ${eventCounts.nextWeek === 1 ? 'event' : 'events'} next week`
          : eventFilter === 'next_week' &&
              eventCounts.next30Days > eventCounts.nextWeek
            ? `But you have ${eventCounts.next30Days - eventCounts.nextWeek} ${eventCounts.next30Days - eventCounts.nextWeek === 1 ? 'event' : 'events'} coming up`
            : `There aren't any upcoming events at the moment`}
      </ShText>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyTabContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.emptyStateVerticalPadding,
  },
  centerText: {
    textAlign: 'center',
  },
});

export default EmptyEventState;
