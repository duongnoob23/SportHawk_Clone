import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import {
  ShConfirmDialog,
  ShEmptyState,
  ShScreenContainer,
  ShScreenHeader,
  ShSearchMembers,
  ShSectionHeader,
  ShSpacer,
  ShTeamHeader,
} from '@top/components';
import { ShAddMembersCard } from '@top/components/ShAddMembersCard';
import { ShMemberCard } from '@top/components/ShMemberCard';
import { useMemberRemovedtNotification } from '@top/features/event/hooks/useNotification';
import { useInterestExpressionsPendingCount } from '@top/features/teams/hooks/useInterestExpressions';
import { useTeams } from '@top/features/teams/hooks/useTeam';
import {
  useRemoveTeamMembers,
  useTeamMembers,
} from '@top/features/teams/hooks/useTeamMembers';
import {
  MembersListHeaderProps,
  TeamMemberData,
} from '@top/features/teams/types';
import { normalizeSearchText } from '@top/features/teams/utils';
import { logger } from '@top/lib/utils/logger';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ManageMembersScreen() {
  const { id: teamId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMemberData | null>(
    null
  );
  const [showFirstConfirm, setShowFirstConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const {
    mutateAsync: sendMemberRemovedNoti,
    isPending: pendingMemberRemovedNoti,
  } = useMemberRemovedtNotification();

  const { data: teamMembersData, isLoading: teamMembersLoading } =
    useTeamMembers(teamId);

  const { data: teamData, isLoading: teamLoading } = useTeams(teamId);

  const {
    data: interestExpressionsCount,
    isLoading: interestExpressionsCountLoading,
  } = useInterestExpressionsPendingCount(teamId);

  const { mutateAsync: removeTeamMembers } = useRemoveTeamMembers();

  const pendingInterestCount = useMemo(() => {
    if (interestExpressionsCount) {
      return interestExpressionsCount || 0;
    }
  }, [interestExpressionsCount]);

  const teamName = useMemo(() => {
    return teamData?.name;
  }, [teamData]);
  const clubName = useMemo(() => {
    return teamData?.clubs.name;
  }, [teamData]);
  const clubId = useMemo(() => {
    return teamData?.clubs.id;
  }, [teamData]);
  const teamLogo = useMemo(() => {
    return teamData?.teamPhotoUrl;
  }, [teamData]);

  const normalizedMembers = useMemo(
    () =>
      members.map(member => {
        const firstName = member.profiles?.firstName ?? '';
        const lastName = member.profiles?.lastName ?? '';

        return {
          data: member,
          searchKey: normalizeSearchText(`${firstName} ${lastName}`),
        };
      }),
    [members]
  );

  const normalizedQuery = useMemo(
    () => normalizeSearchText(searchQuery),
    [searchQuery]
  );

  const filteredMembers = useMemo(() => {
    if (!normalizedQuery) {
      return members;
    }

    return normalizedMembers
      .filter(entry => entry.searchKey.includes(normalizedQuery))
      .map(entry => entry.data);
  }, [members, normalizedMembers, normalizedQuery]);

  useEffect(() => {
    if (teamMembersData) {
      setMembers(teamMembersData);
    }
  }, [teamMembersData]);

  const handleAddMembersPress = () => {
    if (!teamId || !teamName || !clubName) {
      console.error('Missing required');
      return;
    }
    router.push({
      pathname: `/teams/${teamId}/admin/add-members`,
      params: {
        teamId,
        teamName,
        clubName,
        clubId,
      },
    });
  };

  const handleRemoveMember = (member: TeamMemberData) => {
    setSelectedMember(member);
    setShowFirstConfirm(true);
  };

  const handleFirstConfirm = () => {
    setShowFirstConfirm(false);
    setShowSecondConfirm(true);
  };

  const handleSecondConfirm = async () => {
    if (!selectedMember) return;
    setShowSecondConfirm(false);
    setRemovingMemberId(selectedMember.userId);

    try {
      const userId = selectedMember.userId;

      await removeTeamMembers({
        teamId,
        memberId: userId,
      });

      if (userId && teamName && clubName) {
        await sendMemberRemovedNoti({
          userId: selectedMember.userId,
          teamName: teamName,
          clubName: clubName,
        });
      }
    } catch (error) {
      console.error('Error in handleSecondConfirm', error);
    } finally {
      setRemovingMemberId(null);
      setSelectedMember(null);
    }
  };

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const renderMemberCard = ({ item }: { item: TeamMemberData }) => {
    const memberName =
      `${item.profiles?.firstName || ''} ${item.profiles?.lastName || ''}`.trim();

    return (
      <ShMemberCard
        key={item.id}
        avatar={item.profiles?.profilePhotoUri ?? undefined}
        name={memberName || 'Unknown Member'}
        onRemove={() => handleRemoveMember(item)}
        showRemoveIcon
        isProcessing={removingMemberId === item.userId}
      />
    );
  };

  const MembersListHeader = ({
    teamName,
    teamType,
    teamLogo,
    pendingInterestCount,
    searchValue,
    onSearchChange,
    onAddMembersPress,
  }: MembersListHeaderProps) => (
    <View>
      <ShSpacer size="xxl" />

      <ShTeamHeader
        teamName={teamName || 'Team'}
        teamType={teamType ?? undefined}
        logoUrl={teamLogo}
      />

      <ShSpacer size="xxl" />

      <ShAddMembersCard
        count={pendingInterestCount || 0}
        onPress={onAddMembersPress}
      />

      <ShSpacer size="xxl" />

      <ShSearchMembers
        value={searchValue}
        onChangeText={onSearchChange}
        placeholder="Search members..."
      />

      <ShSpacer size="xxl" />

      <View style={styles.sectionHeaderRow}>
        <ShSectionHeader title="Team Members" />
      </View>

      <ShSpacer size="xxl" />
    </View>
  );

  if (teamLoading || teamMembersLoading || interestExpressionsCountLoading) {
    return (
      <>
        <ShScreenHeader
          title="Manage Members"
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft,
            onPress: () => router.back(),
          }}
          showBorder
        />
        <ShScreenContainer scrollable={false} style={styles.screenContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colorPalette.primaryGold} />
          </View>
        </ShScreenContainer>
      </>
    );
  }
  return (
    <View style={{ flex: 1, marginBottom: insets.bottom }}>
      <ShScreenHeader
        title="Manage Members"
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft,
          onPress: () => router.back(),
        }}
        showBorder
      />

      <ShScreenContainer scrollable={false} style={styles.screenContainer}>
        <FlatList
          data={filteredMembers}
          renderItem={renderMemberCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          ListHeaderComponent={
            <MembersListHeader
              teamName={clubName!}
              teamType={teamName!}
              teamLogo={teamLogo!}
              pendingInterestCount={pendingInterestCount!}
              searchValue={searchQuery}
              onSearchChange={handleSearchChange}
              onAddMembersPress={handleAddMembersPress}
            />
          }
          ListFooterComponent={<ShSpacer size="xxl" />}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <ShEmptyState
                message={
                  searchQuery ? 'No members found' : 'No team members yet'
                }
              />
            </View>
          }
        />
      </ShScreenContainer>

      <ShConfirmDialog
        message={''}
        visible={showFirstConfirm}
        title={`Confirm REMOVING player, ${selectedMember?.profiles?.firstName} ${selectedMember?.profiles?.lastName}`}
        confirmText="Confirm Remove"
        cancelText="Cancel"
        onConfirm={handleFirstConfirm}
        onCancel={() => {
          setShowFirstConfirm(false);
          logger.log('ADM-001: Remove first confirmation', {
            memberId: selectedMember?.userId,
            action: 'cancel',
          });
        }}
      />

      <ShConfirmDialog
        message={''}
        visible={showSecondConfirm}
        title={`Are you sure you want to REMOVE ${selectedMember?.profiles?.firstName} ${selectedMember?.profiles?.lastName} from team: ${teamName}`}
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleSecondConfirm}
        onCancel={() => {
          setShowSecondConfirm(false);
          logger.log('ADM-001: Remove second confirmation', {
            memberId: selectedMember?.userId,
            action: 'no',
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  itemSeparator: {
    height: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterLabel: {
    color: colorPalette.stoneGrey,
  },
  emptyStateContainer: {
    paddingVertical: spacing.xxl,
  },
});
