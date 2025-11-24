import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShText } from '../ShText/ShText';
import { ShTextVariant } from '@con/typography';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';

interface ShAmountDisplayProps {
  amountPence: number;
  label?: string;
}

export function ShAmountDisplay({
  amountPence,
  label = 'Total',
}: ShAmountDisplayProps) {
  const formatAmount = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <ShText variant={ShTextVariant.Total}>{label}</ShText>
      <ShText variant={ShTextVariant.Amount}>
        {formatAmount(amountPence)}
      </ShText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.paymentAmountBg,
    borderRadius: spacing.paymentDetailBorderRadius,
    padding: spacing.paymentDetailBannerPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
