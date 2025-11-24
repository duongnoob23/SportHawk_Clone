import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ShScreenContainer,
  ShText,
  ShSearchMembers,
  ShMemberCard,
  ShEmptyState,
  ShSpacer,
  ShConfirmDialog,
} from '@top/components';

import { teamsApi } from '@lib/api/teams';
import { logger } from '@lib/utils/logger';
import { useUser } from '@hks/useUser';

import { spacing } from '@con/spacing';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { ShTextVariant } from '@con/typography';

interface TeamAdmin {
  user_id: string;
  team_id: string;
  role: string | null;
  is_primary: boolean;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_photo_uri: string | null;
    favorite_position: string | null;
  };
}

interface TeamMember {
  user_id: string;
  role: string | null;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_photo_uri: string | null;
    favorite_position: string | null;
  };
}

export default function ManageAdminsScreen() {
  const { id: teamId } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();

  const [team, setTeam] = useState<any>(null);
  const [admins, setAdmins] = useState<TeamAdmin[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    type: 'remove_first' | 'remove_second' | 'promote' | null;
    userId: string | null;
    userName: string | null;
  }>({
    visible: false,
    type: null,
    userId: null,
    userName: null,
  });

  // Load team details and admins
  useEffect(() => {
    if (!teamId || !user) return;

    logger.log('ADM-003: Manage Admins screen mounted', {
      teamId,
      userId: user.id,
    });

    loadData();

    return () => {
      logger.log('ADM-003: Manage Admins screen unmounted');
    };
  }, [teamId, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load team details
      const teamData = await teamsApi.getTeam(teamId);
      setTeam(teamData);

      // Check if current user is Super Admin
      const superAdminStatus = await teamsApi.checkSuperAdmin(teamId, user.id);
      setIsSuperAdmin(superAdminStatus);

      logger.log('ADM-003: Super Admin status checked', {
        userId: user.id,
        teamId,
        isSuperAdmin: superAdminStatus,
      });

      // Load team admins
      await loadAdmins();
    } catch (error) {
      logger.error('ADM-003: Error loading data', { error, teamId });
      Alert.alert('Error', 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      logger.log('ADM-003: Fetching team admins', { teamId });
      const adminsList = await teamsApi.getTeamAdmins(teamId);

      // Sort: primary admins first, then by created_at
      const sorted = adminsList.sort((a: TeamAdmin, b: TeamAdmin) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });

      setAdmins(sorted);

      logger.log('ADM-003: Team admins loaded', {
        teamId,
        adminCount: sorted.length,
        superAdminCount: sorted.filter((a: TeamAdmin) => a.is_primary).length,
      });
    } catch (error) {
      logger.error('ADM-003: API error', {
        endpoint: 'getTeamAdmins',
        teamId,
        error,
      });
      Alert.alert('Error', 'Error loading admins');
    }
  };

  const canRemoveAdmin = (admin: TeamAdmin): boolean => {
    // Can only remove if:
    // 1. Current user is Super Admin
    // 2. Target is not self
    // 3. Target is not primary admin (can't remove Super Admins)
    return isSuperAdmin && admin.user_id !== user?.id && !admin.is_primary;
  };

  const handleRemovePress = (userId: string, userName: string) => {
    // Self-removal check
    if (userId === user?.id) {
      logger.warn('ADM-003: Self-removal attempt blocked', {
        userId: user.id,
        teamId,
      });
      Alert.alert('Error', 'You cannot remove yourself');
      return;
    }

    logger.log('ADM-003: Admin removal initiated', {
      targetAdminId: userId,
      targetAdminName: userName,
      teamId,
      initiatedBy: user?.id,
      isSuperAdmin: true,
    });

    setConfirmDialog({
      visible: true,
      type: 'remove_first',
      userId,
      userName,
    });
  };

  const handleFirstRemoveConfirm = () => {
    logger.log('ADM-003: Admin removal first confirmation', {
      targetAdminId: confirmDialog.userId,
      action: 'confirm',
    });

    // Show second confirmation
    setConfirmDialog({
      ...confirmDialog,
      type: 'remove_second',
    });
  };

  const handleSecondRemoveConfirm = async () => {
    if (!confirmDialog.userId || !team) return;

    logger.log('ADM-003: Admin removal second confirmation', {
      targetAdminId: confirmDialog.userId,
      action: 'yes',
    });

    setProcessingId(confirmDialog.userId);
    setConfirmDialog({ ...confirmDialog, visible: false });

    try {
      await teamsApi.removeTeamAdminWithNotification(
        teamId,
        confirmDialog.userId,
        team.team_name
      );

      logger.log('ADM-003: Admin removed successfully', {
        targetAdminId: confirmDialog.userId,
        targetAdminName: confirmDialog.userName,
        teamId,
        removedBy: user?.id,
        timestamp: new Date().toISOString(),
      });

      logger.info('ADM-003: AUDIT - Admin change', {
        action: 'remove',
        targetUserId: confirmDialog.userId,
        teamId,
        performedBy: user?.id,
        isSuperAdmin,
        timestamp: new Date().toISOString(),
      });

      // Remove from list
      setAdmins(prev => prev.filter(a => a.user_id !== confirmDialog.userId));

      Alert.alert('Success', `${confirmDialog.userName} removed from admins`);
    } catch (error) {
      logger.error('ADM-003: Admin removal failed', {
        targetAdminId: confirmDialog.userId,
        teamId,
        error,
      });
      Alert.alert('Error', 'Failed to remove admin');
    } finally {
      setProcessingId(null);
      setConfirmDialog({
        visible: false,
        type: null,
        userId: null,
        userName: null,
      });
    }
  };

  const handlePromotePress = (member: TeamMember) => {
    const userName = `${member.user.first_name} ${member.user.last_name}`;

    logger.log('ADM-003: Admin promotion initiated', {
      userId: member.user_id,
      userName,
      teamId,
      promotedBy: user?.id,
    });

    setConfirmDialog({
      visible: true,
      type: 'promote',
      userId: member.user_id,
      userName,
    });
  };

  const handlePromoteConfirm = async () => {
    if (!confirmDialog.userId || !team) return;

    logger.log('ADM-003: Admin promotion confirmation', {
      userId: confirmDialog.userId,
      action: 'confirm',
    });

    setProcessingId(confirmDialog.userId);
    setConfirmDialog({ ...confirmDialog, visible: false });

    try {
      const result = await teamsApi.promoteToAdmin(
        teamId,
        confirmDialog.userId,
        team.team_name
      );

      if (result.success) {
        logger.log('ADM-003: Member promoted to admin', {
          userId: confirmDialog.userId,
          userName: confirmDialog.userName,
          teamId,
          role: 'Admin',
          promotedBy: user?.id,
          timestamp: new Date().toISOString(),
        });

        logger.info('ADM-003: AUDIT - Admin change', {
          action: 'promote',
          targetUserId: confirmDialog.userId,
          teamId,
          performedBy: user?.id,
          isSuperAdmin,
          timestamp: new Date().toISOString(),
        });

        // Reload admins to show new admin
        await loadAdmins();

        // Clear search to remove promoted member
        setSearchQuery('');
        setSearchResults([]);

        Alert.alert('Success', `${confirmDialog.userName} promoted to admin`);
      } else if (result.reason === 'already_admin') {
        logger.warn('ADM-003: User already admin', {
          userId: confirmDialog.userId,
          teamId,
        });
        Alert.alert('Info', 'User is already an admin');
      }
    } catch (error) {
      logger.error('ADM-003: Admin promotion failed', {
        userId: confirmDialog.userId,
        teamId,
        error,
      });
      Alert.alert('Error', 'Failed to promote to admin');
    } finally {
      setProcessingId(null);
      setConfirmDialog({
        visible: false,
        type: null,
        userId: null,
        userName: null,
      });
    }
  };

  const handleCancelDialog = () => {
    const action = confirmDialog.type === 'promote' ? 'promotion' : 'removal';
    logger.log(`ADM-003: Admin ${action} confirmation`, {
      userId: confirmDialog.userId,
      action: 'cancel',
    });
    setConfirmDialog({
      visible: false,
      type: null,
      userId: null,
      userName: null,
    });
  };

  const handleSearchChange = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        logger.log('ADM-003: Search cleared', { teamId });
        setSearchResults([]);
        return;
      }

      logger.log('ADM-003: Non-admin member search initiated', {
        query,
        teamId,
        searchType: 'non_admin_members',
      });

      setIsSearching(true);

      try {
        const results = await teamsApi.searchNonAdminMembers(teamId, query);

        logger.log('ADM-003: Non-admin member search results', {
          query,
          resultCount: results.length,
          teamId,
          excludedAdminCount: admins.length,
        });

        setSearchResults(results);
      } catch (error) {
        logger.error('ADM-003: Search failed', { error, query, teamId });
        Alert.alert('Error', 'Search failed');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [teamId, admins.length]
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colorPalette.baseDark,
            },
            headerTintColor: colorPalette.lightText,
            headerTitle: 'Admins',
          }}
        />
        <SafeAreaView style={{ flex: 1 }}>
          <ShScreenContainer>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator
                size="large"
                color={colorPalette.primaryGold}
              />
            </View>
          </ShScreenContainer>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colorPalette.baseDark,
          },
          headerTintColor: colorPalette.lightText,
          headerTitle: 'Admins',
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ShScreenContainer>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ShSpacer height={spacing.xl} />

            {/* Team Admins Section */}
            <View style={{ paddingHorizontal: spacing.pageMargin }}>
              <ShText variant={ShTextVariant.SectionTitle}>Team Admins</ShText>
            </View>

            <ShSpacer height={spacing.lg} />

            <View style={{ paddingHorizontal: spacing.pageMargin }}>
              {admins.map(admin => (
                <View key={admin.user_id} style={{ marginBottom: spacing.md }}>
                  <ShMemberCard
                    avatar={admin.user.profile_photo_uri}
                    name={`${admin.user.first_name} ${admin.user.last_name}`}
                    subtitle={admin.is_primary ? 'Super Admin' : 'Admin'}
                    showRemoveIcon={canRemoveAdmin(admin)}
                    onRemove={() =>
                      handleRemovePress(
                        admin.user_id,
                        `${admin.user.first_name} ${admin.user.last_name}`
                      )
                    }
                    isProcessing={processingId === admin.user_id}
                  />
                </View>
              ))}
            </View>

            <ShSpacer height={spacing.xl} />

            {/* Search Members Section */}
            <View style={{ paddingHorizontal: spacing.pageMargin }}>
              <ShText variant={ShTextVariant.SectionTitle}>
                Search Members
              </ShText>
            </View>

            <ShSpacer height={spacing.lg} />

            <View style={{ paddingHorizontal: spacing.pageMargin }}>
              <ShSearchMembers
                placeholder="Search..."
                value={searchQuery}
                onChangeText={handleSearchChange}
              />

              <ShSpacer height={spacing.md} />

              <ShText
                variant={ShTextVariant.BodySmall}
                color={colorPalette.secondaryText}
              >
                By adding a member to Team Admins, you are allowing them to
                manage events, payments, members and alerts.
              </ShText>
            </View>

            <ShSpacer height={spacing.lg} />

            {/* Search Results */}
            {searchQuery.trim() && (
              <View style={{ paddingHorizontal: spacing.pageMargin }}>
                {isSearching ? (
                  <ActivityIndicator
                    size="small"
                    color={colorPalette.primaryGold}
                  />
                ) : searchResults.length === 0 ? (
                  <ShEmptyState message="No members found" />
                ) : (
                  searchResults.map(member => (
                    <View
                      key={member.user_id}
                      style={{ marginBottom: spacing.md }}
                    >
                      <ShMemberCard
                        avatar={member.user.profile_photo_uri}
                        name={`${member.user.first_name} ${member.user.last_name}`}
                        subtitle={
                          member.user.favorite_position ||
                          member.role ||
                          'Player'
                        }
                        showAddIcon={true}
                        onAdd={() => handlePromotePress(member)}
                        isProcessing={processingId === member.user_id}
                      />
                    </View>
                  ))
                )}
              </View>
            )}

            <ShSpacer height={spacing.xxl} />
          </ScrollView>

          {/* Confirmation Dialogs */}
          {confirmDialog.type === 'remove_first' && (
            <ShConfirmDialog
              visible={confirmDialog.visible}
              title="Confirm Remove Admin"
              message={`Confirm REMOVING Team Admin, ${confirmDialog.userName} from Team ${team?.team_name}`}
              confirmText="Confirm Remove"
              cancelText="Cancel"
              onConfirm={handleFirstRemoveConfirm}
              onCancel={handleCancelDialog}
              confirmButtonColor={colorPalette.error}
            />
          )}

          {confirmDialog.type === 'remove_second' && (
            <ShConfirmDialog
              visible={confirmDialog.visible}
              title="Are You Sure?"
              message={`Are you sure you want to REMOVE ${confirmDialog.userName} from team: ${team?.team_name}`}
              confirmText="Yes"
              cancelText="No"
              onConfirm={handleSecondRemoveConfirm}
              onCancel={handleCancelDialog}
              confirmButtonColor={colorPalette.error}
            />
          )}

          {confirmDialog.type === 'promote' && (
            <ShConfirmDialog
              visible={confirmDialog.visible}
              title="Confirm Team Admin"
              message={`Confirm TEAM ADMIN role for ${confirmDialog.userName} to team: ${team?.team_name}`}
              confirmText="Confirm Team Admin"
              cancelText="Cancel"
              onConfirm={handlePromoteConfirm}
              onCancel={handleCancelDialog}
              confirmButtonColor={colorPalette.primaryGold}
            />
          )}
        </ShScreenContainer>
      </SafeAreaView>
    </>
  );
}
