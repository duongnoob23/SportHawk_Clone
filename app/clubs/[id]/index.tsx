import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';

import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { logger } from '@lib/utils/logger';
import {
  ShAboutSection,
  ShAdminsSection,
  ShButton,
  ShClubHeader,
  ShHeroImage,
  ShProfileTabs,
  ShScreenContainer,
  ShScreenHeader,
  ShSpacer,
  ShTeamListItem,
  ShTeamPreviewSection,
  ShText,
} from '@top/components';
import { IconName } from '@top/constants/icons';
import { useClubDetails } from '@top/features/clubs/hooks/useClubs';
import { Admin, ClubDetailsTeam, Team } from '@top/features/clubs/types';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ShButtonVariant } from '@top/constants/buttons';
import { fontWeights, ShTextVariant } from '@top/constants/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ClubDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('club');
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: clubDetailsData, isLoading: clubDetailsLoading } =
    useClubDetails(id);

  const teams: Team[] = useMemo(() => {
    const rawTeams = clubDetailsData?.teams ?? [];
    return rawTeams.map((team: ClubDetailsTeam) => ({
      id: team.id,
      name: team.name,
      sport: team.sport || 'Unknown',
      age_group: team.ageGroup || '',
      team_sort: team.teamSort || '',
    }));
  }, [clubDetailsData]);

  const club = useMemo(() => {
    if (clubDetailsData) {
      return clubDetailsData;
    }
  }, [clubDetailsData]);

  const admins: Admin[] = useMemo(() => {
    const rawAdmins = clubDetailsData?.clubAdmins ?? [];
    return rawAdmins.map((admin: any) => ({
      id: admin.id,
      name:
        `${admin.profiles?.firstName ?? ''} ${admin.profiles?.lastName ?? ''}`.trim() ||
        'Unknown',
      avatarUrl: admin.profiles?.profilePhotoUri,
      role: admin.title || admin.role || 'Member',
    }));
  }, [clubDetailsData]);

  const handleTeamPress = (teamId: string) => {
    router.push({
      pathname: `/teams/${teamId}/about?clubId=${club?.id}`,
    });
  };

  const handleViewAllTeams = () => {
    logger.debug('MEM-002: Tab switched', { from: activeTab, to: 'teams' });
    setActiveTab('teams');
  };

  const handleTabPress = (tab: string) => {
    logger.debug('MEM-002: Tab switched', { from: activeTab, to: tab });
    setActiveTab(tab);
  };

  const handleHeartPress = () => {
    Alert.alert('Coming Soon', 'Feature coming soon!');
  };

  const handleBack = () => {
    router.back();
  };

  const profileTabs = [
    { id: 'club', label: 'Club' },
    { id: 'teams', label: 'Teams' },
  ];

  if (clubDetailsLoading) {
    return (
      <ShScreenContainer>
        <ShScreenHeader
          title="Club Details"
          showBorder={false}
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft,
            onPress: handleBack,
          }}
          autoLeft={true}
        />

        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
        </View>
      </ShScreenContainer>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        marginBottom: insets.bottom,
      }}
    >
      <ShScreenContainer scrollable={false}>
        <ShScreenHeader
          title="Club Details"
          showBorder={false}
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft,
            onPress: handleBack,
          }}
          // autoLeft={true}
        />

        <ShHeroImage imageUrl={club?.backgroundImageUrl ?? undefined} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginTop: -spacing.md }}
        >
          <View
            style={{
              padding: spacing.xxl,
              paddingTop: spacing.none,
            }}
          >
            <ShClubHeader
              clubBadgeUrl={club?.clubBadgeUrl ?? undefined}
              clubName={club?.name || ''}
              locationCity={club?.locationCity || ''}
              locationState={club?.locationState || ''}
            />
            <ShSpacer size={spacing.xxl} />

            <View style={{ height: spacing.tabHeight }}>
              <ShProfileTabs
                tabs={profileTabs}
                activeTab={activeTab}
                onTabPress={handleTabPress}
              />
            </View>
            <ShSpacer size={spacing.xxl} />

            {activeTab === 'club' ? (
              <>
                <ShTeamPreviewSection
                  teams={teams}
                  maxDisplay={3}
                  onViewAll={handleViewAllTeams}
                  onTeamPress={handleTeamPress}
                />
                <ShSpacer size={spacing.xxl} />

                <ShButton
                  title={'View All Teams'}
                  variant={ShButtonVariant.Primary}
                  onPress={() => setActiveTab('teams')}
                />

                <ShSpacer size={spacing.xxl} />

                <ShAboutSection
                  description={club?.aboutDescription ?? undefined}
                />
                <ShSpacer size={spacing.xxl} />

                <ShAdminsSection admins={admins} />

                <ShSpacer size={spacing.md} />

                <View style={{ paddingHorizontal: spacing.sm }}>
                  <ShText
                    variant={ShTextVariant.SmallText}
                    style={{
                      fontSize: spacing.md,
                      fontWeight: fontWeights.regular,
                    }}
                  >
                    We verify identities so you can connect with confidence.
                    <ShText
                      variant={ShTextVariant.SmallText}
                      style={{
                        color: colorPalette.primaryGold,
                        fontSize: spacing.md,
                        fontWeight: fontWeights.regular,
                      }}
                    >
                      Learn more.
                    </ShText>
                  </ShText>
                </View>
              </>
            ) : (
              <View style={{ gap: spacing.sectionListGap }}>
                {teams.length === 0 ? (
                  <View
                    style={{
                      paddingVertical: spacing.emptyStatePaddingVertical,
                      alignItems: 'center',
                    }}
                  >
                    <ShText>No teams found</ShText>
                  </View>
                ) : (
                  <View>
                    <ShText variant={ShTextVariant.Subheading}>Teams</ShText>
                    <ShSpacer size={spacing.xxl} />
                    {teams.map(team => (
                      <View key={team.id}>
                        <ShTeamListItem
                          teamName={team.name}
                          ageGroup={team.age_group || 'Open'}
                          gameplayLevel={team.sport}
                          onPress={() => handleTeamPress(team.id)}
                        />
                        <ShSpacer size={spacing.md} />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </ShScreenContainer>
    </View>
  );
}
