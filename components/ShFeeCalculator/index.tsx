import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShText } from '@cmp/ShText';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant, fontWeights } from '@con/typography';

interface ShFeeCalculatorProps {
  baseAmount: number;
  feeAmount: number;
  totalAmount: number;
  currency?: string;
}

export function ShFeeCalculator({
  baseAmount,
  feeAmount,
  totalAmount,
  currency = '£',
}: ShFeeCalculatorProps) {
  const formatCurrency = (pence: number): string => {
    const pounds = pence / 100;
    return `${currency}${pounds.toFixed(2)}`;
  };

  if (baseAmount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ShText variant={ShTextVariant.Small} style={styles.label}>
          You will receive
        </ShText>
        <ShText variant={ShTextVariant.Small} style={styles.value}>
          {formatCurrency(baseAmount)}
        </ShText>
      </View>

      <View style={styles.row}>
        <ShText variant={ShTextVariant.Small} style={styles.label}>
          Transaction fee
        </ShText>
        <ShText variant={ShTextVariant.Small} style={styles.value}>
          {formatCurrency(feeAmount)}
        </ShText>
      </View>

      <View style={[styles.row, styles.totalRow]}>
        <ShText variant={ShTextVariant.Body} style={styles.totalLabel}>
          Total price
        </ShText>
        <ShText variant={ShTextVariant.Body} style={styles.totalValue}>
          {formatCurrency(totalAmount)}
        </ShText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.surface,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.border,
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  totalRow: {
    borderTopWidth: spacing.borderWidthThin,
    borderTopColor: colorPalette.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: 0,
  },
  label: {
    color: colorPalette.textSecondary,
  },
  value: {
    color: colorPalette.textSecondary,
  },
  totalLabel: {
    color: colorPalette.textPrimary,
    fontWeight: fontWeights.semiBold,
  },
  totalValue: {
    color: colorPalette.textPrimary,
    fontWeight: fontWeights.semiBold,
  },
});
