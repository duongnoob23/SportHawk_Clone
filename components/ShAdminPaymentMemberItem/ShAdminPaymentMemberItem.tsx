import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontSizes } from '@con/typography';
import { PaymentStatusType } from '@top/features/payments';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShAvatar } from '../ShAvatar';
import { ShPaymentStatusBadge } from '../ShPaymentStatusBadge';

export interface ShAdminPaymentMemberItemProps {
  name: string;
  photoUri?: string | null;
  paymentStatus: PaymentStatusType;
  amount?: number;
  onPress?: () => void;
  testID?: string;
}

export const ShAdminPaymentMemberItem: React.FC<
  ShAdminPaymentMemberItemProps
> = ({ name, photoUri, paymentStatus, amount, onPress, testID }) => {
  const content = (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <ShAvatar
          size={spacing.buttonHeightMedium}
          imageUri={photoUri ? photoUri : undefined}
          name={name.charAt(0).toUpperCase()}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{name}</Text>
        </View>
      </View>
      <ShPaymentStatusBadge status={paymentStatus} size="medium" />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        testID={testID}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View testID={testID}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: spacing.lg,
    borderRadius: spacing.borderRadiusMedium,
  },
  touchable: {},
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  nameText: {
    fontSize: fontSizes.md,
    color: colorPalette.lightText,
    fontWeight: '500',
  },
  amountText: {
    fontSize: fontSizes.sm,
    color: colorPalette.textSecondary,
    marginTop: spacing.xs,
  },
});
