import { ShText } from '@cmp/ShText';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ShFormFieldReadOnlyProps {
  label: string;
  value: string;
  showReadOnlyText?: boolean;
}

export function ShFormFieldReadOnly({
  label,
  value,
  showReadOnlyText = false,
}: ShFormFieldReadOnlyProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ShText variant={ShTextVariant.Label}>{label}</ShText>
        {showReadOnlyText && (
          <>
            <ShText variant={ShTextVariant.Small} style={styles.readOnlyText}>
              {' (read only)'}
            </ShText>
            <ShText variant={ShTextVariant.Label} style={styles.asterisk}>
              {' *'}
            </ShText>
          </>
        )}
      </View>
      <View style={styles.valueContainer}>
        <ShText variant={ShTextVariant.Body} style={styles.value}>
          {value}
        </ShText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  readOnlyText: {
    color: colorPalette.stoneGrey,
  },
  valueContainer: {

    backgroundColor: colorPalette.baseDark,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    paddingHorizontal: spacing.md,
    height: 50,
    justifyContent: 'center',
  },
  value: {
    color: colorPalette.textLight,
  },
  asterisk: {
    color: colorPalette.primary,
  },
});
