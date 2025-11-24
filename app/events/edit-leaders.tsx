import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import {
  ShIcon,
  ShMemberListItem,
  ShScreenHeader,
  ShSearchMembers,
  ShSpacer,
  ShText,
} from '@cmp/index';

import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { fontWeights, ShTextVariant } from '@con/typography';

import { LeaderData1, SelectAllButtonProps } from '@top/features/event/types';
import { useSearchFilter } from '@top/hooks/useSearchFilter';
import useEventFormStore from '@top/stores/eventFormStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditLeadersScreen() {
  const { formData, updateInvitationLeaders } = useEventFormStore();

  const { searchQuery, setSearchQuery, filteredItems } = useSearchFilter(
    formData.invitationLeaders || [],
    {
      searchFields: [
        'profiles.first_name',
        'profiles.last_name',
        'role',
        'title',
      ],
      caseSensitive: false,
    }
  );

  const toggleLeaderSelection = (leader: LeaderData1) => {
    const currentLeaders = formData.invitationLeaders || [];

    const updated = currentLeaders.map(item =>
      item.userId === leader.userId
        ? { ...item, isChoose: !item.isChoose }
        : item
    );

    updateInvitationLeaders(updated);
  };
  const allSelected = useMemo(() => {
    const list = formData?.invitationLeaders || [];
    return list.length > 0 && list.every(leader => leader.isChoose);
  }, [formData.invitationLeaders]);
  const handleSelectAll = () => {
    const currentLeaders = formData.invitationLeaders || [];
    const allSelected = currentLeaders.every(leader => leader.isChoose);
    const updated = currentLeaders.map(item => ({
      ...item,
      isChoose: !allSelected,
    }));
    updateInvitationLeaders(updated);
  };

  const SelectAllButton = ({ onPress, leaders }: SelectAllButtonProps) => (
    <TouchableOpacity onPress={onPress} style={{ marginRight: spacing.md }}>
      <ShText
        variant={ShTextVariant.Body}
        style={{ color: colorPalette.primaryGold }}
      >
        {(leaders || []).every(leader => leader.isChoose)
          ? 'Deselect All'
          : 'Select All'}
      </ShText>
    </TouchableOpacity>
  );

  const handleBack = () => {
    router.back();
  };

  const BackButton = () => (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ paddingLeft: spacing.md }}
    >
      <ShIcon
        name={IconName.BackArrow}
        size={spacing.iconSizeSmall}
        color={colorPalette.textLight}
      />
    </TouchableOpacity>
  );

  const headerLeftComponent = () => <BackButton />;

  const headerRightComponent = () => (
    <SelectAllButton
      onPress={handleSelectAll}
      leaders={formData.invitationLeaders}
    />
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <ShSearchMembers
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search..."
      />
    </View>
  );

  const renderLeadersList = () => {
    if (!filteredItems) return null;

    if (filteredItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ShText variant={ShTextVariant.Body} style={styles.emptyText}>
            {searchQuery
              ? 'No leaders found matching your search'
              : 'No leaders found for this team'}
          </ShText>
        </View>
      );
    }

    return filteredItems.map(leader => {
      const displayName =
        `${leader.profiles?.firstName || ''} ${leader.profiles?.lastName || ''}`.trim() ||
        'Unknown';

      const subtitle = leader?.profiles?.lastName || leader.role || 'Coach';

      return (
        <ShMemberListItem
          key={leader.id}
          name={displayName}
          subtitle={subtitle}
          photoUri={leader?.profiles?.profilePhotoUri || ''}
          isSelected={leader.isChoose}
          onPress={() => toggleLeaderSelection(leader)}
        />
      );
    });
  };

  const renderContent = () => {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ShSpacer size={spacing.xxl} />
        <View style={styles.sectionHeader}>
          <ShText
            variant={ShTextVariant.Subheading}
            style={styles.sectionTitle}
          >
            Leaders
          </ShText>
        </View>
        <ShSpacer size={spacing.xxl} />
        {renderSearchBar()}
        <ShSpacer size={spacing.xxl} />
        <View style={styles.leadersList}>{renderLeadersList()}</View>
      </ScrollView>
    );
  };

  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        marginBottom: insets.bottom,
      }}
    >
      <ShScreenHeader
        title="Select Leaders"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: handleBack,
        }}
        rightAction={{
          type: 'text',
          onPress: handleSelectAll,
          text: !allSelected ? 'Select All' : 'Deselect All',
          textColor: colorPalette.primaryGold,
        }}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: colorPalette.baseDark,
        }}
      >
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xxxl * 2,
    paddingHorizontal: spacing.xxl,
  },
  sectionHeader: {},
  sectionTitle: {
    color: colorPalette.white,
  },
  searchContainer: {
    // marginBottom: spacing.xl,
  },
  leadersList: {
    gap: spacing.sm,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: colorPalette.stoneGrey,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colorPalette.baseDark,
    borderTopWidth: spacing.borderWidthThin,
    borderTopColor: 'rgba(158, 155, 151, 0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionCount: {
    color: colorPalette.stoneGrey,
  },
  doneButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMedium,
    backgroundColor: colorPalette.primaryGold,
  },
  doneButtonText: {
    color: colorPalette.baseDark,
    fontWeight: fontWeights.medium,
  },
  borderMemberList: {
    padding: 16,
    borderWidth: 1,
    borderColor: colorPalette.borderSubtle,
    borderRadius: spacing.borderRadiusXLarge,
    marginBottom: 12,
    backgroundColor: colorPalette.backgroundListItem,
  },
});
