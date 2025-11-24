import { ShIcon, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontSizes, ShTextVariant } from '@con/typography';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { DropdownMenuProps } from './types';

const ShDropdownMenu = ({
  items,
  isVisible,
  onClose,
  position = 'top',
  offset = spacing.md,
  testID = 'dropdown-menu',
}: DropdownMenuProps) => {
  if (!isVisible) return null;

  const containerStyle = [
    styles.container,
    // position === 'top' ? { top: offset } : { bottom: offset },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Dropdown menu */}
      <View style={containerStyle} testID={testID}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.item,
              item.disabled && styles.itemDisabled,
              item.destructive && styles.itemDestructive,
              index === items.length - 1 && styles.lastItem,
            ]}
            onPress={() => {
              if (!item.disabled) {
                item.onPress();
                onClose();
              }
            }}
            disabled={item.disabled}
            testID={`dropdown-item-${item.id}`}
          >
            {item.icon && (
              <ShIcon
                name={item.icon}
                size={spacing.iconSizeSmall}
                color={
                  item.disabled
                    ? colorPalette.stoneGrey
                    : item.destructive
                      ? colorPalette.error
                      : colorPalette.stoneGrey
                }
              />
            )}

            <ShText
              variant={ShTextVariant.Body}
              style={[
                styles.itemText,
                item.disabled && styles.itemTextDisabled,
                item.destructive && styles.itemTextDestructive,
              ]}
            >
              {item.label}
            </ShText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colorPalette.baseDark,
    zIndex: spacing.zIndexDropdown,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    gap: spacing.xxl,
    borderWidth: 0.5,
    borderEndEndRadius: 0,
    borderStartEndRadius: 0,
    borderBottomColor: colorPalette.borderDropdown,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    minHeight: spacing.buttonHeightMedium,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemDestructive: {
    // Add any destructive styling if needed
  },
  itemText: {
    color: colorPalette.stoneGrey,
    paddingLeft: spacing.md,
    fontSize: fontSizes.md,
  },
  itemTextDisabled: {
    color: colorPalette.stoneGrey,
    opacity: 0.5,
  },
  itemTextDestructive: {
    color: colorPalette.error,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: spacing.zIndexDropdown - 1,
  },
});

export default ShDropdownMenu;
