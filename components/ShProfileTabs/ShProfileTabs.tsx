import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ShText } from '../ShText';

import { ShTextVariant } from '@con/typography';
import { colorPalette } from '@top/constants/colors';
import { spacing } from '@top/constants/spacing';

interface Tab {
  id: string;
  label: string;
}

interface ShProfileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

export const ShProfileTabs: React.FC<ShProfileTabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={
            activeTab === tab.id
              ? { ...styles.tab, ...styles.activeTab }
              : styles.tab
          }
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <ShText
            variant={ShTextVariant.Body}
            style={
              activeTab === tab.id
                ? { ...styles.tabText, ...styles.activeTabText }
                : styles.tabText
            }
          >
            {tab.label}
          </ShText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    opacity: 0.8,
  },
  tab: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.smd,
    borderRadius: spacing.tabBorderradius,
    justifyContent: 'center',
    backgroundColor: colorPalette.tabBackgroundColor,
    alignItems: 'center',
    alignSelf: 'center',
  },
  activeTab: {
    backgroundColor: colorPalette.tabActiveBackgroundColor,
  },
  tabText: {
    color: colorPalette.stoneGrey,
    textAlign: 'center',
    paddingBottom: 0,
  },
  activeTabText: {
    color: colorPalette.primaryGold,
  },
});
