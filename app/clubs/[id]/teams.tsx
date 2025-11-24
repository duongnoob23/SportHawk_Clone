import { Routes } from '@con/routes';
import {
  ShIcon,
  ShProfileTabs,
  ShScreenContainer,
  ShScreenHeader,
  ShTeamListItem,
  ShText,
} from '@top/components';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { opacity } from '@con/opacity';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { useClubDetails } from '@top/features/clubs/hooks/useClubs';
import { ClubDetailsTeam, Team } from '@top/features/clubs/types';
import useEventFormStore from '@top/stores/eventFormStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ClubTeamsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('teams');
  const { formData } = useEventFormStore();

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

  const handleTeamPress = (teamId: string) => {
    router.push(Routes.TeamAbout(teamId));
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
        </View>
      </ShScreenContainer>
    );
  }

  return (
    <View style={{ marginBottom: insets.bottom }}>
      <ShScreenContainer>
        <ShScreenHeader
          title="Club Details"
          showBorder={false}
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
            onPress: handleBack,
          }}
          rightAction={{
            type: 'icon',
            iconName: IconName.HeartFillSmall,
          }}
        />

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: club?.backgroundImageUrl ?? undefined }}
            style={styles.heroImage}
          />
          <View style={styles.heroGradient} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Club Header - Separate from hero */}
            <View style={styles.clubHeader}>
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: club?.clubBadgeUrl ?? undefined }}
                  style={styles.clubLogo}
                />
              </View>
              <View style={styles.clubInfo}>
                <ShText variant={ShTextVariant.ClubName}>{club?.name}</ShText>
                <View style={styles.locationRow}>
                  <ShIcon
                    name={IconName.Markervariant3}
                    size={spacing.md}
                    color={colorPalette.stoneGrey}
                  />
                  <ShText variant={ShTextVariant.LocationText}>
                    {club?.locationCity}, {club?.locationState}
                  </ShText>
                </View>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <ShProfileTabs
                tabs={profileTabs}
                activeTab={activeTab}
                onTabPress={(tab: React.SetStateAction<string>) => {
                  if (tab === 'club') {
                    router.replace(Routes.ClubAbout(id));
                  } else {
                    setActiveTab(tab);
                  }
                }}
              />
            </View>

            {/* Teams Section Title */}
            <ShText variant={ShTextVariant.SectionTitle}>Teams</ShText>
            <View style={[styles.teamsList, { gap: spacing.sectionListGap }]}>
              {teams.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <ShText variant={ShTextVariant.EmptyState}>
                    No teams found
                  </ShText>
                </View>
              ) : (
                teams.map(team => (
                  <View key={team.id}>
                    <ShTeamListItem
                      teamName={team.name}
                      ageGroup={team.age_group || 'Open'}
                      gameplayLevel={team.sport}
                      onPress={() => handleTeamPress(team.id)}
                    />
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </ShScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: spacing.xxl,
    paddingTop: spacing.none,
    gap: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartButton: {
    width: spacing.heartButtonSize,
    height: spacing.heartButtonSize,
    borderRadius: spacing.borderRadiusLarge,
    backgroundColor: colorPalette.backgroundListItem,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.heartButtonMarginRight,
  },
  heroContainer: {
    height: spacing.heroImageHeight,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    zIndex: -5,
  },
  heroGradient: {
    position: 'absolute',
    bottom: spacing.none,
    left: spacing.none,
    right: spacing.none,
    height: '100%',
    backgroundColor: colorPalette.baseDark,
    opacity: opacity.heroOverlay,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.clubHeaderGap,
  },
  logoContainer: {
    width: spacing.clubLogoContainerSize,
    height: spacing.clubLogoContainerSize,
    borderRadius: spacing.borderRadiusXl,
    backgroundColor: colorPalette.black,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    padding: spacing.clubLogoPadding,
  },
  clubLogo: {
    width: spacing.clubLogoSize,
    height: spacing.clubLogoSize,
    borderRadius: spacing.borderRadiusXl,
  },
  clubInfo: {
    flex: 1,
    gap: spacing.clubInfoGap,
    paddingTop: spacing.clubInfoPaddingTop,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.locationRowGap,
  },
  tabsContainer: {
    height: spacing.tabHeight,
  },
  teamsList: {
    gap: spacing.sectionListGap,
    backgroundColor: 'green',
  },
  emptyContainer: {
    paddingVertical: spacing.emptyStatePaddingVertical,
    alignItems: 'center',
  },
});
