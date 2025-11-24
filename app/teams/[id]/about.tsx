import { colorPalette } from '@con/colors';
import { defaults } from '@con/defaults';
import { IconName } from '@con/icons';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { useUser } from '@hks/useUser';
import { logger } from '@lib/utils/logger';
import {
  ShConfirmDialog,
  ShHeroImageSection,
  ShMapView,
  ShPlayingTimes,
  ShScreenContainer,
  ShScreenHeader,
  ShStatsCard,
  ShTabsWithAction,
  ShTeamBadge,
  ShTeamStatsInfo,
  ShText,
} from '@top/components';
import { useClubDetails } from '@top/features/clubs/hooks/useClubs';
import { useMemberInteresttNotification } from '@top/features/event/hooks/useNotification';
import {
  useInsertExpressInterestInTeam,
  useInterestStatusPending,
} from '@top/features/teams/hooks/useInterestExpressions';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TeamMembersScreen from './members';

export type Props = {
  teamId: string;
  clubId: string;
};

export default function TeamAboutScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    clubId: string;
  }>();
  const id = params.id;
  const [expressingInterest, setExpressingInterest] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const { user } = useUser();
  const userId = user?.id;
  const {
    mutateAsync: sendMemberInterestNoti,
    isPending: pendingMemberInterestNoti,
  } = useMemberInteresttNotification();

  const { mutateAsync: addExpressInterestInIteam, isPending } =
    useInsertExpressInterestInTeam();

  const { data: clubDetailsData, isLoading: clubDetailsLoading } =
    useClubDetails(params.clubId);

  const {
    data: interestStatusPendingData,
    isLoading: InterestStatusPendingLoading,
  } = useInterestStatusPending(id, userId);

  const team = useMemo(() => {
    if (clubDetailsData) {
      const team = clubDetailsData?.teams.find(item => item.id == id);
      const adminIds = clubDetailsData.clubAdmins.map(item => item.assignedBy);

      let isTeamMember = team?.teamMembers.some(item => item.userId == userId);

      if (userId == adminIds[0]) isTeamMember = true;
      const data = {
        id: id,
        club: {
          id: clubDetailsData?.id,
          name: clubDetailsData?.name,
          logo: clubDetailsData?.clubBadgeUrl,
          createdBy: clubDetailsData?.createdBy,
        },
        name: team?.name,
        team_type: team?.teamType,
        sport: team?.sport,
        leagueName: team?.leagueName,
        teamSort: team?.teamSort,
        teamLevel: team?.teamLevel,
        ageGroup: team?.ageGroup,
        homeGround: team?.homeGround,
        homeGroundAddress: team?.homeGroundAddress,
        homeGroundLatitude: team?.homeGroundLatitude,
        homeGroundLongitude: team?.homeGroundLongitude,
        foundedYear: team?.foundedYear,
        motto: team?.motto,
        teamPhotoUrl: team?.teamPhotoUrl,
        trainingDay1: team?.trainingDay1,
        trainingTime1: team?.trainingTime1,
        trainingDay2: team?.trainingDay2,
        trainingTime2: team?.trainingTime2,
        matchDay: team?.matchDay,
        matchTime: team?.matchTime,
        memberCount: team?.teamMembers.length,
        members: team?.teamMembers,
        isTeamMember: isTeamMember,
      };
      return data;
    }
  }, [clubDetailsData]);

  const hasExpressedInterest = useMemo(() => {
    if (interestStatusPendingData) {
      return interestStatusPendingData.hasPending;
    }
  }, [interestStatusPendingData]);

  const handleJoinButtonPress = () => {
    if (!user) {
      router.push(Routes.SignIn);
      return;
    }
    if (hasExpressedInterest) {
      logger.debug('MEM-005: Duplicate interest blocked', { teamId: id });
      return;
    }
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < 30000) {
      // 30 seconds = 30000ms
      const remainingTime = Math.ceil((30000 - timeSinceLastRequest) / 1000);
      Alert.alert(
        'Please Wait',
        `You can send another request in ${remainingTime} seconds`
      );
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmJoin = async () => {
    setExpressingInterest(true);
    setShowConfirmDialog(false);
    setLastRequestTime(Date.now());

    try {
      await addExpressInterestInIteam({
        teamId: id,
      });
      Alert.alert('Success', 'Your request has been sent to the team admin');
      const newMemberName = `${user?.user_metadata.first_name} ${user?.user_metadata.last_name}`;

      if (team && newMemberName) {
        await sendMemberInterestNoti({
          clubName: team.club.name,
          teamName: team.name!,
          userId: team.club.createdBy!,
          newMemberName: newMemberName,
        });
      }
    } catch (error: any) {
      console.error('MEM-005: Failed to express interest', error);
      if (error?.message?.includes('one join request per day')) {
        Alert.alert(
          'Rate Limit',
          'You can only send one join request per day. Please try again tomorrow.'
        );
      } else {
        Alert.alert('Error', 'Failed to send join request');
      }
    } finally {
      setExpressingInterest(false);
    }
  };

  const handleCancelJoin = () => {
    setShowConfirmDialog(false);
  };

  const handleBack = () => {
    router.back();
  };

  const formatSchedule = (team: any) => {
    const times = [];
    const formatTime = (time: string) => {
      if (!time) return '';
      const parts = time.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
      return time;
    };

    // Add training session 1 if available
    if (team?.trainingDay1 && team?.trainingTime1) {
      times.push({
        eventType: 'Training',
        schedule: `${team.trainingDay1} • ${formatTime(team.trainingTime1)}`,
        location: team.homeGround || 'Home Ground',
      });
    }

    // Add training session 2 if available
    if (team?.trainingDay2 && team?.trainingTime2) {
      times.push({
        eventType: 'Training',
        schedule: `${team.trainingDay2} • ${formatTime(team.trainingTime2)}`,
        location: team.homeGround || 'Home Ground',
      });
    }

    // Add match day if available
    if (team?.matchDay && team?.matchTime) {
      times.push({
        eventType: 'Match',
        schedule: `${team.matchDay} • ${formatTime(team.matchTime)}`,
        location: team.homeGround || 'Home Ground',
      });
    }

    return times;
  };

  if (clubDetailsLoading || InterestStatusPendingLoading) {
    return (
      <ShScreenContainer>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
        </View>
      </ShScreenContainer>
    );
  }

  if (!team) {
    return (
      <ShScreenContainer>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.xxl,
          }}
        >
          <ShText variant={ShTextVariant.EmptyState}>
            {defaults.teamNotFound}
          </ShText>
        </View>
      </ShScreenContainer>
    );
  }

  const profileTabs = [
    { id: 'about', label: 'About' },
    { id: 'members', label: 'Members' },
  ];
  return (
    // <View style={{ flex: 1, marginBottom: insets.bottom }}>
    <ShScreenContainer style={{ flex: 1, marginBottom: insets.bottom }}>
      <ShScreenHeader
        title="Team Details"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft,
          onPress: handleBack,
        }}
      />

      {/* Hero Image */}
      <ShHeroImageSection imageUrl={team?.teamPhotoUrl!} />

      <View
        style={{
          marginTop: -spacing.xxl,
          paddingHorizontal: spacing.xxl,
          paddingTop: spacing.none,
          gap: spacing.xxl,
        }}
      >
        <ShTabsWithAction
          tabs={profileTabs}
          activeTab={activeTab}
          onTabPress={(tab: string) => {
            setActiveTab(tab);
          }}
          isTeamMember={team.isTeamMember}
          actionButtonText={
            hasExpressedInterest ? 'Request Sending' : 'Join us'
          }
          actionButtonDisabled={hasExpressedInterest}
          actionButtonLoading={expressingInterest}
          onActionPress={handleJoinButtonPress}
        />
      </View>

      <ScrollView
        style={{
          flex: 1,
          marginBottom: insets.bottom,
          paddingTop: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: spacing.xxl,
            paddingTop: spacing.none,
            gap: spacing.xxl,
          }}
        >
          {/* Tab Navigation with Join Button */}

          {activeTab === 'about' ? (
            <>
              {/* Team Badge */}
              <ShTeamBadge
                logoUrl={team?.club?.logo!}
                teamName={team?.name!}
                category={team?.teamSort ? `${team.teamSort}'s` : ''}
              />

              {/* Stats Cards */}
              <View style={{ flexDirection: 'row', gap: spacing.statsRowGap }}>
                {team?.foundedYear && (
                  <ShStatsCard label="Founded" value={team.foundedYear} />
                )}
                <ShStatsCard
                  label="Members"
                  value={team?.memberCount || defaults.memberCountPlaceholder}
                />
                <ShStatsCard
                  label="Sport"
                  value={team?.sport || defaults.defaultSport}
                />
              </View>

              {/* Team Info Card */}
              <ShTeamStatsInfo
                league={team?.leagueName!}
                gameplayLevel={team?.teamLevel!}
                homeGround={team?.homeGround!}
                groundAddress={team?.homeGroundAddress!}
              />

              {/* Map and Playing Times Section */}
              <View style={{ gap: spacing.xxl }}>
                {/* Map */}
                {team?.homeGroundLatitude && team?.homeGroundLongitude && (
                  <View
                    style={{
                      height: spacing.mapHeight,
                      borderRadius: spacing.borderRadiusLarge,
                      overflow: 'hidden',
                    }}
                  >
                    <ShMapView
                      region={{
                        latitude: team.homeGroundLatitude,
                        longitude: team.homeGroundLongitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      }}
                      clubs={[
                        {
                          id: 'home-ground',
                          name: team.homeGround!,
                          latitude: team.homeGroundLatitude,
                          longitude: team.homeGroundLongitude,
                          sport: team.sport || 'Football',
                        },
                      ]}
                    />
                  </View>
                )}

                {/* Playing Times */}
                <ShPlayingTimes times={formatSchedule(team)} />
              </View>
            </>
          ) : (
            /* Members Tab Content */
            // ClubDetailsResponse
            <TeamMembersScreen clubDetailsData={clubDetailsData} />
          )}
        </View>
      </ScrollView>

      {/* Confirmation Dialog */}
      <ShConfirmDialog
        visible={showConfirmDialog}
        title="Join Team Request"
        message="Tapping Continue will send your details and join request to the Team Admin for consideration."
        cancelText="Cancel"
        confirmText="Continue"
        onCancel={handleCancelJoin}
        onConfirm={handleConfirmJoin}
        isLoading={expressingInterest}
      />
    </ShScreenContainer>
    // </View>
  );
}
