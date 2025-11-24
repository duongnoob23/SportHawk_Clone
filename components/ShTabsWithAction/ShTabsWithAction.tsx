import { ShButtonVariant } from '@con/buttons';
import React from 'react';
import { View } from 'react-native';
import { ShButton } from '../ShButton';
import { ShProfileTabs } from '../ShProfileTabs';
import { styles } from './styles';

interface ShTabsWithActionProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabPress: (tab: string) => void;
  actionButtonText?: string;
  actionButtonDisabled?: boolean;
  actionButtonLoading?: boolean;
  onActionPress?: () => void;
  isTeamMember?: boolean;
}

export const ShTabsWithAction: React.FC<ShTabsWithActionProps> = ({
  tabs,
  activeTab,
  onTabPress,
  actionButtonText = 'Join us',
  actionButtonDisabled = false,
  actionButtonLoading = false,
  onActionPress,
  isTeamMember,
}) => {
  return (
    <View style={styles.container}>
      <ShProfileTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={onTabPress}
      />
      {!isTeamMember && (
        <ShButton
          variant={ShButtonVariant.Primary}
          onPress={onActionPress}
          style={styles.actionButton}
          loading={actionButtonLoading}
          disabled={actionButtonDisabled}
        >
          {actionButtonText}
        </ShButton>
      )}
    </View>
  );
};
