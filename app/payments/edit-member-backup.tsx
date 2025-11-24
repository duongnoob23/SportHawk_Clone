import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import {
  ShMemberListItem,
  ShScreenHeader,
  ShSearchMembers,
  ShText,
} from '@cmp/index';

import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant, fontSizes, fontWeights } from '@con/typography';

import { MemberData1 } from '@top/features/event/types';
import { useSearchFilter } from '@top/hooks/useSearchFilter';
import useEventFormStore from '@top/stores/eventFormStore';
import usePaymentFormStore from '@top/stores/paymentFormStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MemberData {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  profile_photo_uri: string | null;
  position?: string | null;
  [key: string]: unknown;
}

export default function PaymentEditMembersScreen() {
  const params = useLocalSearchParams<{
    teamId: string;
    returnRoute?: string;
  }>();
  const insets = useSafeAreaInsets();

  const { formData: formDataMember, updateInvitationMembers } =
    useEventFormStore();

  const members = formDataMember.invitationMembers || [];

  const {
    searchQuery: searchQueryMember,
    setSearchQuery: setSearchQueryMember,
    filteredItems: filteredItemsMember,
  } = useSearchFilter(members, {
    searchFields: ['profiles.first_name', 'profiles.last_name', 'position'],
    caseSensitive: false,
  });

  const toggleMemberSelection1 = (member: MemberData1) => {
    const current = formDataMember.invitationMembers || [];
    const newCurrent = current.map(item =>
      item.userId === member.userId
        ? { ...item, isChoose: !item.isChoose }
        : item
    );
    updateInvitationMembers(newCurrent);
  };

  const handleSelectAll1 = () => {
    const currentMembers = formDataMember.invitationMembers || [];
    const allSelected = currentMembers.every(member => member.isChoose);
    const updated = currentMembers.map(item => ({
      ...item,
      isChoose: !allSelected,
    }));
    updateInvitationMembers(updated);
  };

  // ------------------------------------------------------------

  const { formData, updateField } = usePaymentFormStore();

  const [loading, setLoading] = useState(true);
  const [allMembers, setAllMembers] = useState<MemberData[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );

  const { searchQuery, setSearchQuery, filteredItems } = useSearchFilter(
    allMembers,
    {
      searchFields: ['first_name', 'last_name', 'position'],
      caseSensitive: false,
    }
  );

 
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <ShText variant={ShTextVariant.SectionTitle} style={styles.searchLabel}>
        Members
      </ShText>
      <ShSearchMembers
        value={searchQueryMember}
        onChangeText={setSearchQueryMember}
        placeholder="Search members..."
      />
    </View>
  );

  const renderMembersList = () => {
    if (!filteredItemsMember) return null;

    if (filteredItemsMember.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ShText variant={ShTextVariant.Body} style={styles.emptyText}>
            {searchQueryMember
              ? 'No members found matching your search'
              : 'No members found for this team'}
          </ShText>
        </View>
      );
    }

    return filteredItemsMember.map(member => {
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
          onPress={() => toggleMemberSelection1(member)}
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

        <View style={styles.membersList}>{renderMembersList()}</View>
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, marginBottom: insets.bottom }}>
      <ShScreenHeader
        title="Select Members"
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft,
          onPress: () => router.back(),
        }}
        rightAction={{
          type: 'text',
          text:
            selectedUserIds.size === allMembers.length
              ? 'Deselect All'
              : 'Select All',
          onPress: handleSelectAll1,
          textColor: colorPalette.primaryGold,
        }}
      />

      <View style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
        {renderContent()}

        {/* Footer with selection count and Done button */}
        <View style={styles.footer}>
          <ShText variant={ShTextVariant.Body} style={styles.selectionCount}>
            {selectedUserIds.size} selected
          </ShText>
          <TouchableOpacity
            // onPress={handleDone}
            style={styles.doneButton}
            disabled={selectedUserIds.size === 0}
          >
            <ShText
              variant={ShTextVariant.Button}
              style={[
                styles.doneButtonText,
                selectedUserIds.size === 0 && styles.doneButtonTextDisabled,
              ]}
            >
              Done
            </ShText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl * 2, // Space for footer
  },
  searchContainer: {
    paddingVertical: spacing.md,
  },
  searchLabel: {
    color: colorPalette.white,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorPalette.baseDark,
    borderRadius: spacing.borderRadiusMedium,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colorPalette.borderColor,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    color: colorPalette.baseDark,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  statsText: {
    color: colorPalette.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: colorPalette.textSecondary,
    textAlign: 'center',
  },
  // Footer styles
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
    color: colorPalette.textSecondary,
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
  membersList: {
    gap: spacing.sm,
  },
});
