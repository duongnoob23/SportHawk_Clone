import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ShIcon } from '../ShIcon';
import { ShText } from '../ShText';

interface PlayingTime {
  eventType: string;
  schedule: string;
  location: string;
}

interface ShPlayingTimesProps {
  times: PlayingTime[];
}

export const ShPlayingTimes: React.FC<ShPlayingTimesProps> = ({ times }) => {
  return (
    <View style={styles.container}>
      <ShText variant={ShTextVariant.SectionTitle}>Playing Times</ShText>

      <View style={styles.card}>
        {times.length > 0 ? (
          times.map((time, index) => (
            <View key={index} style={styles.timeItem}>
              <ShIcon
                name={IconName.Clock}
                size={spacing.iconSizeSmall}
                color={colorPalette.stoneGrey}
              />
              <View style={styles.timeContent}>
                <ShText variant={ShTextVariant.LabelLight}>
                  {time.eventType}
                </ShText>
                <ShText variant={ShTextVariant.BodyLight}>
                  {time.schedule}
                </ShText>
                <ShText variant={ShTextVariant.LabelLight}>
                  {time.location}
                </ShText>
              </View>
            </View>
          ))
        ) : (
          <ShText variant={ShTextVariant.Body} color={colorPalette.stoneGrey}>
            None specified
          </ShText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxl,
  },
  card: {
    backgroundColor: colorPalette.backgroundListItem,
    borderRadius: spacing.borderRadiusLarge,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    padding: spacing.lg,
    gap: spacing.playingTimesGap,
  },
  timeItem: {
    flexDirection: 'row',
    gap: spacing.statsItemGap,
  },
  timeContent: {
    flex: 1,
    gap: spacing.statsCardGap,
  },
});
