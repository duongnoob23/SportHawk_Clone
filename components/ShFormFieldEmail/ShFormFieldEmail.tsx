import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant, typographyStyles } from '@con/typography';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ShText } from '../ShText';

interface ShFormFieldEmailProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  editable?: boolean;
  testID?: string;
}

export function ShFormFieldEmail({
  label = 'Email',
  placeholder,
  value,
  onChangeText,
  required = false,
  error,
  editable = true,
  testID,
}: ShFormFieldEmailProps) {
  const handleChangeText = (text: string) => {
    onChangeText(text.toLowerCase().trim());
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ShText
          variant={ShTextVariant.Label}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
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
          onChangeText={handleChangeText}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          testID={testID}
          textContentType="username"
          importantForAutofill="yes"
        />
      </View>
      {error && (
        <ShText
          variant={ShTextVariant.ErrorText}
          style={{ marginTop: spacing.xs }}
        >
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
});
