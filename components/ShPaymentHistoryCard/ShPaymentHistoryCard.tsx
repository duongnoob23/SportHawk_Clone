import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShIcon } from '@top/components/ShIcon';
import { ShText } from '@top/components/ShText';
import {
  PaymentUIConstants,
  formatCurrency,
  formatPaymentDate,
  formatPaymentTime,
} from '@top/features/payments/constants';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface PaymentHistoryItem {
  id: string;
  title: string;
  team_name: string;
  amount_pence: number;
  payment_date: string;
  status: string;
  stripe_payment_intent_id?: string;
}

interface ShPaymentHistoryCardProps {
  payment: PaymentHistoryItem;
  onPress: () => void;
}

export const ShPaymentHistoryCard: React.FC<ShPaymentHistoryCardProps> = ({
  payment,
  onPress,
}) => {
  const formattedAmount = formatCurrency(payment.amount_pence);
  const formattedDate = formatPaymentDate(payment.payment_date);
  const formattedTime = formatPaymentTime(payment.payment_date);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={PaymentUIConstants.CARD_PRESS_OPACITY}
      accessibilityLabel={`Payment: ${payment.title}, ${formattedAmount}, ${formattedDate}`}
      accessibilityHint="Tap to view payment details"
    >
      <View style={styles.header}>
        <View style={styles.info}>
          <ShText
            variant={ShTextVariant.Body}
            style={{ color: colorPalette.textLight }}
          >
            {payment.title}
          </ShText>
          <ShText
            variant={ShTextVariant.SmallX}
            color={colorPalette.textSecondary}
          >
            {payment.team_name}
          </ShText>
        </View>
        <View style={styles.amountBadge}>
          <ShText variant={ShTextVariant.Label}>{formattedAmount}</ShText>
        </View>
      </View>

      <View style={styles.dateRow}>
        <ShIcon
          name={IconName.Calendar}
          size={PaymentUIConstants.ICON_SIZE_SMALL}
          color={colorPalette.textSecondary}
        />
        <ShText variant={ShTextVariant.Body} color={colorPalette.textSecondary}>
          {formattedDate}
        </ShText>
        <ShText> </ShText>
        <ShIcon
          name={IconName.Clock}
          size={PaymentUIConstants.ICON_SIZE_MEDIUM}
          color={colorPalette.textSecondary}
        />
        <ShText variant={ShTextVariant.Body} color={colorPalette.textSecondary}>
          {formattedTime}
        </ShText>
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={onPress}
        accessibilityLabel="View payment details"
      >
        <ShText variant={ShTextVariant.Body} color={colorPalette.baseDark}>
          View Payment
        </ShText>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colorPalette.paymentCardBackground,
    borderRadius: PaymentUIConstants.CARD_BORDER_RADIUS,
    padding: PaymentUIConstants.CARD_PADDING,
    borderWidth: PaymentUIConstants.CARD_BORDER_WIDTH,
    borderColor: colorPalette.paymentCardBorder,
    gap: PaymentUIConstants.ITEM_GAP,
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  amountBadge: {
    backgroundColor: colorPalette.paymentAmountBadge,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: PaymentUIConstants.BADGE_BORDER_RADIUS,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PaymentUIConstants.ROW_GAP,
  },
  viewButton: {
    backgroundColor: colorPalette.primary,
    borderRadius: PaymentUIConstants.BUTTON_BORDER_RADIUS,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
