import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ShText } from '../ShText/ShText';
import { ShIcon } from '../ShIcon/ShIcon';
import { IconName } from '@con/icons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { opacity } from '@con/opacity';
import { fontSizes, ShTextVariant } from '@con/typography';
import {
  PaymentStatusType,
  PaymentTypeOption,
} from '@top/features/payments/types';
import { PaymentStatus, PaymentType } from '@top/features/payments';
import {
  formatPaymentDate,
  formatPaymentTime,
} from '@top/features/payments/constants/paymentUtils';

interface ShPaymentCardProps {
  id: string;
  title: string;
  teamName: string;
  amountPence: number;
  dueDate: string | null;
  paymentType: PaymentTypeOption;
  paymentStatus: PaymentStatusType;
  onPress?: () => void;
  onPayPress?: () => void;
}

export const ShPaymentCard: React.FC<ShPaymentCardProps> = ({
  id,
  title,
  teamName,
  amountPence,
  dueDate,
  paymentType,
  paymentStatus,
  onPress,
  onPayPress,
}) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No due date';
    return formatPaymentDate(dateStr);
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    return formatPaymentTime(dateStr);
  };

  const formatAmount = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  const handlePayPress = (e: any) => {
    e.stopPropagation();
    onPayPress?.();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={opacity.veryStrong}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShText
            variant={ShTextVariant.Total}
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </ShText>
          <ShText variant={ShTextVariant.SmallX} style={styles.teamName}>
            {teamName}
          </ShText>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.amountBadge}>
            <ShText variant={ShTextVariant.Small} style={styles.amount}>
              {formatAmount(amountPence)}
            </ShText>
          </View>
          {paymentType === PaymentType.REQUIRED &&
            paymentStatus !== PaymentStatus.PAID && (
              <ShIcon
                name={IconName.Alert}
                size={spacing.iconSizeSmall}
                color={colorPalette.primaryGold}
              />
            )}
        </View>
      </View>

      {/* Date/Time Row */}
      {dueDate && (
        <View style={styles.dateRow}>
          <ShIcon
            name={IconName.CalendarOutline}
            size={spacing.iconSm}
            color={colorPalette.stoneGrey}
          />
          <ShText variant={ShTextVariant.Body} style={styles.dateText}>
            {formatDate(dueDate)}
          </ShText>

          <ShIcon
            name={IconName.Clock}
            size={spacing.iconSm}
            color={colorPalette.stoneGrey}
          />
          <ShText variant={ShTextVariant.Body} style={styles.timeText}>
            {formatTime(dueDate)}
          </ShText>
        </View>
      )}

      {/* Pay Button */}
      {paymentStatus !== PaymentStatus.PAID && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayPress}
          activeOpacity={opacity.almostOpaque}
        >
          <ShText variant={ShTextVariant.Body} style={styles.payButtonText}>
            Pay Now
          </ShText>
        </TouchableOpacity>
      )}

      {/* Paid Badge */}
      {paymentStatus === PaymentStatus.PAID && (
        <View style={styles.paidBadge}>
          <ShText variant={ShTextVariant.Small} style={styles.paidText}>
            Paid
          </ShText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.backgroundListItem,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.paymentCardBorderRadius,
    padding: spacing.paymentCardPadding,
    gap: spacing.paymentCardGap,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colorPalette.lightText,
    fontSize: fontSizes.lg,
    lineHeight: spacing.lgx + 3,
  },
  teamName: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.sm,
    lineHeight: spacing.lgx - 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  amountBadge: {
    backgroundColor: colorPalette.tabBackgroundColor,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
  },
  amount: {
    color: colorPalette.lightText,
    fontSize: fontSizes.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.md,
    marginRight: spacing.lgx,
  },
  timeText: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.md,
  },
  payButton: {
    backgroundColor: colorPalette.backgroundPrimary,
    borderRadius: spacing.md,
    height: spacing.buttonHeightMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  payButtonText: {
    color: colorPalette.white,
    fontSize: fontSizes.md,
  },
  paidBadge: {
    backgroundColor: colorPalette.tabActiveBackgroundColor,
    borderRadius: spacing.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  paidText: {
    color: colorPalette.success,
    fontSize: fontSizes.sm,
  },
});

export type { ShPaymentCardProps };
