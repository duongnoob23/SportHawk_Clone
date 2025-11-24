import React from 'react';
import { Image } from 'expo-image';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { spacing } from '@con/spacing';

interface ShWelcomeLogoProps {
  style?: any;
  variant?: 'default' | 'xs' | 's' | 'm' | 'l';
  showTitle?: boolean;
  onPress?: () => void;
}

// const { width } = Dimensions.get("window")

export const ShWelcomeLogo: React.FC<ShWelcomeLogoProps> = ({
  style,
  variant = 'default',
  showTitle = true,
  onPress,
}) => {
  const getLogoSize = () => {
    switch (variant) {
      case 'xs':
        return { width: 40, height: 32 };
      case 's':
        return { width: 50, height: 40 };
      case 'm':
        return { width: 100, height: 80 };
      case 'l':
        return { width: 125, height: 100 };
      default:
        return { width: 229, height: 40 };
    }
  };

  const logoSize = getLogoSize();

  const logoContent = (
    <Image
      source={
        showTitle || variant === 'default'
          ? require('@ass/images/sporthawk-logotype.png')
          : require('@ass/images/sporthawk-logo.png')
      }
      style={[styles.logo, logoSize]}
      contentFit="contain"
    />
  );

  return (
    <View style={[styles.container, style]}>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {logoContent}
        </TouchableOpacity>
      ) : (
        logoContent
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: spacing.ShWelcomeLogoContainerWidth,
    alignSelf: 'center',
  },
  logo: {
    width: spacing.ShWelcomeLogoWidth,
    height: spacing.ShWelcomeLogoHeight,
    alignSelf: 'flex-start',
  },
});
