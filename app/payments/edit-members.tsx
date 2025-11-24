import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ShIcon, ShMemberListItem, ShScreenHeader, ShText } from '@cmp/index';

import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant, fontSizes, fontWeights } from '@con/typography';

import { teamsApi } from '@lib/api/teams';
import { useSearchFilter } from '@top/hooks/useSearchFilter';
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

  useEffect(() => {
    loadTeamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.teamId]);

  useEffect(() => {
    setSelectedUserIds(new Set(formData.selectedMembers || []));
  }, [formData.selectedMembers]);

  const loadTeamData = async () => {
    if (!params.teamId) {
      Alert.alert('Error', 'No team ID provided');
      router.back();
      return;
    }

    try {
      setLoading(true);

      const members = await teamsApi.getTeamMembersSimple(params.teamId);
      const memberData: MemberData[] = members.map(member => ({
        id: member.id,
        user_id: member.user_id,
        first_name: member.profile?.first_name || null,
        last_name: member.profile?.last_name || null,
        profile_photo_uri: member.profile?.profile_photo_uri || null,
        position: member.position,
      }));
      setAllMembers(memberData);
    } catch (error) {
      console.error('Error loading team members:', error);
      Alert.alert('Error', 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedUserIds.size === allMembers.length) {
      setSelectedUserIds(new Set());
    } else {
      const allUserIds = allMembers.map(m => m.user_id);
      setSelectedUserIds(new Set(allUserIds));
    }
  };

  const handleDone = () => {
    const selectedArray = Array.from(selectedUserIds);

    updateField('selectedMembers', selectedArray);

    router.back();
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <ShText variant={ShTextVariant.SectionTitle} style={styles.searchLabel}>
        Members
      </ShText>
      <View style={styles.searchBar}>
        <ShIcon
          name={IconName.Search}
          size={spacing.iconSizeSmall}
          color={colorPalette.textSecondary}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={colorPalette.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );

  const renderMembersList = () => {
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
        `${String(member.first_name || '')} ${String(member.last_name || '')}`.trim() ||
        'Unknown';
      const subtitle = String(member.position || 'Player');

      return (
        <ShMemberListItem
          key={member.id}
          name={displayName}
          subtitle={subtitle}
          photoUri={member.profile_photo_uri}
          isSelected={selectedUserIds.has(member.user_id)}
          onPress={() => toggleMemberSelection(member.user_id)}
        />
      );
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSearchBar()}

        <View style={styles.statsContainer}>
          <ShText variant={ShTextVariant.Small} style={styles.statsText}>
            {selectedUserIds.size} of {allMembers.length} selected
          </ShText>
        </View>

        <View style={{ gap: spacing.paymentDetailSectionGap }}>
          {renderMembersList()}
        </View>
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
          onPress: handleSelectAll,
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
            onPress={handleDone}
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
    backgroundColor: colorPalette.surface,
    borderRadius: spacing.borderRadiusMedium,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    color: colorPalette.textPrimary,
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
});
