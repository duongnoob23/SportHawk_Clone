import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShIcon, ShSpacer, ShText } from '@top/components';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { IconName } from '@con/icons';
import { PAYMENT_UI_MESSAGES } from '@top/features/payments/constants';

export const PaymentSuccessBanner: React.FC = () => {
  return (
    <View style={styles.container}>
      <ShIcon
        name={IconName.CheckmarkCircle}
        size={spacing.iconSizeMedium}
        color={colorPalette.success}
      />
      <ShSpacer size={spacing.sm} />
      <ShText variant={ShTextVariant.Body} color={colorPalette.success}>
        {PAYMENT_UI_MESSAGES.PAYMENT_SUCCESS}
      </ShText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colorPalette.successLight,
    borderRadius: spacing.borderRadiusMedium,
    marginBottom: spacing.md,
  },
});
