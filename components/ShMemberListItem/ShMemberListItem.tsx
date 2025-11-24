import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ShAvatar } from '../ShAvatar';
import { ShCheckbox } from '../ShCheckbox';
import { ShSpacer } from '../ShSpacer';
import { ShText } from '../ShText';

interface ShMemberListItemProps {
  name?: string;
  subtitle?: string;
  photoUri?: string | null;
  isSelected?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
  testID?: string;
}

export function ShMemberListItem({
  name,
  subtitle,
  photoUri,
  isSelected = false,
  isDisabled = false,
  onPress,
  testID,
}: ShMemberListItemProps) {
  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        disabled={isDisabled || !onPress}
        testID={testID}
      >
        <View style={styles.leftContent}>
          <View style={styles.avatarContainer}>
            <ShAvatar
              size={spacing.avatarSizeMedium2}
              imageUri={photoUri || undefined}
              name={name}
            />
          </View>
          <View style={styles.info}>
            <ShText variant={ShTextVariant.Body} style={styles.name}>
              {name}
            </ShText>
            {subtitle && (
              <ShText
                variant={ShTextVariant.LabelLight}
                style={styles.subtitle}
              >
                {subtitle}
              </ShText>
            )}
          </View>
        </View>

        {/* Checkbox for selection state */}
        <ShCheckbox
          state={isDisabled ? 'cross' : isSelected ? 'active' : 'inactive'}
        />
      </TouchableOpacity>
      <ShSpacer size={spacing.md} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colorPalette.backgroundListItem,
    // backgroundColor: colorPalette.error,
    padding: spacing.listItemPadding,
    borderRadius: spacing.lg,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderColor,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colorPalette.white,
  },
  subtitle: {
    color: colorPalette.stoneGrey,
    marginTop: spacing.xs,
  },
});
