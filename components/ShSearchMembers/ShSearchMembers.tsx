import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { ShIcon } from '@top/components/ShIcon';
import React from 'react';
import { TextInput, View } from 'react-native';
import { styles } from './styles';

interface ShSearchMembersProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/**
 * Search input component for member management screens
 * Simple controlled input without filter button or debounce
 * Used in ADM-001, ADM-002, ADM-003
 */
export const ShSearchMembers: React.FC<ShSearchMembersProps> = ({
  value,
  onChangeText,
  placeholder = 'Search members...',
}) => {
  return (
    <View style={styles.container}>
      <ShIcon name={IconName.Search} size={16} color={colorPalette.stoneGrey} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colorPalette.stoneGrey}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
};
