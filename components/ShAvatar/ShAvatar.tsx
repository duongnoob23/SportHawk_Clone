import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontWeights } from '@con/typography';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ShText } from '../ShText';

interface ShAvatarProps {
  size?: number;
  imageUri?: string | null | undefined;
  name?: string;
}

export const ShAvatar: React.FC<ShAvatarProps> = ({
  size = spacing.avatarSizeLarge,
  imageUri,
  name = '',
}) => {
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 0) return '';
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <ShText style={[styles.initials, { fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </ShText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
  },
  image: {
    backgroundColor: colorPalette.backgroundTertiary,
  },
  initials: {
    color: colorPalette.textLight,
    fontWeight: fontWeights.medium,
  },
});
