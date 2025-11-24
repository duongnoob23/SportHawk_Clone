import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { opacity } from '@con/opacity';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { PlatformPay, PlatformPayButton } from '@stripe/stripe-react-native';
import { ShIcon, ShText } from '@top/components';
import {
  PAYMENT_FLOW_STATUS,
  PAYMENT_UI_MESSAGES,
  PaymentStatus,
} from '@top/features/payments/constants';
import { usePlatformPayAvailability } from '@top/features/payments/hooks';
import {
  PaymentFlowStatus,
  PaymentStatusType,
} from '@top/features/payments/types';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

interface PaymentButtonsProps {
  paymentStatus: PaymentFlowStatus;
  userPaymentStatus?: PaymentStatusType;
  onCardPayment: () => void;
  onApplePayment: () => void;
  onGooglePayment: () => void;
  activePaymentMethod?: 'card' | 'apple' | 'google' | null;
}

export const PaymentButtons: React.FC<PaymentButtonsProps> = ({
  paymentStatus,
  userPaymentStatus,
  onCardPayment,
  onApplePayment,
  onGooglePayment,
  activePaymentMethod = null,
}) => {
  const { isApplePaySupported, isGooglePaySupported, isLoading } =
    usePlatformPayAvailability();

  const isDisabled =
    userPaymentStatus === PaymentStatus.PAID ||
    paymentStatus !== PAYMENT_FLOW_STATUS.IDLE;

  const isProcessing =
    paymentStatus === PAYMENT_FLOW_STATUS.CREATING_INTENT ||
    paymentStatus === PAYMENT_FLOW_STATUS.SHEET_PRESENTED ||
    paymentStatus === PAYMENT_FLOW_STATUS.PROCESSING;

  const isCardProcessing = isProcessing && activePaymentMethod === 'card';
  const isApplePayProcessing = isProcessing && activePaymentMethod === 'apple';
  const isGooglePayProcessing =
    isProcessing && activePaymentMethod === 'google';

  // Show loading state while checking platform pay availability
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.cardButton, { opacity: opacity.medium }]}>
          <ActivityIndicator size="small" color="white" />
          <ShText variant={ShTextVariant.Button} color="white">
            Loading payment options...
          </ShText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Pay with Card */}
      <TouchableOpacity
        style={[
          styles.cardButton,
          { opacity: isDisabled ? opacity.medium : 1 },
        ]}
        onPress={() => {
          console.log('[USER ACTION] Card payment button pressed');
          onCardPayment();
        }}
        disabled={isDisabled}
      >
        {isCardProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color="white" />
            <ShText variant={ShTextVariant.Button} color="white">
              {PAYMENT_UI_MESSAGES.PROCESSING_PAYMENT}
            </ShText>
          </View>
        ) : (
          <>
            <ShIcon name={IconName.CardWhite} size={18} color="white" />
            <ShText
              variant={ShTextVariant.Button}
              color={colorPalette.textLight}
            >
              Pay with Card
            </ShText>
          </>
        )}
      </TouchableOpacity>

      {/* Apple Pay (Stripe native button) */}
      {isApplePaySupported &&
        (isApplePayProcessing ? (
          <View style={[styles.secondaryButton, { opacity: opacity.medium }]}>
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color={colorPalette.lightText} />
              <ShText
                variant={ShTextVariant.Button}
                color={colorPalette.lightText}
              >
                {PAYMENT_UI_MESSAGES.PROCESSING_PAYMENT}
              </ShText>
            </View>
          </View>
        ) : (
          <View style={{ opacity: isDisabled ? opacity.medium : 1 }}>
            <PlatformPayButton
              type={PlatformPay.ButtonType.Pay}
              appearance={PlatformPay.ButtonStyle.Automatic}
              borderRadius={spacing.borderRadiusMedium}
              style={styles.platformPayButton}
              onPress={() => {
                console.log('[USER ACTION] Apple Pay button pressed (native)');
                onApplePayment();
              }}
              disabled={isDisabled}
            />
          </View>
        ))}

      {/* Google Pay (Stripe native button) */}
      {isGooglePaySupported &&
        (isGooglePayProcessing ? (
          <View style={[styles.secondaryButton, { opacity: opacity.medium }]}>
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color={colorPalette.lightText} />
              <ShText
                variant={ShTextVariant.Button}
                color={colorPalette.lightText}
              >
                {PAYMENT_UI_MESSAGES.PROCESSING_PAYMENT}
              </ShText>
            </View>
          </View>
        ) : (
          <View
            style={{
              opacity: isDisabled ? opacity.medium : 1,
              marginBottom: spacing.xxl,
            }}
          >
            <PlatformPayButton
              type={PlatformPay.ButtonType.Pay}
              appearance={PlatformPay.ButtonStyle.Automatic}
              style={styles.platformPayButton}
              onPress={() => {
                console.log('[USER ACTION] Google Pay button pressed (native)');
                onGooglePayment();
              }}
              disabled={isDisabled}
            />
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  cardButton: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: spacing.borderRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing.buttonHeightMedium,
    backgroundColor: colorPalette.paymentCardButtonBg,
    gap: spacing.xs,
  },
  secondaryButton: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: spacing.borderRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing.buttonHeightMedium,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colorPalette.paymentButtonBorder,
    gap: spacing.xs,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  platformPayButton: {
    height: 48,
    width: '100%',
  },
});
