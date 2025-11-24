import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { fontSizes, ShTextVariant } from '@con/typography';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ShIcon } from '../ShIcon';
import { ShText } from '../ShText';

interface ShNavItemProps {
  label: string;
  subtitle?: string;
  onPress: () => void;
  required?: boolean;
  disabled?: boolean;
  testID?: string;
  showDropdownIcon?: boolean; // For showing down arrow along with right arrow
  isSpaceBetween?: boolean;
  isSpaceBetweenNotColor?: boolean;
}

export function ShNavItem({
  label,
  subtitle,
  onPress,
  required = false,
  disabled = false,
  testID,
  isSpaceBetween = false,
  isSpaceBetweenNotColor = false,
  showDropdownIcon = false,
}: ShNavItemProps) {
  return (
    <>
      <View>
        <ShText variant={ShTextVariant.Body} style={styles.label}>
          {label}
          {required && (
            <ShText
              variant={ShTextVariant.Body}
              color={colorPalette.primaryGold}
            >
              {' '}
              *
            </ShText>
          )}
        </ShText>
      </View>
      <TouchableOpacity
        style={[
          styles.container,
          disabled && styles.disabled,
          isSpaceBetween && styles.containerPassword,
        ]}
        onPress={onPress}
        disabled={disabled}
        testID={testID}
      >
        <View
          style={[
            styles.rightContent,

            isSpaceBetween && {
              width: '100%',
              justifyContent: 'space-between',
            },
            isSpaceBetweenNotColor && {
              width: '100%',
              justifyContent: 'space-between',
            },
          ]}
        >
          <View>
            {subtitle && (
              <ShText variant={ShTextVariant.Caption} style={styles.subtitle}>
                {subtitle}
              </ShText>
            )}
          </View>

          <View>
            <ShIcon
              name={IconName.RightArrow}
              size={spacing.iconSizeSmall}
              color={colorPalette.stoneGrey}
            />
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colorPalette.baseDark,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    padding: spacing.md,
    minHeight: spacing.buttonHeightLarge,
  },
  containerPassword: {
    backgroundColor: colorPalette.timeBackground,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colorPalette.white,
    flex: 1,
    marginBottom: spacing.sm,
    fontSize: spacing.mdx,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subtitle: {
    color: colorPalette.textLight,
    fontSize: fontSizes.md,
  },
});
