import { ShIcon, ShSpacer, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { useLayout } from '@top/hooks/useLayout';
import React, { useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TabType, UserTeam } from '../../types';

type HeaderProps = {
  activeTab: TabType;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  selectedTeam: UserTeam;
  userTeams: UserTeam[];
  handleTeamSelect: (team: UserTeam) => void;
};

const Header = ({
  activeTab,
  dropdownOpen,
  setDropdownOpen,
  selectedTeam,
  userTeams,
  handleTeamSelect,
}: HeaderProps) => {
  const { onLayout, height } = useLayout();
  const check = useMemo(() => {
    const chooseAl = selectedTeam?.id === 'all' || selectedTeam?.id == null;
    return chooseAl;
  }, [selectedTeam]);

  const userTeamsFilter = useMemo(() => {
    const check = activeTab == 'members' || activeTab == 'admins';
    if (check) {
      return userTeams.filter(item => item.id !== 'all');
    } else {
      return userTeams;
    }
  }, [userTeams, activeTab]);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setDropdownOpen(!dropdownOpen)}
        onLayout={onLayout}
      >
        <View style={styles.dropdownLeft}>
          <View style={styles.dropdownLeftIcon}>
            {selectedTeam.club.club_badge_url !== 'all' ? (
              <Image
                source={{ uri: selectedTeam?.club?.club_badge_url! }}
                style={styles.teamPhoto}
                resizeMode="contain"
              />
            ) : (
              <ShIcon
                name={IconName.TeamDefault}
                size={spacing.xl}
                color={colorPalette.stoneGrey}
              />
            )}
          </View>

          <View style={styles.dropdownLeftContent}>
            <ShText variant={ShTextVariant.Total} style={styles.dropdownText}>
              {selectedTeam.club.name}
            </ShText>
            <ShText
              variant={ShTextVariant.LabelLight}
              style={styles.dropdownSubtext}
            >
              {selectedTeam.name}
            </ShText>
          </View>
        </View>
        <View style={styles.dropdownRight}>
          <View style={styles.dropdownRight}>
            <View
              style={{
                transform: [{ rotate: dropdownOpen ? '180deg' : '0deg' }],
              }}
            >
              <ShIcon
                name={IconName.ChevronDown}
                size={spacing.iconSizeSmall}
                color={colorPalette.stoneGrey}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Dropdown menu */}
      {dropdownOpen && userTeams.length !== 0 && (
        <>
          <View style={[styles.dropdownMenu, { top: height }]}>
            <ShSpacer size={spacing.xxl} />

            {userTeamsFilter
              .filter(team => !(check && team.id === 'all'))
              .map(team => {
                const isDisabled =
                  (activeTab === 'members' || activeTab === 'admins') &&
                  team.id === 'all';

                return (
                  <View key={team.id}>
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        // isDisabled && { opacity: 0.4 },
                      ]}
                      disabled={isDisabled}
                      onPress={() => {
                        if (!isDisabled) handleTeamSelect(team);
                      }}
                    >
                      <View style={styles.dropdownItemLeft}>
                        <View style={styles.dropdownLeftIcon}>
                          {team.id === 'all' ? (
                            <ShIcon
                              name={IconName.TeamDefault}
                              size={spacing.xl}
                              color={colorPalette.stoneGrey}
                            />
                          ) : team.club?.club_badge_url ? (
                            <Image
                              source={{ uri: team.club.club_badge_url }}
                              style={styles.teamPhoto}
                              resizeMode="contain"
                            />
                          ) : (
                            <ShIcon
                              name={IconName.TeamDefault}
                              size={spacing.xl}
                              color={colorPalette.stoneGrey}
                            />
                          )}
                        </View>

                        <View style={styles.dropdownItemText}>
                          <ShText
                            variant={ShTextVariant.Total}
                            style={styles.teamName}
                          >
                            {team.club?.name}
                          </ShText>
                          <ShText
                            variant={ShTextVariant.LabelLight}
                            style={styles.teamRole}
                          >
                            {team.name}
                          </ShText>
                        </View>

                        <View style={styles.dropdownItemRight}>
                          {selectedTeam?.id === team.id && (
                            <View style={styles.dot} />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>

                    <ShSpacer size={spacing.xxl} />
                  </View>
                );
              })}

            {/* {userTeams.map(team => (
              <View key={team.id}>
                <TouchableOpacity
                  key={team.id}
                  style={styles.dropdownItem}
                  onPress={() => handleTeamSelect(team)}
                >
                  <View style={styles.dropdownItemLeft}>
                    {team.club?.club_badge_url && (
                      <Image
                        source={{ uri: team.club?.club_badge_url }}
                        style={styles.teamPhoto}
                      />
                    )}
                    <View style={styles.dropdownItemText}>
                      <ShText
                        variant={ShTextVariant.Total}
                        style={styles.teamName}
                      >
                        {team?.club?.name}
                      </ShText>
                      <ShText
                        variant={ShTextVariant.LabelLight}
                        style={styles.teamRole}
                      >
                        {team.name}
                      </ShText>
                    </View>
                    <View style={styles.dropdownItemRight}>
                      {selectedTeam?.id === team.id && (
                        <View style={styles.dot}></View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <ShSpacer size={spacing.xxl} />
              </View>
            ))} */}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xxl,
    zIndex: 999,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
    zIndex: 999,
  },
  dropdownLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  dropdownLeftIcon: {
    width: spacing.buttonHeightMedium,
    height: spacing.buttonHeightMedium,
    borderRadius: spacing.xxxl,
    borderWidth: spacing.xxxs,
    padding: spacing.md,
    borderColor: colorPalette.boderButtonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownLeftContent: {},
  dropdownRight: {
    width: spacing.buttonHeightMedium,
    height: spacing.buttonHeightMedium,
    borderRadius: spacing.md,
    borderWidth: spacing.xxxs,
    padding: spacing.md,
    borderColor: colorPalette.boderButtonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: spacing.lgx,
    color: colorPalette.white,
    flex: 1,
  },
  dropdownSubtext: {
    color: colorPalette.stoneGrey,
    marginRight: spacing.mdx,
  },
  dropdownMenu: {
    position: 'absolute',
    left: spacing.none,
    right: spacing.none,
    backgroundColor: colorPalette.baseDark,
    // borderColor: colorPalette.borderInputField,
    zIndex: spacing.zIndexDropdown,
    paddingHorizontal: spacing.xxl,
    borderBottomWidth: 0.5,
    // borderEndColor: colorPalette.stoneGrey,
    borderColor: colorPalette.stoneGrey,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemRight: {
    width: spacing.tabHeight,
    height: spacing.tabHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownItemText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  teamPhoto: {
    width: spacing.avatarSizeMedium,
    height: spacing.avatarSizeMedium,
    borderRadius: spacing.avatarSizeMedium,
  },
  teamName: {
    color: colorPalette.white,
  },
  teamRole: {
    color: colorPalette.stoneGrey,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.emptyStateVerticalPadding,
  },
  centerText: {
    textAlign: 'center',
  },
  dot: {
    width: spacing.dotSize,
    height: spacing.dotSize,
    borderRadius: spacing.dotSize / 2,
    backgroundColor: colorPalette.primaryGold,
  },
});

export default Header;
