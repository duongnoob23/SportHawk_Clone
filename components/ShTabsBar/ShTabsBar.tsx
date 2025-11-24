import { ShSpacer, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { TABS } from '@top/features/teams/constants';
import { TabType, UserTeam } from '@top/features/teams/types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export interface ShTabsBarProps {
  activeTab: TabType;
  selectedTeam?: UserTeam | null;
  onTabPress: (tab: TabType) => void;
  tabs?: { key: TabType; label: string; adminOnly?: boolean }[];
  style?: any;
  containerStyle?: any;
  handleTabsAllToMemberOrAdmin: () => void;
}

/**
 * Reusable TabsBar component for navigation between different sections
 *
 * @param activeTab - Currently active tab
 * @param selectedTeam - Team data to check admin permissions
 * @param onTabPress - Callback when a tab is pressed
 * @param tabs - Custom tabs configuration (defaults to TABS from constants)
 * @param style - Additional styles for the container
 * @param containerStyle - Additional styles for the tab container
 */
export const ShTabsBar: React.FC<ShTabsBarProps> = ({
  activeTab,
  selectedTeam,
  onTabPress,
  tabs = TABS,
  style,
  containerStyle,
  handleTabsAllToMemberOrAdmin,
}) => {
  const handleTabMember = (tabKey: TabType) => {

    if (selectedTeam === null && (tabKey == 'members' || tabKey == 'admins')) {
      handleTabsAllToMemberOrAdmin();
    }
    onTabPress(tabKey);
  };

  return (
    <View style={[styles.tabContainer, containerStyle]}>
      <ShSpacer size={spacing.md} />
      <View style={[styles.tabRow, style]}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          // const isDisabled = tab.adminOnly && !selectedTeam?.is_admin;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                isActive && styles.activeTab,
                // isDisabled && styles.disabledTab,
              ]}
              // onPress={() => !isDisabled && onTabPress(tab.key)}
              onPress={() => handleTabMember(tab.key)}
              // onPress={() => !isDisabled && handleTabMember(tab.key)}
              // disabled={isDisabled}
              testID={`tab-${tab.key}`}
            >
              <ShText
                variant={ShTextVariant.TabText}
                style={[
                  styles.tabText,
                  isActive && styles.activeTabText,
                  // isDisabled && styles.disabledTabText,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </ShText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.none,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.tabGap,
  },
  tabButton: {
    flex: 1,
    height: spacing.tabHeight,
    borderRadius: spacing.borderRadiusLarge,
    backgroundColor: colorPalette.baseDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colorPalette.primaryGold,
  },
  disabledTab: {
    opacity: 1,
  },
  tabText: {
    textAlign: 'center',
  },
  activeTabText: {
    color: colorPalette.baseDark,
  },
  disabledTabText: {
    color: colorPalette.textSecondary,
  },
});
