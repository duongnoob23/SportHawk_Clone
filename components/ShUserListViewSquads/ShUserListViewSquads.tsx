import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { opacity } from '@con/opacity';
import { spacing } from '@con/spacing';
import { fontSizes } from '@con/typography';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ShAvatar } from '../ShAvatar';
import { ShIcon } from '../ShIcon';
import { ShText } from '../ShText';

interface ShUserListProps {
  name: string;
  role: string;
  photo?: string;
  variant?: 'default' | 'admin';
  onPress?: () => void;
}

export const ShUserListViewSquads: React.FC<ShUserListProps> = ({
  name,
  role,
  photo,
  variant = 'default',
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={opacity.veryStrong}
    >
      <View style={styles.content}>
        <ShAvatar size={spacing.avatarSizeLarge} imageUri={photo} name={name} />
        <View style={styles.textContainer}>
          <ShText style={styles.userName}>{name}</ShText>
        </View>
        {variant === 'admin' ? (
          <ShIcon
            name={IconName.Admin}
            size={spacing.xl}
            color={colorPalette.primaryGold}
          />
        ) : (
          <View style={styles.dot} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: colorPalette.error,
    backgroundColor: colorPalette.baseDark,
    borderRadius: spacing.borderRadiusLarge,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.userListAvatarMargin,
    gap: spacing.userListTextGap,
  },
  userName: {
    fontSize: fontSizes.md,
    color: colorPalette.textLight,
  },
  userRole: {
    fontSize: fontSizes.sm,
    color: colorPalette.stoneGrey,
  },
  dot: {
    width: spacing.dotSize,
    height: spacing.dotSize,
    borderRadius: spacing.dotSize / 2,
    backgroundColor: colorPalette.primaryGold,
  },
});
