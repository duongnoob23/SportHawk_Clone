import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  ShMemberListItem,
  ShScreenHeader,
  ShSearchMembers,
  ShSpacer,
  ShText,
} from '@cmp/index';

import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { fontSizes, fontWeights, ShTextVariant } from '@con/typography';

import { MemberData1 } from '@top/features/event/types';
import { useSearchFilter } from '@top/hooks/useSearchFilter';
import useEventFormStore from '@top/stores/eventFormStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditMembersScreen() {
  const { formData, updateInvitationMembers } = useEventFormStore();
  const insets = useSafeAreaInsets();

  const members = formData.invitationMembers || [];
  const allSelected = members.length > 0 && members.every(m => m.isChoose);
  const { searchQuery, setSearchQuery, filteredItems } = useSearchFilter(
    members,
    {
      searchFields: ['profiles.first_name', 'profiles.last_name', 'position'],
      caseSensitive: false,
    }
  );

  const toggleMemberSelection = (member: MemberData1) => {
    const current = formData.invitationMembers || [];
    const newCurrent = current.map(item =>
      item.userId === member.userId
        ? { ...item, isChoose: !item.isChoose }
        : item
    );
    updateInvitationMembers(newCurrent);
  };

  const handleSelectAll = () => {
    const currentMembers = formData.invitationMembers || [];
    const allSelected = currentMembers.every(member => member.isChoose);
    const updated = currentMembers.map(item => ({
      ...item,
      isChoose: !allSelected,
    }));
    updateInvitationMembers(updated);
  };

  const handleBack = () => {
    router.back();
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <ShSpacer size={spacing.xxl} />
      <ShText variant={ShTextVariant.Subheading} style={styles.searchLabel}>
        Members
      </ShText>
      <ShSpacer size={spacing.xxl} />
      <ShSearchMembers
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search..."
      />
    </View>
  );

  const renderMembersList = () => {
    if (!filteredItems) return null;

    if (filteredItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ShText variant={ShTextVariant.Body} style={styles.emptyText}>
            {searchQuery
              ? 'No members found matching your search'
              : 'No members found for this team'}
          </ShText>
        </View>
      );
    }

    return filteredItems.map(member => {
      const displayName =
        `${member.profiles?.firstName || ''} ${member.profiles.lastName || ''}`.trim() ||
        'Unknown';
      const subtitle = member.position || 'Player';

      return (
        <ShMemberListItem
          key={member.id}
          name={displayName}
          subtitle={subtitle}
          photoUri={member.profiles?.profilePhotoUri}
          isSelected={member.isChoose}
          onPress={() => toggleMemberSelection(member)}
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
        {renderSearchBar()}
        <ShSpacer size={spacing.xxl} />

        <View style={styles.membersList}>{renderMembersList()}</View>
      </ScrollView>
    );
  };
  return (
    <View style={{ flex: 1, marginBottom: insets.bottom }}>
      <ShScreenHeader
        title="Select Members"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: handleBack,
        }}
        rightAction={{
          type: 'text',
          onPress: handleSelectAll,
          text: allSelected ? 'Deselect All' : 'Select All',
          textColor: colorPalette.primaryGold,
        }}
      />

      <View style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
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
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl * 2,
  },
  sectionHeader: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colorPalette.white,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
  },
  searchContainer: {},
  searchLabel: {
    color: colorPalette.white,
  },
  membersList: {
    // gap: spacing.sm,
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
    color: colorPalette.primaryGold,
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
  doneButtonTextDisabled: {
    opacity: 0.5,
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
