import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShText } from '@top/components';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { EventDetailData } from '../types';

type Props = {
  eventItem?: EventDetailData;
};

const EventTitleAndTeam = ({ eventItem }: Props) => {
  console.log('event ', eventItem);
  return (
    <View style={styles.headerSection}>
      <ShText variant={ShTextVariant.Subheading} style={styles.eventTitle}>
        {/* {getEventTitle(eventItem)} */}
        {eventItem?.title}
      </ShText>
      <View style={styles.hostedByRow}>
        <ShText variant={ShTextVariant.Caption} style={styles.hostedByText}>
          Hosted by
        </ShText>
        {eventItem?.teams.teamPhotoUrl && (
          <Image
            source={{ uri: eventItem?.teams?.clubs.clubBadgeUrl || '' }}
            style={styles.teamPhoto}
          />
        )}
        <ShText variant={ShTextVariant.Caption} style={styles.teamName}>
          {eventItem?.teams.name || 'Team'}
        </ShText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    gap: spacing.md,
  },
  eventTitle: {
    color: colorPalette.textLight,
  },
  hostedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hostedByText: {
    color: colorPalette.stoneGrey,
  },
  teamPhoto: {
    width: spacing.teamPhotoSize,
    height: spacing.teamPhotoSize,
    borderRadius: spacing.teamPhotoRadius,
  },
  teamName: {
    color: colorPalette.stoneGrey,
    flex: 1,
  },
});

export default EventTitleAndTeam;
