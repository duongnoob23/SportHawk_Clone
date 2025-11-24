import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShText } from '../ShText';
import { colorPalette } from '@con/colors';
import { fontSizes } from '@con/typography';
import { spacing } from '@con/spacing';

interface ShStatsCardProps {
  label: string;
  value: string | number;
}

export const ShStatsCard: React.FC<ShStatsCardProps> = ({ label, value }) => {
  return (
    <View style={styles.container}>
      <ShText style={styles.label}>{label}</ShText>
      <ShText style={styles.value}>{value}</ShText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.backgroundListItem,
    borderRadius: spacing.borderRadiusLarge,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    padding: spacing.statsCardPadding,
    height: spacing.statsCardHeight,
    justifyContent: 'center',
    gap: spacing.statsCardGap,
    flex: 1,
  },
  label: {
    fontSize: fontSizes.sm,
    color: colorPalette.stoneGrey,
  },
  value: {
    fontSize: fontSizes.md,
    color: colorPalette.textLight,
  },
});
