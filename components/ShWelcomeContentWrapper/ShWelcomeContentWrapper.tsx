import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { spacing } from '@con/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface ShWelcomeContentWrapperProps {
  children: React.ReactNode;
}

export const ShWelcomeContentWrapper: React.FC<
  ShWelcomeContentWrapperProps
> = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    marginTop: -90, // Overlap the video
    // backgroundColor: colorPalette.error,
    backgroundColor: 'transparent',
    width: screenWidth,
    paddingHorizontal: spacing.xl,
    // paddingVertical: spacing.sm,
    alignItems: 'center',
    zIndex: 5,
    position: 'relative',
  },
});
