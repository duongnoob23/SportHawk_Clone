import { spacing } from '@con/spacing';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import EventCard from './EventCard';
import { EventInvitation } from '@top/features/event/types/event';
import { TimeFilterType } from '@top/hooks/useTimeFilter';
export default function EventsList({
  events,
  onNavigate,
  eventFilter,
}: {
  events: EventInvitation[];
  onNavigate: (eventItem: EventInvitation) => void;
  eventFilter: TimeFilterType;
}) {
  return (
    <View style={styles.eventsList}>
      {events.map(eventItem => (
        <EventCard
          key={eventItem.id}
          eventItem={eventItem}
          onNavigate={onNavigate}
          eventFilter={eventFilter}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  eventsList: {
    gap: spacing.eventCardGap,
  },
});
