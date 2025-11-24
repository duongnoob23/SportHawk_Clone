import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { ShIcon } from '../ShIcon/ShIcon';
import { IconName } from '@con/icons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';

export interface ShDotMenuOption {
  label: string;
  action: () => void;
  destructive?: boolean;
}

export interface ShDotMenuProps {
  options: ShDotMenuOption[];
  testID?: string;
}

export const ShDotMenu: React.FC<ShDotMenuProps> = ({ options, testID }) => {
  const handlePress = () => {
    if (Platform.OS === 'ios') {
      const actionSheetOptions = [...options.map(opt => opt.label), 'Cancel'];
      const destructiveButtonIndex = options.findIndex(opt => opt.destructive);

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: actionSheetOptions,
          cancelButtonIndex: actionSheetOptions.length - 1,
          destructiveButtonIndex:
            destructiveButtonIndex >= 0 ? destructiveButtonIndex : undefined,
        },
        buttonIndex => {
          if (buttonIndex < options.length) {
            options[buttonIndex].action();
          }
        }
      );
    } else {
      // For Android, use Alert with buttons
      const buttons = options.map(opt => ({
        text: opt.label,
        onPress: opt.action,
        style: opt.destructive
          ? ('destructive' as const)
          : ('default' as const),
      }));
      buttons.push({
        text: 'Cancel',
        style: 'cancel' as const,
        onPress: () => {},
      });

      Alert.alert('Actions', undefined, buttons);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      testID={testID}
      activeOpacity={0.7}
    >
      <ShIcon
        name={IconName.Edit}
        size={spacing.iconSizeMedium}
        color={colorPalette.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
