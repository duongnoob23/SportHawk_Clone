import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { ShText } from '@cmp/ShText';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant, fontWeights } from '@con/typography';

interface ShHeaderButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function ShHeaderButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: ShHeaderButtonProps) {
  const textColor =
    variant === 'primary' ? colorPalette.primary : colorPalette.textPrimary;

  if (loading) {
    return (
      <ActivityIndicator size="small" color={textColor} style={styles.loader} />
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.button}
    >
      <ShText
        variant={ShTextVariant.Body}
        style={[styles.text, { color: textColor }, disabled && styles.disabled]}
      >
        {title}
      </ShText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontWeight: fontWeights.medium,
  },
  disabled: {
    opacity: 0.5,
  },
  loader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
