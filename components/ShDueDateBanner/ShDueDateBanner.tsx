import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShText } from '../ShText/ShText';
import { ShTextVariant, fontSizes } from '@con/typography';
import { ShIcon } from '../ShIcon/ShIcon';
import { IconName } from '@con/icons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';

interface ShDueDateBannerProps {
  dueDate: string | null;
}

export function ShDueDateBanner({ dueDate }: ShDueDateBannerProps) {
  if (!dueDate) return null;

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    const formattedDate = date.toLocaleDateString('en-GB', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-GB', timeOptions);
    return `${formattedDate} • ${formattedTime}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <ShIcon
          name={IconName.Clock}
          size={spacing.iconSizeSmall}
          color={colorPalette.primaryGold}
        />
        <ShText variant={ShTextVariant.Body} style={styles.label}>
          Due by
        </ShText>
      </View>

      <ShText variant={ShTextVariant.Body} style={styles.dateText}>
        {formatDueDate(dueDate)}
      </ShText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.paymentDueDateBannerBg,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.paymentDueDateBannerBorder,
    borderRadius: spacing.paymentDetailBorderRadius,
    padding: spacing.paymentDetailBannerPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.paymentDetailSectionGap,
  },
  label: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.md,
  },
  dateText: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.md,
  },
});
