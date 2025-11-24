import { ShIcon } from '@cmp/ShIcon';
import { ShText } from '@cmp/ShText';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ShFormFieldSelectProps {
  label: string;
  isRequired?: boolean;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  error?: string;
  disabled?: boolean;
}

export function ShFormFieldSelect({
  label,
  isRequired = false,
  value,
  placeholder = 'Select',
  onPress,
  error,
  disabled = false,
}: ShFormFieldSelectProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ShText variant={ShTextVariant.Label} style={styles.labelText}>
          {label}
        </ShText>
        {isRequired && (
          <ShText variant={ShTextVariant.Label} style={styles.asterisk}>
            {' *'}
          </ShText>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.selectButton,
          error && styles.selectButtonError,
          disabled && styles.selectButtonDisabled,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <ShText
          variant={ShTextVariant.Body}
          style={value ? styles.valueText : styles.placeholderText}
        >
          {value || placeholder}
        </ShText>
        <ShIcon
          name={IconName.ChevronRight}
          size={spacing.iconSizeSmall}
          color={colorPalette.textSecondary}
        />
      </TouchableOpacity>

      {error && (
        <ShText variant={ShTextVariant.Small} style={styles.errorText}>
          {error}
        </ShText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  asterisk: {
    color: colorPalette.primary,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colorPalette.baseDark,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  selectButtonError: {
    borderColor: colorPalette.error,
  },
  selectButtonDisabled: {
    opacity: 0.6,
  },
  valueText: {
    color: colorPalette.textLight,
  },
  placeholderText: {
    color: colorPalette.textLight,
  },
  errorText: {
    color: colorPalette.error,
    marginTop: spacing.xs,
  },
  labelText: {
    color: colorPalette.textLight,
  },
});
