import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ShText } from '@cmp/ShText';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';

interface ShLoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export function ShLoadingSpinner({
  size = 'large',
  text,
  fullScreen = true,
}: ShLoadingSpinnerProps) {
  const containerStyle = fullScreen
    ? styles.fullScreenContainer
    : styles.inlineContainer;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={colorPalette.primaryGold} />
      {text && (
        <ShText variant={ShTextVariant.Body} style={styles.loadingText}>
          {text}
        </ShText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colorPalette.textPrimary,
  },
});
