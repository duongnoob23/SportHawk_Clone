import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShText } from '@top/components';
import { TabType, UserTeam } from '@top/features/teams/types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TABS } from '../../constants';
type TabButtonProps = {
  activeTab: TabType;
  selectedTeam: UserTeam | null;
  handleTabPress: (tab: TabType) => void;
};

const TabButton = ({
  activeTab,
  selectedTeam,
  handleTabPress,
}: TabButtonProps) => {
  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabRow}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const isDisabled = tab.adminOnly && !selectedTeam?.is_admin;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                isActive && styles.activeTab,
                isDisabled && styles.disabledTab,
              ]}
              onPress={() => !isDisabled && handleTabPress(tab.key)}
              disabled={isDisabled}
            >
              <ShText
                variant={ShTextVariant.TabText}
                style={[
                  styles.tabText,
                  isActive && styles.activeTabText,
                  isDisabled && styles.disabledTabText,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderInputField,
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

export default TabButton;
