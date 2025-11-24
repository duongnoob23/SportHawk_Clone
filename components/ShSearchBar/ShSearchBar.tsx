import { ShIcon } from '@cmp/ShIcon';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import React, { useEffect, useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './ShSearchBar.styles';

interface ShSearchBarProps {
  onSearch: (searchText: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  isDisplayFilter?: boolean;
  value: string;
}

export const ShSearchBar: React.FC<ShSearchBarProps> = ({
  onSearch,
  placeholder = 'Start your search...',
  isLoading = false,
  isDisplayFilter = true,
  value,
}) => {
  const [searchText, setSearchText] = useState(value);
  const [hasInitialized, setHasInitialized] = useState(false);

  const handleOnChangText = (text: string) => {
    setSearchText(text);
  };

  // Implement 500ms debounce - only trigger when text actually changes
  useEffect(() => {
    // Skip the initial mount to prevent immediate search
    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }

    const timer = setTimeout(() => {
      onSearch(searchText);
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [searchText]); // Remove onSearch from dependencies

  const handleFilterPress = () => {
    Alert.alert('Coming Soon', 'Feature coming soon!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <ShIcon
          name={IconName.Search}
          size={20}
          color={colorPalette.stoneGrey}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={colorPalette.stoneGrey}
          value={searchText}
          onChangeText={handleOnChangText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {/* {(isLoading || isTyping) && (
          <ActivityIndicator
            size="small"
            color={colorPalette.primaryGold}
            style={styles.loadingIndicator}
          />
        )} */}
      </View>
      {isDisplayFilter && (
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleFilterPress}
          activeOpacity={0.7}
        >
          <ShIcon
            name={IconName.Filters}
            size={20}
            color={colorPalette.lightText}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
