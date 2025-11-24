import { ShIcon, ShSpacer, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';

import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ActionRequiredBanner({
  actionRequiredCount,
}: {
  actionRequiredCount: number;
}) {
  return (
    <>
      <ShSpacer size={spacing.xxl} />

      <View style={styles.actionBanner}>
        <View style={styles.actionBannerHeader}>
          <View style={styles.actionBannerTitle}>
            <ShIcon
              name={IconName.Alert}
              size={spacing.eventAlertIconSize}
              color={colorPalette.primaryGold}
            />
            <ShText
              variant={ShTextVariant.Body}
              style={styles.actionBannerText}
            >
              Action Required
            </ShText>
          </View>
          <ShText
            variant={ShTextVariant.Caption}
            style={styles.actionBannerCount}
          >
            {actionRequiredCount}{' '}
            {actionRequiredCount === 1 ? 'event' : 'events'}
          </ShText>
        </View>
        <ShText
          variant={ShTextVariant.LabelLight}
          style={styles.actionBannerSubtext}
        >
          Please confirm your availability for upcoming events
        </ShText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  actionBanner: {
    backgroundColor: `rgba(234, 189, 34, 0.1)`,
    borderWidth: spacing.borderWidthThin,
    borderColor: `rgba(234, 189, 34, 0.2)`,
    borderRadius: spacing.eventActionBannerBorderRadius,
    padding: spacing.eventActionBannerPadding,
    gap: spacing.eventActionBannerGap,
  },
  actionBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBannerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBannerText: {
    color: colorPalette.primaryGold,
  },
  actionBannerCount: {
    color: colorPalette.primaryGold,
  },
  actionBannerSubtext: {
    color: `rgba(234, 189, 34, 0.8)`,
    marginTop: spacing.xs,
  },
});
