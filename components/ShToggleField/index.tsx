import React from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { ShText } from '@cmp/ShText';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';

interface ShToggleFieldProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  helpText?: string;
  disabled?: boolean;
}

export function ShToggleField({
  label,
  value,
  onValueChange,
  helpText,
  disabled = false,
}: ShToggleFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <ShText variant={ShTextVariant.Body} style={styles.label}>
          {label}
        </ShText>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: colorPalette.surface,
            true: colorPalette.primary,
          }}
          thumbColor={colorPalette.white}
        />
      </View>
      {helpText && (
        <ShText variant={ShTextVariant.Small} style={styles.helpText}>
          {helpText}
        </ShText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    marginRight: spacing.md,
  },
  helpText: {
    color: colorPalette.textSecondary,
    marginTop: spacing.sm,
  },
});
