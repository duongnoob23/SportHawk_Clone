import { ShText } from '@cmp/ShText';
import { buttonStyles, ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface ShButtonProps {
  children?: React.ReactNode; // 1. Add `children` back to the props
  title?: string;
  variant?: ShButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const ShButton: React.FC<ShButtonProps> = ({
  children,
  title,
  variant = ShButtonVariant.Primary,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const finalDisabled = disabled || loading;
  const content = title || children; // 2. Determine content from `title` or `children`

  // 3. Restore the special handling for the Link variant
  if (variant === ShButtonVariant.Link) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={finalDisabled}
        activeOpacity={0.7}
      >
        <ShText variant={ShTextVariant.Body} style={textStyle}>
          {content}
        </ShText>
      </TouchableOpacity>
    );
  }

  // Logic for all other contained button variants
  const variantStyles = buttonStyles[variant];
  const buttonVariantStyle = finalDisabled
    ? variantStyles.disabled
    : variantStyles.default;
  const textColor = buttonVariantStyle.color || colorPalette.textLight;

  return (
    <TouchableOpacity
      style={[buttonVariantStyle, style]}
      onPress={onPress}
      disabled={finalDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.icon}>{icon}</View>}
          {/* 4. Render the `content` inside the button */}
          {content && (
            <ShText
              variant={ShTextVariant.Button}
              style={[{ color: textColor }, textStyle]}
            >
              {content}
            </ShText>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
});
