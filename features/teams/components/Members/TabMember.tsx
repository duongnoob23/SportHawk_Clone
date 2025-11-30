import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShEmptyState, ShUserList } from '@top/components';
import { ShText } from '@top/components/ShText';
import { defaults } from '@top/constants/defaults';
import { useClubDetails } from '@top/features/clubs/hooks/useClubs';
import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserTeam } from '../../types';

export type Props = {
  selectedTeam: UserTeam;
};

const TabMember = ({ selectedTeam }: Props) => {
  const insets = useSafeAreaInsets();

  const { data: clubDetailsData, isLoading: clubDetailsLoading } =
    useClubDetails(selectedTeam.club.id);

  // console.log('clubDetailsData', JSON.stringify(clubDetailsData, null, 2));
  const members = useMemo(() => {
    if (!clubDetailsData?.teams) return [];

    const team = clubDetailsData?.teams.find(
      item => item.id === selectedTeam?.id
    );
    if (!team) return [];

    return team.teamMembers.map((m: any) => ({
      id: m.id,
      role: m.role || 'member',
      joinedAt: m.joinedAt,
      user: {
        id: m.userId,
        name:
          `${m.profiles?.firstName || ''} ${m.profiles?.lastName || ''}`.trim() ||
          'Unknown',
        profilePhoto: m.profiles?.profilePhotoUri || '',
      },
    }));
  }, [clubDetailsData, selectedTeam?.id]);

  // console.log('MEMBET-JSON', JSON.stringify(members, null, 2));

  if (clubDetailsLoading) {
    return (
      <>
        <View
          style={{
            marginBottom: insets.bottom,
            flex: 1,
            paddingVertical: spacing.xxl,
          }}
        >
          <View style={[styles.eventsHeader]}>
            <ShText
              variant={ShTextVariant.Subheading}
              style={styles.eventsTitle}
            >
              Team Members
            </ShText>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: insets.top,
              backgroundColor: colorPalette.baseDark,
            }}
          >
            <ActivityIndicator size="large" color={colorPalette.primaryGold} />
          </View>
        </View>
      </>
    );
  }

  return (
    <ScrollView
      style={[styles.eventsContainer]}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: insets.bottom }}>
        <View style={[styles.eventsHeader]}>
          <ShText variant={ShTextVariant.Subheading} style={styles.eventsTitle}>
            Team Members
          </ShText>
        </View>

        {members.length > 0 ? (
          <View style={{ gap: spacing.sectionListGap }}>
            {members?.map((member: any, index: number) => (
              <ShUserList
                key={member.id || index}
                name={member.user?.name || defaults.defaultRole}
                role={defaults.defaultRole}
                photo={member.user?.profilePhoto}
                variant="default"
              />
            ))}
          </View>
        ) : (
          <ShEmptyState message={defaults.noMembers} />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  eventsContainer: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  actionBanner: {
    backgroundColor: `rgba(234, 189, 34, 0.1)`,
    borderWidth: spacing.borderWidthThin,
    borderColor: `rgba(234, 189, 34, 0.2)`,
    borderRadius: spacing.eventActionBannerBorderRadius,
    padding: spacing.eventActionBannerPadding,
    marginBottom: spacing.xxl,
    gap: spacing.eventActionBannerGap,
  },
  actionBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBannerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBannerText: {
    color: colorPalette.primaryGold,
  },
  actionBannerCount: {
    color: colorPalette.primaryGold,
  },
  actionBannerSubtext: {
    color: `rgba(234, 189, 34, 0.8)`,
    marginTop: spacing.xs,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  eventsTitle: {
    color: colorPalette.textLight,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterText: {
    color: colorPalette.stoneGrey,
  },
  filterDropdown: {
    position: 'absolute',
    top: spacing.xxxl,
    right: 0,
    backgroundColor: colorPalette.baseDark,
    borderRadius: spacing.borderRadiusMedium,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    zIndex: spacing.zIndexDropdown,
    minWidth: 150,
  },
  filterDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderSubtle,
  },
  filterDropdownItemText: {
    color: colorPalette.textLight,
  },
  filterDropdownItemTextActive: {
    color: colorPalette.primaryGold,
  },
  loadingContainer: {
    paddingVertical: spacing.emptyStateVerticalPadding,
    alignItems: 'center',
  },
  loadingText: {
    color: colorPalette.stoneGrey,
  },
});

export default TabMember;
