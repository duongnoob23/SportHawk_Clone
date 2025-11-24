import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant, typographyStyles } from '@con/typography';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ShText } from '../ShText';

interface ShFormFieldPasswordProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  editable?: boolean;
  showPasswordToggle?: boolean;
  helperText?: string;
  testID?: string;
}

export function ShFormFieldPassword({
  label = 'Password',
  placeholder,
  value,
  onChangeText,
  error,
  required = false,
  editable = true,
  showPasswordToggle = true,
  helperText,
  testID,
}: ShFormFieldPasswordProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          testID={testID}
          textContentType="password"
          importantForAutofill="yes"
        />
        {showPasswordToggle && (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.toggleButton}
            hitSlop={8}
          >
            <ShText variant={ShTextVariant.Small} style={styles.toggleText}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </ShText>
          </Pressable>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputError: {
    borderColor: colorPalette.primaryGold,
  },
  input: {
    ...typographyStyles.body,
    color: colorPalette.textLight,
    paddingHorizontal: spacing.md + 1,
    flex: 1,
    height: '100%',
  },
  toggleButton: {
    paddingHorizontal: spacing.md + 1,
  },
  toggleText: {
    color: colorPalette.stoneGrey,
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
