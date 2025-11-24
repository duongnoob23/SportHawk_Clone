import { useState, useCallback } from 'react';
import { TabType } from '@top/features/teams/types';

export interface UseTabNavigationProps {
  initialTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export interface UseTabNavigationReturn {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  handleTabPress: (tab: TabType) => void;
}

/**
 * Custom hook for managing tab navigation state and logic
 *
 * @param initialTab - The initial active tab (defaults to 'events')
 * @param onTabChange - Optional callback when tab changes
 * @returns Object with activeTab, setActiveTab, and handleTabPress
 */
export const useTabNavigation = ({
  initialTab = 'events',
  onTabChange,
}: UseTabNavigationProps = {}): UseTabNavigationReturn => {
  const [activeTab, setActiveTabState] = useState<TabType>(initialTab);

  const setActiveTab = useCallback(
    (tab: TabType) => {
      setActiveTabState(tab);
      onTabChange?.(tab);
    },
    [onTabChange]
  );

  const handleTabPress = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
    },
    [setActiveTab]
  );

  return {
    activeTab,
    setActiveTab,
    handleTabPress,
  };
};
