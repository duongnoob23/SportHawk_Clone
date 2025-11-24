import { ShIcon, ShSpacer, ShTabsBar, ShText } from '@cmp/index';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontWeights, ShTextVariant } from '@con/typography';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTabNavigation } from '@hks/useTabNavigation';
import { useUser } from '@hks/useUser';
import { logger } from '@lib/utils/logger';
import { IconName } from '@top/constants/icons';
import AdminMenu from '@top/features/teams/components/Admins/AdminMenu';
import BottomSheetCreateEvents from '@top/features/teams/components/Admins/BottomSheetCreateEvents';
import ModalCreateEvents from '@top/features/teams/components/Admins/ModalCreateEvents';
import TabEvent from '@top/features/teams/components/Events/TabEvent';
import Header from '@top/features/teams/components/Header/Header';
import TabMember from '@top/features/teams/components/Members/TabMember';
import TabPayment from '@top/features/teams/components/Payments/TabPayment';
import { useUserTeams } from '@top/features/teams/hooks/useUserTeams';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { UserTeam } from '../../features/teams/types/index';

const fakeAllTeam: UserTeam = {
  id: 'all',
  name: 'My Teams',
  sport: 'All Sports',
  team_photo_url: null,
  club_id: 'all',
  is_admin: false,
  admin_role: null,
  is_primary_admin: false,
  is_member: false,
  position: null,
  jersey_number: null,
  club: {
    id: 'all',
    name: 'All',
    club_badge_url: 'all',
  },
};

export default function TeamsScreen() {
  const { user } = useUser();
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<UserTeam>(fakeAllTeam);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const bottomSheetCreateEventsRef = useRef<BottomSheetModal>(null);

  const { activeTab, handleTabPress } = useTabNavigation({
    initialTab: 'events',
    onTabChange: tab => {
      logger.log('Tab changed to:', tab);
      if (tab === 'members' || tab === 'admins') setSelectedTeam(userTeams[0]);
    },
  });

  const teamsWithAll = useMemo(() => {
    return [fakeAllTeam, ...userTeams];
  }, [userTeams]);

  const { data: teamsData, isLoading } = useUserTeams();

  useEffect(() => {
    if (teamsData?.teams?.length) {
      setUserTeams(teamsData.teams);
    }
  }, [teamsData, selectedTeam]);

  const handlePaymentPress = (paymentId: string) => {
    router.push({
      pathname: '/payments/[id]',
      params: { id: paymentId },
    });
    logger.log('Navigating to payment detail:', paymentId);
  };

  const handlePayNow = (paymentId: string) => {
    router.push({
      pathname: '/payments/[id]',
      params: { id: paymentId },
    });
    logger.log('Navigate to payment detail:', paymentId);
  };

  const handleTeamSelect = (team: UserTeam) => {
    setSelectedTeam(team);
    setDropdownOpen(false);
  };

  const handleTabsAllToMemberOrAdmin = () => {
    if (teamsData) {
      setSelectedTeam(teamsData.teams[0]);
    }
  };

  const handleOpenAddIcon = () => {
    if (teamsData && teamsData.teams.length > 0) {
      if (!selectedTeam || selectedTeam.id === 'all') {
        setSelectedTeam(teamsData.teams[0]);
      }
      bottomSheetCreateEventsRef.current?.present();
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.safeArea,
          { paddingTop: insets.top, flex: 1, justifyContent: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={colorPalette.primaryGold} />
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <Header
          activeTab={activeTab}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          selectedTeam={selectedTeam}
          userTeams={teamsWithAll}
          handleTeamSelect={handleTeamSelect}
        />

        {teamsData?.teams && teamsData.teams.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={styles.emptyTabContent}>
              <ShIcon
                name={IconName.Team45x36}
                size={spacing.iconSizeXLarge}
                color={colorPalette.primaryGold}
              />
              <ShSpacer size={spacing.lg} />
              <ShText
                variant={ShTextVariant.Subheading}
                style={styles.centerText}
              >
                You don’t have any teams
              </ShText>
              <ShSpacer size={spacing.md} />
              <ShText variant={ShTextVariant.Body} style={styles.centerText}>
                Start exploring and discover a
              </ShText>
              <ShText variant={ShTextVariant.Body} style={styles.centerText}>
                team you would like to join
              </ShText>
            </View>
          </View>
        ) : (
          <>
            <ShTabsBar
              activeTab={activeTab}
              selectedTeam={selectedTeam ?? null}
              onTabPress={handleTabPress}
              handleTabsAllToMemberOrAdmin={handleTabsAllToMemberOrAdmin}
            />
            <ShSpacer size={spacing.md} />

            <View style={styles.tabContent}>
              {dropdownOpen && (
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.overlay}
                  onPress={() => setDropdownOpen(false)}
                />
              )}

              {activeTab === 'events' && (
                <TabEvent selectedTeam={selectedTeam} />
              )}

              {activeTab === 'payments' && (
                <>
                  <TabPayment
                    selectedTeam={selectedTeam}
                    handlePaymentPress={handlePaymentPress}
                    handlePayNow={handlePayNow}
                  />
                </>
              )}

              {activeTab === 'members' && (
                <TabMember selectedTeam={selectedTeam} />
              )}

              {/* {activeTab === 'admins' && selectedTeam?.is_admin && ( */}
              {activeTab === 'admins' && (
                <>
                  <AdminMenu
                    teamId={selectedTeam?.id!}
                    selectedTeam={selectedTeam!}
                  />
                </>
              )}

              {user?.app_metadata.is_super_admin && (
                <TouchableOpacity
                  style={styles.fabButton}
                  activeOpacity={0.8}
                  onPress={() => handleOpenAddIcon()}
                >
                  <ShText style={styles.fabButtonText}>+</ShText>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      <BottomSheetCreateEvents
        ref={bottomSheetCreateEventsRef}
        selectedTeam={selectedTeam || null}
      />
      <ModalCreateEvents
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedTeam={selectedTeam || null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  containerBottomSheet: {
    flex: 1,
    backgroundColor: 'grey',
  },
  contentContainerBottomSheet: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderInputField,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dropdownText: {
    color: colorPalette.white,
    flex: 1,
  },
  dropdownSubtext: {
    color: colorPalette.stoneGrey,
    marginRight: spacing.sm,
  },

  tabContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.emptyStateVerticalPadding,
  },

  fabButton: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xxl,
    width: spacing.fabButtonSize,
    height: spacing.fabButtonSize,
    borderRadius: spacing.fabButtonSize / 2,
    backgroundColor: colorPalette.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: spacing.fabButtonShadowElevation,
    shadowColor: colorPalette.black,
    shadowOffset: {
      width: 0,
      height: spacing.fabButtonShadowOffsetHeight,
    },
    shadowOpacity: spacing.fabButtonShadowOpacity,
    shadowRadius: spacing.fabButtonShadowRadius,
  },
  fabButtonText: {
    color: colorPalette.baseDark,
    fontSize: spacing.fabButtonTextSize,
    fontWeight: fontWeights.regular,
    lineHeight: spacing.fabButtonTextLineHeight,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colorPalette.black25, // vàng 50%
    zIndex: 5, // đảm bảo nằm trên cùng
  },
  emptyTabContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.emptyStateVerticalPadding,
  },
  centerText: {
    textAlign: 'center',
  },
});
