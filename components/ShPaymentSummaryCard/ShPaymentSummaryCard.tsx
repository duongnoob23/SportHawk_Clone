import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ShText } from '../ShText/ShText';
import { ShIcon } from '../ShIcon/ShIcon';
import { IconName } from '@con/icons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { opacity } from '@con/opacity';
import { ShTextVariant, fontSizes } from '@con/typography';

interface ShPaymentSummaryCardProps {
  count: number;
  message?: string;
  onPress?: () => void;
}

export const ShPaymentSummaryCard: React.FC<ShPaymentSummaryCardProps> = ({
  count,
  message = 'Please ensure all required payments are met. Contact team admins if you need support',
  onPress,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? opacity.almostOpaque : opacity.full}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShIcon
            name={IconName.Alert}
            size={spacing.iconSizeSmall}
            color={colorPalette.primaryGold}
          />
          <ShText variant={ShTextVariant.Body} style={styles.title}>
            Action Required
          </ShText>
        </View>
        <ShText variant={ShTextVariant.SmallX} style={styles.count}>
          {count} payment{count !== 1 ? 's' : ''}
        </ShText>
      </View>

      {/* Message */}
      <ShText variant={ShTextVariant.SmallX} style={styles.message}>
        {message}
      </ShText>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.actionRequiredBackgroundColor,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.tabActiveBackgroundColor,
    borderRadius: spacing.paymentCardBorderRadius,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.paymentSummaryIconGap,
  },
  title: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.body,
  },
  count: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.small,
  },
  message: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.small,
    lineHeight: spacing.lgx,
    opacity: opacity.almostOpaque,
  },
});

export type { ShPaymentSummaryCardProps };
