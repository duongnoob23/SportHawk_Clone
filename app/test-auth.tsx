import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useUser } from '@hks/useUser';
import { logger } from '@lib/utils/logger';
import { ShButton, ShText, ShScreenContainer } from '@top/components';
import { ShButtonVariant } from '@con/buttons';
import { ShTextVariant } from '@con/typography';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { router } from 'expo-router';
import { Routes } from '@con/routes';

export default function TestAuthScreen() {
  const { user, profile, session, loading, authChecked, userSignOut } =
    useUser();

  const handleSignOut = async () => {
    try {
      await userSignOut();
      router.replace(Routes.Welcome);
    } catch (error) {
      logger.error('Sign out error:', error);
    }
  };

  if (!authChecked) {
    return (
      <ShScreenContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colorPalette.primary} />
          <ShText variant={ShTextVariant.Body} style={styles.loadingText}>
            Checking authentication...
          </ShText>
        </View>
      </ShScreenContainer>
    );
  }

  return (
    <ShScreenContainer>
      <View style={styles.container}>
        <ShText variant={ShTextVariant.Heading} style={styles.title}>
          Authentication Test
        </ShText>

        <View style={styles.section}>
          <ShText variant={ShTextVariant.Subheading}>Auth Status</ShText>
          <ShText variant={ShTextVariant.Body}>
            Authenticated: {user ? 'Yes ✅' : 'No ❌'}
          </ShText>
          <ShText variant={ShTextVariant.Body}>
            Session: {session ? 'Active ✅' : 'None ❌'}
          </ShText>
          <ShText variant={ShTextVariant.Body}>
            Loading: {loading ? 'Yes' : 'No'}
          </ShText>
        </View>

        {user && (
          <View style={styles.section}>
            <ShText variant={ShTextVariant.Subheading}>User Info</ShText>
            <ShText variant={ShTextVariant.Body}>ID: {user.id}</ShText>
            <ShText variant={ShTextVariant.Body}>Email: {user.email}</ShText>
          </View>
        )}

        {profile && (
          <View style={styles.section}>
            <ShText variant={ShTextVariant.Subheading}>Profile Info</ShText>
            <ShText variant={ShTextVariant.Body}>
              Name: {profile.first_name} {profile.last_name}
            </ShText>
            <ShText variant={ShTextVariant.Body}>
              DOB: {profile.date_of_birth}
            </ShText>
            <ShText variant={ShTextVariant.Body}>
              Team Sort: {profile.team_sort}
            </ShText>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {user ? (
            <ShButton
              title="Sign Out"
              variant={ShButtonVariant.Primary}
              onPress={handleSignOut}
              loading={loading}
            />
          ) : (
            <>
              <ShButton
                title="Go to Sign In"
                variant={ShButtonVariant.Primary}
                onPress={() => router.push(Routes.SignIn)}
              />
              <ShButton
                title="Go to Sign Up"
                variant={ShButtonVariant.Secondary}
                onPress={() => router.push(Routes.SignUp)}
              />
            </>
          )}
        </View>
      </View>
    </ShScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: colorPalette.baseMedium,
    borderRadius: spacing.borderRadiusMd,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
  },
});
