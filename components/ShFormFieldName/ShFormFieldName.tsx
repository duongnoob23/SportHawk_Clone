import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant, typographyStyles } from '@con/typography';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ShText } from '../ShText';

interface ShFormFieldNameProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  editable?: boolean;
  testID?: string;
}

export function ShFormFieldName({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  required = false,
  editable = true,
  testID,
}: ShFormFieldNameProps) {
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
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colorPalette.stoneGrey}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          autoCapitalize="words"
          autoCorrect={false}
          testID={testID}
        />
      </View>
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
    marginBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colorPalette.baseDark,
    borderWidth: 1,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    height: spacing.buttonHeightLarge,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colorPalette.primaryGold,
  },
  input: {
    ...typographyStyles.body,
    color: colorPalette.textLight,
    paddingHorizontal: spacing.md + 1,
    height: '100%',
  },
  errorText: {
    color: colorPalette.primaryGold,
    marginTop: spacing.xs,
  },
});
