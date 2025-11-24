import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant, typographyStyles } from '@con/typography';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ShText } from '../ShText';

interface ShFormFieldChoiceProps {
  label?: string;
  options: { label: string; value: string }[];
  value: string | null;
  onChangeValue: (value: string) => void;
  error?: string;
  required?: boolean;
  helperText?: string;
  testID?: string;
}

export function ShFormFieldChoice({
  label = 'Sex',
  options,
  value,
  onChangeValue,
  error,
  required = false,
  helperText,
  testID,
}: ShFormFieldChoiceProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ShText variant={ShTextVariant.Label}>
          {label}
          {required && (
            <ShText
              variant={ShTextVariant.Label}
              color={colorPalette.primaryGold}
            >
              {' '}
              *
            </ShText>
          )}
        </ShText>
      </View>
      <View style={styles.optionsContainer}>
        {options.map(option => (
          <Pressable
            key={option.value}
            onPress={() => onChangeValue(option.value)}
            style={[
              styles.option,
              value === option.value && styles.optionSelected,
              error && styles.optionError,
            ]}
            testID={`${testID}-${option.value}`}
          >
            <ShText
              variant={ShTextVariant.Body}
              style={[
                styles.optionText,
                ...(value === option.value ? [styles.optionTextSelected] : []),
              ]}
            >
              {option.label}
            </ShText>
          </Pressable>
        ))}
      </View>
      {helperText && !error && (
        <ShText variant={ShTextVariant.Small} style={styles.helperText}>
          {helperText}
        </ShText>
      )}
      {error && (
        <ShText variant={ShTextVariant.Small} style={styles.errorText}>
          {error}
        </ShText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  option: {
    backgroundColor: colorPalette.backgroundFieldDate,
    borderWidth: 1,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    height: spacing.buttonHeightLarge,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colorPalette.primaryGold,
    borderColor: colorPalette.primaryGold,
  },
  optionError: {
    borderColor: colorPalette.primaryGold,
  },
  optionText: {
    ...typographyStyles.body,
    color: colorPalette.stoneGrey,
  },
  optionTextSelected: {
    color: colorPalette.baseDark,
  },
  helperText: {
    color: colorPalette.stoneGrey,
    marginTop: spacing.xs,
    fontSize: typographyStyles.small.fontSize,
  },
  errorText: {
    color: colorPalette.primaryGold,
    marginTop: spacing.xs,
    fontSize: typographyStyles.small.fontSize,
  },
});
