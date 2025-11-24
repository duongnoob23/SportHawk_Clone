import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { fontSizes, ShTextVariant } from '@con/typography';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ShIcon } from '../ShIcon/ShIcon';
import { ShSpacer } from '../ShSpacer';
import { ShText } from '../ShText/ShText';

interface ShPaymentTitleProps {
  title: string;
  teamName: string;
  teamImageUrl?: string;
}

export function ShPaymentTitle({
  title,
  teamName,
  teamImageUrl,
}: ShPaymentTitleProps) {
  return (
    <View style={styles.container}>
      <ShText variant={ShTextVariant.SubheadingTitle}>{title}</ShText>

      <ShSpacer size={spacing.lg} />

      <View style={styles.requesterRow}>
        <ShText variant={ShTextVariant.Small} style={styles.requesterLabel}>
          Requested by
        </ShText>

        {teamImageUrl ? (
          <Image source={{ uri: teamImageUrl }} style={styles.teamAvatar} />
        ) : (
          <View style={[styles.teamAvatar, styles.teamAvatarPlaceholder]}>
            <ShIcon
              name={IconName.Team}
              size={spacing.sm * 1.5}
              color={colorPalette.stoneGrey}
            />
          </View>
        )}

        <ShText variant={ShTextVariant.Small} style={styles.teamName}>
          {teamName}
        </ShText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.paymentDetailSectionGap,
  },
  requesterLabel: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.sm,
  },
  teamAvatar: {
    width: spacing.paymentDetailAvatarSmall,
    height: spacing.paymentDetailAvatarSmall,
    borderRadius: spacing.paymentDetailAvatarSmall / 2,
  },
  teamAvatarPlaceholder: {
    backgroundColor: colorPalette.paymentAmountBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamName: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.sm,
    flex: 1,
  },
});
