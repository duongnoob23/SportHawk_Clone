import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  ShConfirmDialog,
  ShEmptyState,
  ShIcon,
  ShMemberCard,
  ShScreenContainer,
  ShScreenHeader,
  ShSearchMembers,
  ShSpacer,
  ShText,
} from '@top/components';

import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { useMemberApprovedtNotification } from '@top/features/event/hooks/useNotification';
import {
  useAcceptInterestExpression,
  useIgnoreInterestExpression,
  useInterestExpressionsPending,
} from '@top/features/teams/hooks/useInterestExpressions';
import { useTeams } from '@top/features/teams/hooks/useTeam';
import {
  useAddTeamMembers,
  useSearchNonMembers,
} from '@top/features/teams/hooks/useTeamMembers';
import { SearchResult } from '@top/features/teams/types';
import { useUser } from '@top/hooks/useUser';

export default function AddMembersScreen() {
  const params = useLocalSearchParams<{
    teamId?: string;
    teamName?: string;
    clubName?: string;
    clubId?: string;
  }>();

  const teamId = useMemo(() => {
    return params!.teamId;
  }, [params]);

  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    type: 'accept' | 'ignore' | null;
    userId: string | null;
    userName: string | null;
  }>({
    visible: false,
    type: null,
    userId: null,
    userName: null,
  });

  const {
    mutateAsync: sendMemberApprovedNoti,
    isPending: pendingMemberApprovedNoti,
  } = useMemberApprovedtNotification();

  const { data: teamData, isLoading: teamLoading } = useTeams(teamId);

  const {
    data: interestExpressionPendingData,
    isLoading: interestExpressionPendingLoading,
  } = useInterestExpressionsPending(teamId);
  const { data: searchNonMemberData } = useSearchNonMembers(
    teamId,
    searchQuery
  );
  const { mutateAsync: AcceptInterestExcpressions } =
    useAcceptInterestExpression();

  const { mutateAsync: IgnoreInterestExpressions } =
    useIgnoreInterestExpression();
  const { mutateAsync: AddTeamMembers } = useAddTeamMembers();

  const filterSearchNonMemberData = useMemo(() => {
    if (!searchNonMemberData || !interestExpressionPendingData) return [];

    const pendingIds = new Set(
      interestExpressionPendingData.map(item => item.user_id)
    );

    const lowerQuery = searchQuery.trim().toLowerCase();

    return searchNonMemberData.filter(item => {
      if (pendingIds.has(item.id)) return false;
      if (!lowerQuery) return true;
      const fullName =
        `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();

      return (
        fullName.includes(lowerQuery) ||
        (item.email && item.email.toLowerCase().includes(lowerQuery))
      );
    });
  }, [searchNonMemberData, interestExpressionPendingData, searchQuery]);

  const team = useMemo(() => {
    if (teamData) return teamData;
  }, [teamData]);

  const interestedPlayers = useMemo(() => {
    if (interestExpressionPendingData) return interestExpressionPendingData;
  }, [interestExpressionPendingData]);

  const visibleInterestedPlayers = useMemo(() => {
    if (interestExpressionPendingData) {
      return interestExpressionPendingData;
    }
  }, [interestExpressionPendingData]);

  const handleAcceptPress = (userId: string, userName: string) => {
    setConfirmDialog({
      visible: true,
      type: 'accept',
      userId,
      userName,
    });
  };

  // Open modal Ignore
  const handleIgnorePress = (userId: string, userName: string) => {
    setConfirmDialog({
      visible: true,
      type: 'ignore',
      userId,
      userName,
    });
  };

  // Close modal cancel
  const handleCancelDialog = () => {
    setConfirmDialog({
      visible: false,
      type: null,
      userId: null,
      userName: null,
    });
  };

  const handleConfirmAccept = async () => {
    if (
      !confirmDialog.userId ||
      !params.teamId ||
      !params.teamName ||
      !params.clubName
    )
      return;
    setProcessingId(confirmDialog.userId);
    setConfirmDialog({ ...confirmDialog, visible: false });

    try {
      const teamId = params.teamId;
      const userId = confirmDialog.userId;
      const teamName = params.teamName;
      const clubId = params?.clubId;

      await AcceptInterestExcpressions({
        teamId,
        userId,
        teamName,
        clubId,
      });

      if (params.teamName && params.clubName && userId) {
        sendMemberApprovedNoti({
          userId: userId,
          teamName: params.teamName,
          clubName: params.clubName,
        });
      }
      Alert.alert(
        'Success',
        `${confirmDialog.userName} added to team`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.log('Error in handleConfirmAccept', error);
      Alert.alert('Error', 'Failed to accept request');
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

  const handleConfirmIgnore = async () => {
    if (!confirmDialog.userId || !team) return;
    setProcessingId(confirmDialog.userId);
    setConfirmDialog({ ...confirmDialog, visible: false });

    try {
      const teamId = params.teamId;
      const userId = confirmDialog.userId;
      const teamName = params.teamName;
      if (!teamId || !userId || !teamName) return;
      await IgnoreInterestExpressions({
        teamId,
        userId,
        teamName,
      });

      Alert.alert('Info', 'Request declined');
    } catch (error) {
      console.error('Error in confirm Ignore', error);
      Alert.alert('Error', 'Failed to decline request');
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

  const handleAddPlayer = async (player: SearchResult) => {
    if (!team) return;
    setProcessingId(player.id);
    try {
      const userIds = player.id;
      if (teamId) {
        await AddTeamMembers({
          teamId,
          userIds,
        });
      }
      setSearchResults(prev => prev.filter(result => result.id !== player.id));
      Alert.alert(
        'Success',
        `${player.first_name} ${player.last_name} added to team`
      );
    } catch (error) {
      const errorCode =
        typeof error === 'object' && error && 'code' in error
          ? (error as { code?: string }).code
          : undefined;

      if (errorCode === '23505') {
        Alert.alert('Info', 'Player is already a team member');
      } else {
        Alert.alert('Error', 'Failed to add player to team');
      }
    } finally {
      setProcessingId(null);
    }
  };

  if (teamLoading || interestExpressionPendingLoading) {
    return (
      <>
        <ShScreenHeader
          title="Add Members"
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft,
            onPress: () => router.back(),
          }}
          showBorder
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
      <ShScreenHeader
        title="Add Members"
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft,
          onPress: () => router.back(),
        }}
        showBorder
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ShScreenContainer
          style={{
            paddingHorizontal: spacing.containerMargin,
            marginBottom: insets.bottom,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Interested Players Section */}
            <View style={{ paddingHorizontal: 0 }}>
              <ShSpacer size={spacing.xxl}></ShSpacer>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <View>
                  <ShText variant={ShTextVariant.Subheading}>
                    Interested Players
                  </ShText>
                </View>
                <View>
                  {visibleInterestedPlayers &&
                    visibleInterestedPlayers.length > 0 && (
                      <ShIcon
                        name={IconName.AlertCircleOutline}
                        size={16}
                        color={colorPalette.primaryGold}
                      />
                    )}
                </View>
              </View>
              <ShSpacer size={spacing.xxl}></ShSpacer>
            </View>
            {visibleInterestedPlayers &&
            visibleInterestedPlayers.length === 0 ? (
              <View style={{ paddingHorizontal: spacing.containerMargin }}>
                <ShEmptyState message="No pending requests" />
              </View>
            ) : (
              <View>
                {visibleInterestedPlayers &&
                  visibleInterestedPlayers.map(expression => (
                    <View key={expression.id} style={{ marginBottom: 0 }}>
                      <ShMemberCard
                        avatar={expression?.profiles?.profile_photo_uri || ''}
                        name={`${expression?.profiles?.first_name || ''} ${expression?.profiles?.last_name || ''} `}
                        subtitle={'Player'}
                        showAcceptIgnoreButtons={true}
                        onAccept={() =>
                          handleAcceptPress(
                            expression.user_id,
                            `${expression?.profiles?.first_name || ''} ${expression?.profiles?.last_name || ''}`
                          )
                        }
                        onIgnore={() =>
                          handleIgnorePress(
                            expression.user_id,
                            `${expression?.profiles?.first_name || ''} ${expression?.profiles?.last_name || ''}`
                          )
                        }
                        isProcessing={processingId === expression.user_id}
                      />
                      <ShSpacer size={spacing.md} />
                    </View>
                  ))}
              </View>
            )}

            <ShSpacer size={spacing.md} />

            {/* Search Players Section */}
            <View>
              <ShText variant={ShTextVariant.SectionTitle}>
                Search Players
              </ShText>
            </View>

            <ShSpacer size={spacing.xxl} />

            <View>
              <ShSearchMembers
                placeholder="Search..."
                value={searchQuery}
                onChangeText={text => setSearchQuery(text)}
              />

              <ShSpacer size={spacing.md} />

              <ShText variant={ShTextVariant.SmallText}>
                By adding a player by search, you are sending them an invitation
                to join the team, you will be notified if they accept.
              </ShText>
            </View>

            <ShSpacer size={spacing.xxl} />

            <View>
              {filterSearchNonMemberData &&
                filterSearchNonMemberData?.map(player => {
                  // searchResults.map(player => {
                  const displayName =
                    `${player.first_name} ${player.last_name}`.trim() ||
                    player.email ||
                    'Player';
                  return (
                    <View key={player.id} style={{ marginBottom: spacing.md }}>
                      <ShMemberCard
                        avatar={player.profile_photo_uri || ''}
                        name={displayName}
                        subtitle={player.favorite_position || ''}
                        showAddIcon={true}
                        onAdd={() => handleAddPlayer(player)}
                        isProcessing={processingId === player.id}
                      />
                    </View>
                  );
                })}
            </View>
            <ShSpacer size={spacing.xxl} />
          </ScrollView>

          {/* Confirmation Dialogs */}
          {confirmDialog.type === 'accept' && (
            <ShConfirmDialog
              visible={confirmDialog.visible}
              title="Confirm Accept"
              message={`Confirm ACCEPTING ${confirmDialog.userName} to team: ${team?.name}`}
              confirmText="Confirm Accept"
              cancelText="Cancel"
              onConfirm={handleConfirmAccept}
              onCancel={handleCancelDialog}
            />
          )}

          {confirmDialog.type === 'ignore' && (
            <ShConfirmDialog
              visible={confirmDialog.visible}
              title="Confirm Ignore"
              message={`Confirm that you wish to IGNORE the JOIN request from ${confirmDialog.userName} to team: ${team?.name}`}
              confirmText="Confirm Ignore"
              cancelText="Cancel"
              onConfirm={handleConfirmIgnore}
              onCancel={handleCancelDialog}
            />
          )}
        </ShScreenContainer>
      </KeyboardAvoidingView>
    </>
  );
}
