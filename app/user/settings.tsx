import {
  ShButton,
  ShIcon,
  ShScreenContainer,
  ShScreenHeader,
  ShSpacer,
  ShText,
} from '@cmp/index';
import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { useUser } from '@hks/useUser';
import { logger } from '@lib/utils/logger';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsItemProps {
  icon: IconName;
  label: string;
  onPress: () => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  onPress,
}) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    <View style={styles.settingsItemLeft}>
      <ShIcon
        name={icon}
        size={spacing.iconMd}
        color={colorPalette.textLight}
      />
      <ShText variant={ShTextVariant.Body} style={styles.settingsItemText}>
        {label}
      </ShText>
    </View>
    <ShIcon
      name={IconName.RightArrow}
      size={spacing.iconSm}
      color={colorPalette.stoneGrey}
    />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { profile, userSignOut, loading } = useUser();
  // logger.log("profile?.is_sporthawk_admin", profile?.is_sporthawk_admin)
  const insets = useSafeAreaInsets();
  const handleSignOut = async () => {
    try {
      await userSignOut();
      router.replace(Routes.Welcome);
    } catch (error) {
      logger.error('Sign out error:', error);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <ShScreenHeader
        title="Settings"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft,
          onPress: handleBack,
        }}
      />
      <ShScreenContainer>
        <View
          style={[
            styles.container,
            {
              marginBottom: insets.bottom,
              backgroundColor: colorPalette.baseDark,
            },
          ]}
        >
          {/* Account Section */}

          <View style={styles.section}>
            <ShSpacer size={spacing.xxxl} />
            <ShText variant={ShTextVariant.Label} style={styles.sectionTitle}>
              Account
            </ShText>
            <ShSpacer size={spacing.xxl} />
            <SettingsItem
              icon={IconName.PersonOutline}
              label="Manage Account"
              onPress={() => navigateTo(Routes.ManageAccount)}
            />

            <ShSpacer size={spacing.lg} />
            {/* <SettingsItem
              icon={IconName.Team}
              label="Manage Clubs & Teams"
              onPress={() => navigateTo(Routes.ManageClubs)}
            /> */}
            <SettingsItem
              icon={IconName.Card}
              label="Manage History"
              onPress={() => navigateTo(Routes.PaymentHistory)}
            />
          </View>

          {/* Activity Section */}
          {/* <View style={styles.section}>
            <ShText variant={ShTextVariant.Label} style={styles.sectionTitle}>
              Activity
            </ShText>
            <SettingsItem
              icon={IconName.Edit}
              label="Manage Posts"
              onPress={() => navigateTo(Routes.ManagePosts)}
            />
            <SettingsItem
              icon={IconName.PersonOutline}
              label="Blocked Users"
              onPress={() => navigateTo(Routes.BlockedUsers)}
            />
            <SettingsItem
              icon={IconName.Mail}
              label="Invitations"
              onPress={() => navigateTo(Routes.Invitations)}
            />
            <SettingsItem
              icon={IconName.Heart}
              label="Saved Clubs"
              onPress={() => navigateTo(Routes.SavedClubs)}
            />
          </View> */}

          {/* Accessibility & Advanced Section */}
          <View style={styles.section}>
            <ShSpacer size={spacing.xxxl} />
            <ShText variant={ShTextVariant.Label} style={styles.sectionTitle}>
              Accessibility & Advanced
            </ShText>
            <ShSpacer size={spacing.xxl} />
            <SettingsItem
              icon={IconName.HelpCircleOutline}
              label="Help & Feedback"
              onPress={() => navigateTo(Routes.HelpFeedback)}
            />
            <ShSpacer size={spacing.lg} />

            {/* <SettingsItem
              icon={IconName.Key}
              label="Permissions"
              onPress={() => navigateTo(Routes.Permissions)}
            />
            <SettingsItem
              icon={IconName.Info}
              label="About"
              onPress={() => navigateTo(Routes.AboutUser)}
            /> */}
            <SettingsItem
              icon={IconName.Terms}
              label="Terms & Service"
              onPress={() => navigateTo(Routes.TermsService)}
            />
          </View>

          <ShSpacer size={spacing.adminButtonTextTop} />

          {/* Sign Out Button */}
          <View style={styles.signOutContainer}>
            <ShButton
              title="Sign Out"
              variant={ShButtonVariant.Tertiary}
              onPress={handleSignOut}
              loading={loading}
              style={styles.signOutButton}
              textStyle={{ color: colorPalette.error }}
              icon={
                <ShIcon
                  name={IconName.Signout}
                  size={spacing.iconMd}
                  color={colorPalette.error}
                />
              }
            />
          </View>

          {/* {profile?.is_sporthawk_admin && (
            <View style={styles.section}>
              <ShText variant={ShTextVariant.Label} style={styles.sectionTitle}>
                App Admins Only
              </ShText>
              <SettingsItem
                icon={IconName.HelpCircleOutline}
                label="Design System"
                onPress={() => navigateTo(Routes.DesignSystem)}
              />
            </View>
          )} */}
        </View>
      </ShScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    color: colorPalette.error,
  },
  section: {},
  sectionTitle: {
    color: colorPalette.textLight,
    fontSize: spacing.lg,
  },
  settingsItem: {
    backgroundColor: colorPalette.backgroundListItem,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderColor,
    borderRadius: spacing.lg,
    borderColor: colorPalette.borderColorLight,
    borderWidth: spacing.xxxs,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    marginLeft: spacing.lg,
    color: colorPalette.textLight,
  },
  signOutContainer: {},
  signOutButton: {
    backgroundColor: colorPalette.errorBlack,
    borderColor: colorPalette.error,
    color: colorPalette.error,
  },
});
