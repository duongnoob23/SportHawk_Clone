import {
  ShButton,
  ShIcon,
  ShScreenContainer,
  ShScreenHeader,
  ShText,
} from '@cmp/index';
import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { fontWeights, ShTextVariant } from '@con/typography';
import { useUser } from '@hks/useUser';
import { router } from 'expo-router';
import React from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  const { profile, user, switchUser, loading } = useUser();

  const handleEditProfile = () => {
    router.push(Routes.EditProfile);
  };

  const handleSettings = () => {
    router.push(Routes.UserSettings);
  };

  const handleSwitchUser = async () => {
    const isAdmin = user?.id === 'f3ee2852-4cf0-45e8-8c71-8480810d45e7';
    await switchUser(!isAdmin);
  };

  const isAdmin = user?.id === 'f3ee2852-4cf0-45e8-8c71-8480810d45e7';

  // Default images if none are set
  const backgroundImage = profile?.background_image_uri || null;
  const profilePhoto = profile?.profile_photo_uri || null;
  const userName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : 'User Name';

  return (
    <>
      <ShScreenHeader
        title="Profile"
        showBorder={true}
        notShowLeft={true}
        rightAction={{
          type: 'icon',
          iconName: IconName.Settings,
          onPress: handleSettings,
        }}
      />
      <ShScreenContainer>
        <View style={styles.container}>
          {/* Background Photo */}
          <View style={styles.backgroundContainer}>
            {backgroundImage ? (
              <ImageBackground
                source={{ uri: backgroundImage }}
                style={styles.backgroundImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.backgroundPlaceholder} />
            )}
          </View>

          {/* Profile Content */}
          <View style={styles.profileContent}>
            {/* Profile Photo */}
            <View style={styles.profilePhotoContainer}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.profilePhoto}
                />
              ) : (
                <View style={styles.profilePhotoPlaceholder}>
                  <ShIcon
                    name={IconName.PersonOutline}
                    size={spacing.xxxl}
                    color={colorPalette.stoneGrey}
                  />
                </View>
              )}
            </View>

            {/* User Name */}
            <ShText variant={ShTextVariant.Heading} style={styles.userName}>
              {userName}
            </ShText>

            {/* Edit Profile Button */}
            <ShButton
              title="Edit Profile"
              variant={ShButtonVariant.Primary}
              onPress={handleEditProfile}
              style={styles.editButton}
              textStyle={{ fontWeight: '400' }}
            />

            {/* Switch User Button (Development Only) */}
            {__DEV__ && (
              <ShButton
                title={isAdmin ? 'Switch to User' : 'Switch to Admin'}
                variant={ShButtonVariant.Secondary}
                onPress={handleSwitchUser}
                style={[styles.editButton, styles.switchButton]}
                textStyle={{ fontWeight: '400' }}
                loading={loading}
                disabled={loading}
              />
            )}
          </View>
        </View>
      </ShScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsButton: {
    marginRight: spacing.md,
    padding: spacing.sm,
    borderRadius: spacing.radiusLg,
    backgroundColor: colorPalette.surface,
  },
  backgroundContainer: {
    height: spacing.backgroundImageHeight,
    width: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colorPalette.surface,
  },
  profileContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: -spacing.profilePhotoOffset,
  },
  profilePhotoContainer: {
    width: spacing.profilePhotoSize,
    height: spacing.profilePhotoSize,
    borderRadius: spacing.profilePhotoSize / 2,
    borderWidth: spacing.borderWidthThick,
    borderColor: colorPalette.baseDark,
    overflow: 'hidden',
    backgroundColor: colorPalette.baseDark,
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  profilePhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colorPalette.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    marginTop: spacing.lg,
    color: colorPalette.textLight,
    textAlign: 'center',
    fontWeight: fontWeights.semiBold,
    fontSize: spacing.xxl,
  },
  editButton: {
    marginTop: spacing.xxl,
    width: '100%',
  },
  switchButton: {
    marginTop: spacing.md,
    backgroundColor: colorPalette.primaryGold,
  },
});
