import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { fontSizes, fontWeights } from '@con/typography';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../../features/payments/constants/paymentUtils';
import { ShButton } from '../ShButton';
import { ShIcon } from '../ShIcon';

export interface ShAdminPaymentCardProps {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  dueTime: string;
  paidCount?: number;
  totalCount?: number;
  teamType?: string;
  onManage: () => void;
  testID?: string;
}

export const ShAdminPaymentCard: React.FC<ShAdminPaymentCardProps> = ({
  id,
  title,
  amount,
  dueDate,
  dueTime,
  paidCount = 0,
  totalCount = 0,
  teamType,
  onManage,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.teamType}>{teamType}</Text>
        </View>
        <View style={styles.amountBadge}>
          <Text style={styles.amountText}>{formatCurrency(amount)}</Text>
        </View>
      </View>

      {/* <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          {paidCount} of {totalCount} paid
        </Text>
      </View> */}

      <View style={styles.dateTimeSection}>
        <View style={[styles.dateTimeRow, { marginRight: spacing.xxl }]}>
          <ShIcon
            name={IconName.Calendar}
            size={spacing.iconSizeSmall}
            color={colorPalette.textSecondary}
          />
          <Text style={styles.dateTimeText}>{dueDate}</Text>
        </View>

        <View style={styles.dateTimeRow}>
          <ShIcon
            name={IconName.Clock}
            size={spacing.iconSizeSmall}
            color={colorPalette.textSecondary}
          />
          <Text style={styles.dateTimeText}>{dueTime}</Text>
        </View>
      </View>

      <ShButton
        title="Manage Request"
        onPress={onManage}
        variant={ShButtonVariant.Primary}
        textStyle={{ fontSize: spacing.lg, fontWeight: fontWeights.regular }}
        style={{ height: spacing.buttonHeightMedium }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.paymentCardBackground,
    borderRadius: spacing.borderRadiusLarge,
    borderWidth: 1,
    borderColor: colorPalette.paymentCardBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg2,
    fontWeight: '400',
    color: colorPalette.lightText,
    marginBottom: spacing.xs,
  },
  teamType: {
    fontSize: fontSizes.sm,
    color: colorPalette.paymentStatusCancelled,
  },
  amountBadge: {
    backgroundColor: colorPalette.paymentAmountBadge,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMedium,
  },
  amountText: {
    fontSize: fontSizes.sm,
    fontWeight: '400',
    color: colorPalette.lightText,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressText: {
    fontSize: fontSizes.sm,
    color: colorPalette.textSecondary,
  },
  dateTimeSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing.lg,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateTimeText: {
    fontSize: fontSizes.md,
    color: colorPalette.textThird,
  },
});
