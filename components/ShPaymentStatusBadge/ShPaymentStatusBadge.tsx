import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontSizes, fontWeights } from '@con/typography';
import { PaymentStatusType } from '@top/features/payments';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface ShPaymentStatusBadgeProps {
  status: PaymentStatusType;
  count?: number;
  size?: 'small' | 'medium';
  testID?: string;
}

export const ShPaymentStatusBadge: React.FC<ShPaymentStatusBadgeProps> = ({
  status,
  count,
  size = 'small',
  testID,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return {
          backgroundColor: colorPalette.paymentStatusPaidBg,
          textColor: colorPalette.paymentStatusPaid,
          label: 'Paid',
        };
      case 'unpaid':
        return {
          backgroundColor: colorPalette.paymentStatusFailedBg,
          textColor: colorPalette.paymentStatusFailed,
          label: 'Unpaid',
        };
      case 'pending':
        return {
          backgroundColor: colorPalette.paymentDueDateBannerBg,
          textColor: colorPalette.warning,
          label: 'Pending',
        };
    }
  };

  const config = getStatusConfig();
  const isSmall = size === 'small';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
      }}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: config?.backgroundColor,
            paddingVertical: isSmall ? spacing.xs : spacing.sm,
            paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          },
        ]}
        testID={testID}
      >
        <Text
          style={[
            styles.text,
            {
              color: config?.textColor,
              fontSize: isSmall ? fontSizes.sm : fontSizes.md,
            },
          ]}
        >
          {config?.label}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 16,
          color: colorPalette.paymentStatusCancelled,
          fontWeight: '400',
        }}
      >
        {count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.borderRadiusMedium,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: fontWeights.regular,
    fontSize: spacing.mdx,
  },
});
