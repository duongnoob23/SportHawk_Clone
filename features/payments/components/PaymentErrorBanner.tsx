import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { ShIcon, ShSpacer, ShText } from '@top/components';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { IconName } from '@con/icons';
import { PAYMENT_UI_MESSAGES } from '@top/features/payments/constants';

interface PaymentErrorBannerProps {
  errorMessage: string;
  onRetry: () => void;
}

export const PaymentErrorBanner: React.FC<PaymentErrorBannerProps> = ({
  errorMessage,
  onRetry,
}) => {
  return (
    <>
      <View style={styles.errorContainer}>
        <ShIcon
          name={IconName.AlertCircleOutline}
          size={spacing.iconSizeMedium}
          color={colorPalette.error}
        />
        <ShSpacer size={spacing.sm} />
        <ShText variant={ShTextVariant.Body} color={colorPalette.error}>
          {errorMessage}
        </ShText>
      </View>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <ShText variant={ShTextVariant.Button} color={colorPalette.white}>
          {PAYMENT_UI_MESSAGES.TRY_AGAIN}
        </ShText>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colorPalette.errorLight,
    borderRadius: spacing.borderRadiusMedium,
    marginBottom: spacing.md,
  },
  retryButton: {
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing.buttonHeightMedium,
    backgroundColor: colorPalette.primary,
  },
});
