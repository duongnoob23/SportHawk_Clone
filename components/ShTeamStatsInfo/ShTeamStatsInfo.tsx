import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShText } from '../ShText';
import { ShIcon } from '../ShIcon';
import { colorPalette } from '@con/colors';
import { fontSizes } from '@con/typography';
import { spacing } from '@con/spacing';
import { IconName } from '@con/icons';

interface ShTeamStatsInfoProps {
  league?: string;
  gameplayLevel?: string;
  homeGround?: string;
  groundAddress?: string;
}

export const ShTeamStatsInfo: React.FC<ShTeamStatsInfoProps> = ({
  league,
  gameplayLevel,
  homeGround,
  groundAddress,
}) => {
  return (
    <View style={styles.container}>
      {league && (
        <View style={styles.item}>
          <ShIcon
            name={IconName.Trophy}
            size={spacing.iconSizeSmall}
            color={colorPalette.stoneGrey}
          />
          <View style={styles.itemContent}>
            <ShText style={styles.label}>League</ShText>
            <ShText style={styles.value}>{league}</ShText>
            {gameplayLevel && (
              <ShText style={styles.subValue}>{gameplayLevel}</ShText>
            )}
          </View>
        </View>
      )}

      {homeGround && (
        <View style={styles.item}>
          <ShIcon
            name={IconName.Markervariant3}
            size={spacing.iconSizeSmall}
            color={colorPalette.stoneGrey}
          />
          <View style={styles.itemContent}>
            <ShText style={styles.label}>Home Ground</ShText>
            <ShText style={styles.value}>{homeGround}</ShText>
            {groundAddress && (
              <ShText style={styles.subValue}>{groundAddress}</ShText>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.backgroundListItem,
    borderRadius: spacing.borderRadiusLarge,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.statsItemGap,
  },
  itemContent: {
    flex: 1,
    gap: spacing.statsItemContentGap,
  },
  label: {
    fontSize: fontSizes.sm,
    color: colorPalette.stoneGrey,
    marginBottom: spacing.borderWidthMd,
  },
  value: {
    fontSize: fontSizes.md,
    color: colorPalette.textLight,
  },
  subValue: {
    fontSize: fontSizes.sm,
    color: colorPalette.stoneGrey,
  },
});
