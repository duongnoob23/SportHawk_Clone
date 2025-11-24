import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ShText } from '../ShText/ShText';
import { ShTextVariant, fontSizes } from '@con/typography';
import { ShIcon } from '../ShIcon/ShIcon';
import { IconName } from '@con/icons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';

interface ShPaymentButtonGroupProps {
  onCardPay?: () => void;
  onApplePay?: () => void;
  onGooglePay?: () => void;
  disabled?: boolean;
}

export function ShPaymentButtonGroup({
  onCardPay,
  onApplePay,
  onGooglePay,
  disabled = false,
}: ShPaymentButtonGroupProps) {
  const handlePress = (method: string, handler?: () => void) => {
    if (disabled) {
      console.log(`Payment method ${method} will be implemented in Story 5`);
    } else if (handler) {
      handler();
    }
  };

  return (
    <View style={styles.container}>
      {/* Pay with Card */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.primaryButton,
          disabled && styles.disabledButton,
        ]}
        onPress={() => handlePress('card', onCardPay)}
        disabled={disabled}
      >
        <ShIcon
          name={IconName.CardWhite}
          size={spacing.lgx}
          color={colorPalette.lightText}
        />
        <ShText variant={ShTextVariant.Button} style={styles.buttonText}>
          Pay with Card
        </ShText>
      </TouchableOpacity>

      {/* Pay with Apple Pay */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.secondaryButton,
          disabled && styles.disabledButton,
        ]}
        onPress={() => handlePress('apple', onApplePay)}
        disabled={disabled}
      >
        <ShIcon
          name={IconName.Apple}
          size={spacing.mdx}
          color={colorPalette.lightText}
        />
        <ShText variant={ShTextVariant.Button} style={styles.buttonText}>
          Pay with Apple Pay
        </ShText>
      </TouchableOpacity>

      {/* Pay with Google Pay */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.secondaryButton,
          disabled && styles.disabledButton,
        ]}
        onPress={() => handlePress('google', onGooglePay)}
        disabled={disabled}
      >
        <ShIcon
          name={IconName.Google}
          size={spacing.xl}
          color={colorPalette.lightText}
        />
        <ShText variant={ShTextVariant.Button} style={styles.buttonText}>
          Pay with Google Pay
        </ShText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.paymentDetailButtonPadding,
    borderRadius: spacing.paymentDetailBorderRadius,
    gap: spacing.paymentDetailSectionGap,
  },
  primaryButton: {
    backgroundColor: colorPalette.paymentCardButtonBg,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.paymentButtonBorder,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: colorPalette.lightText,
    fontSize: fontSizes.md,
  },
});
