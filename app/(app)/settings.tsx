import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShButton, ShScreenContainer, ShSpacer, ShText } from '@cmp/index';
import { useUser } from '@hks/useUser';
import { logger } from '@lib/utils/logger';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

export default function SettingsScreen() {
  const { profile, userSignOut, loading } = useUser();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);
  const [analytics, setAnalytics] = React.useState(true);

  const handleBack = () => {
    router.back();
  };

  const handleSignOut = async () => {
    try {
      await userSignOut();
      router.replace(Routes.Welcome);
    } catch (error) {
      logger.error('Sign out error:', error);
    }
  };

  const handleDesignSystem = () => {
    router.push(Routes.DesignSystem);
  };

  return (
    <ShScreenContainer>
      <View style={styles.container}>
        <ShSpacer size={spacing.xxxl} />

        <ShText variant={ShTextVariant.Display} style={styles.title}>
          Settings
        </ShText>

        <ShSpacer size={spacing.xxxl} />

        <View style={styles.settingRow}>
          <ShText variant={ShTextVariant.Body} style={styles.settingLabel}>
            Push Notifications
          </ShText>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{
              false: colorPalette.surface,
              true: colorPalette.primaryGold,
            }}
            thumbColor={colorPalette.textLight}
          />
        </View>

        <View style={styles.settingRow}>
          <ShText variant={ShTextVariant.Body} style={styles.settingLabel}>
            Dark Mode
          </ShText>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{
              false: colorPalette.surface,
              true: colorPalette.primaryGold,
            }}
            thumbColor={colorPalette.textLight}
          />
        </View>

        <View style={styles.settingRow}>
          <ShText variant={ShTextVariant.Body} style={styles.settingLabel}>
            Analytics
          </ShText>
          <Switch
            value={analytics}
            onValueChange={setAnalytics}
            trackColor={{
              false: colorPalette.surface,
              true: colorPalette.primaryGold,
            }}
            thumbColor={colorPalette.textLight}
          />
        </View>

        <ShSpacer size={spacing.xxxl} />

        <View style={styles.section}>
          <ShText
            variant={ShTextVariant.Subheading}
            style={styles.sectionTitle}
          >
            About
          </ShText>

          <ShSpacer size={spacing.md} />

          <ShText variant={ShTextVariant.Small} style={styles.aboutText}>
            SportHawk v4.0.0
          </ShText>
          <ShText variant={ShTextVariant.Small} style={styles.aboutText}>
            Built with React Native & Expo
          </ShText>
        </View>

        <ShSpacer size={spacing.xxxl} />

        {/* Admin Options */}
        {profile?.is_sporthawk_admin === true && (
          <>
            <View style={styles.section}>
              <ShText
                variant={ShTextVariant.Subheading}
                style={styles.sectionTitle}
              >
                Admin Options
              </ShText>

              <ShSpacer size={spacing.md} />

              <ShButton
                title="Design System"
                variant={ShButtonVariant.Secondary}
                onPress={handleDesignSystem}
                loading={loading}
                style={{ marginBottom: spacing.md }}
              />

              <ShButton
                title="Sign Out"
                variant={ShButtonVariant.Tertiary}
                onPress={handleSignOut}
                loading={loading}
              />
            </View>

            <ShSpacer size={spacing.xxxl} />
          </>
        )}

        <ShButton
          title="Back to Home"
          variant={ShButtonVariant.Secondary}
          onPress={handleBack}
        />
      </View>
    </ShScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  title: {
    textAlign: 'center',
    color: colorPalette.textLight,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colorPalette.borderColor,
  },
  settingLabel: {
    color: colorPalette.textLight,
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    color: colorPalette.textLight,
    marginBottom: spacing.sm,
  },
  aboutText: {
    color: colorPalette.textSecondary,
    marginBottom: spacing.xs,
  },
});
