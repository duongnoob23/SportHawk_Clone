import { ShText } from '@cmp/ShText';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontWeights, ShTextVariant } from '@con/typography';
import { paymentCaculationStripeFee } from '@top/features/payments/utils/paymentCaculationiStripeFee';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { ShSpacer } from '../ShSpacer';

interface ShPaymentAmountInputProps
  extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: number;
  onChangeValue: (pence: number) => void;
  currency?: 'GBP' | 'EUR' | 'USD';
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  required?: boolean;
}

export function ShPaymentAmountInput({
  value,
  onChangeValue,
  currency = 'GBP',
  placeholder = 'Enter amount',
  error = false,
  errorMessage,
  label,
  required = false,
  editable = true,
  ...rest
}: ShPaymentAmountInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { amountInPounds, transactionFee, total } = paymentCaculationStripeFee(
    value,
    false
  );
  const currencySymbol =
    currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';

  const formatPenceToDisplay = useCallback((pence: number): string => {
    if (pence === 0) return '';
    const pounds = pence / 100;
    return pounds.toFixed(2);
  }, []);

  const parseToPence = useCallback(
    (text: string): number => {
      const cleanedText = text.replace(/[^0-9.]/g, '');

      if (cleanedText === '') return 0;

      const parts = cleanedText.split('.');
      if (parts.length > 2) return value;

      if (parts[1] && parts[1].length > 2) {
        parts[1] = parts[1].substring(0, 2);
      }

      const pounds = parseFloat(parts.join('.')) || 0;
      const pence = Math.round(pounds * 100);

      const MAX_AMOUNT = 100000000;

      if (pence < 0) return 0;
      if (pence > MAX_AMOUNT) return MAX_AMOUNT;

      return pence;
    },
    [value]
  );

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatPenceToDisplay(value));
    }
  }, [value, isFocused, formatPenceToDisplay]);

  const handleChangeText = (text: string) => {
    if (text === '') {
      setDisplayValue('');
      onChangeValue(0);
      return;
    }

    const cleanedText = text.replace(/[^0-9.]/g, '');

    const parts = cleanedText.split('.');
    if (parts.length > 2) return;

    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
    }

    setDisplayValue(cleanedText);
    const pence = parseToPence(cleanedText);
    onChangeValue(pence);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value > 0) {
      setDisplayValue(formatPenceToDisplay(value));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value > 0) {
      setDisplayValue(formatPenceToDisplay(value));
    } else {
      setDisplayValue('');
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <ShText variant={ShTextVariant.Label} style={styles.label}>
            {label}
            {required && (
              <ShText variant={ShTextVariant.Label} style={styles.asterisk}>
                {' *'}
              </ShText>
            )}
          </ShText>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
      >
        <ShText variant={ShTextVariant.Body} style={styles.currencySymbol}>
          {currencySymbol}
        </ShText>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colorPalette.textSecondary}
          keyboardType="decimal-pad"
          editable={editable}
          {...rest}
        />
      </View>
      {error && errorMessage && (
        <ShText variant={ShTextVariant.Small} style={styles.errorText}>
          {errorMessage}
        </ShText>
      )}
      <ShSpacer size={spacing.md} />
      <View style={styles.amountDetails}>
        <View style={styles.amountItems}>
          <ShText
            variant={ShTextVariant.SmallText}
            style={styles.amountItemsText}
          >
            You will receive
          </ShText>
          <ShText
            variant={ShTextVariant.SmallText}
            style={styles.amountItemsText}
          >
            £{amountInPounds.toFixed(2)}
          </ShText>
        </View>

        <ShSpacer size={spacing.lg} />

        <View style={styles.amountItems}>
          <ShText
            variant={ShTextVariant.SmallText}
            style={styles.amountItemsText}
          >
            Transaction fee
          </ShText>
          <ShText
            variant={ShTextVariant.SmallText}
            style={styles.amountItemsText}
          >
            £{transactionFee.toFixed(2)}
          </ShText>
        </View>

        <ShSpacer size={spacing.lg} />

        <View style={styles.amountItems}>
          <ShText
            variant={ShTextVariant.SmallText}
            style={[
              styles.amountItemsText,
              { fontWeight: fontWeights.semiBold },
            ]}
            color={colorPalette.textLight}
          >
            Total
          </ShText>
          <ShText
            variant={ShTextVariant.SmallText}
            style={styles.amountItemsText}
            color={colorPalette.textLight}
          >
            £{total.toFixed(2)}
          </ShText>
        </View>
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
    marginBottom: spacing.sm,
  },
  asterisk: {
    color: colorPalette.primaryGold,
  },
  inputContainer: {
    backgroundColor: colorPalette.baseDark,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    paddingHorizontal: spacing.md,
    height: 50,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputError: {
    borderColor: colorPalette.primaryGold,
  },
  inputDisabled: {
    backgroundColor: colorPalette.baseDark,
    opacity: 0.6,
  },
  currencySymbol: {
    color: colorPalette.textLight,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colorPalette.textLight,
    padding: 0,
    ...Platform.select({
      ios: {
        paddingVertical: spacing.sm,
      },
      android: {
        paddingVertical: spacing.xs,
      },
    }),
  },
  errorText: {
    color: colorPalette.primaryGold,
    marginTop: spacing.xs,
  },
  label: {
    color: colorPalette.textLight,
  },
  amountDetails: {
    padding: spacing.xxl,
    borderRadius: spacing.lg,
    borderColor: colorPalette.borderInputField,
    borderWidth: spacing.xxxs,
  },
  amountItems: {
    flexDirection: 'row',
  },
  amountItemsText: {
    width: '50%',
  },
});
