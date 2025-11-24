import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShIcon, ShSpacer, ShText } from '@top/components';
import { useUser } from '@top/hooks/useUser';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { UserTeam } from '../../types';

interface AdminMenuProps {
  teamId: string;
  selectedTeam: UserTeam;
}

const AdminMenu = ({ teamId, selectedTeam }: AdminMenuProps) => {
  const { user } = useUser();

  if (!user?.app_metadata.is_super_admin) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={styles.emptyTabContent}>
          <ShIcon
            name={IconName.LockFillSmall}
            size={spacing.iconSizeXLarge}
            color={colorPalette.primaryGold}
          />
          <ShSpacer size={spacing.lg} />
          <ShText variant={ShTextVariant.Subheading} style={styles.centerText}>
            This area is locked
          </ShText>
          <ShSpacer size={spacing.md} />
          <ShText variant={ShTextVariant.Body} style={styles.centerText}>
            This area is only accessible to
          </ShText>
          <ShText variant={ShTextVariant.Body} style={styles.centerText}>
            assigned Team Admins
          </ShText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.adminContent}>
      {/* 2x3 Grid of admin buttons */}
      <View style={styles.adminGrid}>
        {/* Row 1 */}
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => router.push(`/teams/${teamId}/admin/events`)}
        >
          <View style={styles.adminButtonIcon}>
            <ShIcon
              name={IconName.CalendarDefault}
              size={spacing.adminButtonIconSize}
              color={colorPalette.primaryGold}
            />
          </View>
          <ShText variant={ShTextVariant.Body} style={styles.adminButtonText}>
            Events
          </ShText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => router.push(`/teams/${teamId}/admin/payments`)}
        >
          <View style={styles.adminButtonIcon}>
            <ShIcon
              name={IconName.Card}
              size={spacing.adminButtonIconSize}
              color={colorPalette.primaryGold}
            />
          </View>
          <ShText variant={ShTextVariant.Body} style={styles.adminButtonText}>
            Payments
          </ShText>
        </TouchableOpacity>

        {/* Row 2 */}
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => router.push(`/teams/${teamId}/admin/members`)}
        >
          <View style={styles.adminButtonIcon}>
            <ShIcon
              name={IconName.Team}
              size={spacing.adminButtonIconSize}
              color={colorPalette.primaryGold}
            />
          </View>
          <ShText variant={ShTextVariant.Body} style={styles.adminButtonText}>
            Members
          </ShText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          // onPress={() => router.push(`/teams/${teamId}/admin/alerts`)}
        >
          <View style={styles.adminButtonIcon}>
            <ShIcon
              name={IconName.Bell}
              size={spacing.adminButtonIconSize}
              color={colorPalette.primaryGold}
            />
          </View>
          <ShText variant={ShTextVariant.Body} style={styles.adminButtonText}>
            Alerts
          </ShText>
        </TouchableOpacity>

        {/* Row 3 */}
        <TouchableOpacity style={styles.adminButton}>
          <View style={styles.adminButtonIcon}>
            <ShIcon
              name={IconName.Settings}
              size={spacing.adminButtonIconSize}
              color={colorPalette.primaryGold}
            />
          </View>
          <ShText variant={ShTextVariant.Body} style={styles.adminButtonText}>
            Settings
          </ShText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          // onPress={() => router.push(`/teams/${teamId}/admin/admins`)}
        >
          <View style={styles.adminButtonIcon}>
            <ShIcon
              name={IconName.Admin}
              size={spacing.adminButtonIconSize}
              color={colorPalette.primaryGold}
            />
          </View>
          <ShText variant={ShTextVariant.Body} style={styles.adminButtonText}>
            Admins
          </ShText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  adminContent: {
    flex: 1,
    paddingTop: spacing.xxl,
    paddingBottom:
      spacing.fabButtonBottom + spacing.fabButtonSize + spacing.xxl,
  },
  adminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  adminButton: {
    width: spacing.adminButtonWidthPercent,
    height: spacing.adminButtonHeight,
    backgroundColor: colorPalette.black,
    borderRadius: spacing.adminButtonBorderRadius,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderAdminButton,
    position: 'relative',
    marginBottom: spacing.smd,
  },
  adminButtonIcon: {
    position: 'absolute',
    top: spacing.adminButtonIconTop,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  adminButtonText: {
    position: 'absolute',
    top: spacing.adminButtonTextTop,
    left: 0,
    right: 0,
    color: colorPalette.textLight,
    textAlign: 'center',
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

export default AdminMenu;
