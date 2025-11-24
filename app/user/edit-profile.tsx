import {
  ShIcon,
  ShScreenContainer,
  ShScreenHeader,
  ShSpacer,
  ShText,
} from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { fontWeights, ShTextVariant } from '@con/typography';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useUser } from '@hks/useUser';
import { supabase } from '@lib/supabase';
import { logger } from '@lib/utils/logger';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditProfileScreen() {
  const { user, profile, updateProfile } = useUser();
  const { showActionSheetWithOptions } = useActionSheet();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(
    profile?.profile_photo_uri || null
  );
  const [backgroundPhoto, setBackgroundPhoto] = useState(
    profile?.background_image_uri || null
  );
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    if (!hasChanges) {
      Alert.alert('No Changes', 'No changes to save');
      return;
    }

    try {
      setLoading(true);

      // Update profile with new photo URLs
      await updateProfile({
        profile_photo_uri: profilePhoto,
        background_image_uri: backgroundPhoto,
      });

      // Navigate back to profile screen
      router.replace(Routes.Profile);
    } catch (error) {
      logger.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const showImagePicker = (type: 'profile' | 'background') => {
    const options = ['Take Photo', 'Choose from Gallery', 'Cancel'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: `Select ${type === 'profile' ? 'Profile' : 'Background'} Photo`,
        tintColor: Platform.OS === 'ios' ? colorPalette.primaryGold : undefined,
      },
      async buttonIndex => {
        if (buttonIndex === 0) {
          // Take Photo
          await launchCamera(type);
        } else if (buttonIndex === 1) {
          // Choose from Gallery
          await launchGallery(type);
        }
      }
    );
  };

  const launchCamera = async (type: 'profile' | 'background') => {
    // Request camera permissions
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera permissions to take photos.'
        );
        return;
      }
    }

    // Launch camera with base64 option for ArrayBuffer conversion
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 0.8,
      base64: true, // Required for ArrayBuffer conversion
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      const base64Data = result.assets[0].base64;
      logger.log(`Camera captured image URI: ${imageUri}`);

      // Set the image immediately for preview
      if (type === 'profile') {
        setProfilePhoto(imageUri);
      } else {
        setBackgroundPhoto(imageUri);
      }

      // Upload using ArrayBuffer
      if (base64Data) {
        uploadImageWithArrayBuffer(base64Data, type);
      } else {
        logger.error('No base64 data from camera');
        Alert.alert('Error', 'Failed to process image from camera');
      }
    }
  };

  const launchGallery = async (type: 'profile' | 'background') => {
    // Request gallery permissions
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need photo library permissions to select photos.'
        );
        return;
      }
    }

    // Launch gallery with base64 enabled for consistent handling
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 0.8,
      base64: true, // Enable base64 for ArrayBuffer conversion
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      const base64Data = result.assets[0].base64;
      logger.log(`Gallery selected image URI: ${imageUri}`);

      // Set the image immediately for preview
      if (type === 'profile') {
        setProfilePhoto(imageUri);
      } else {
        setBackgroundPhoto(imageUri);
      }

      // Upload using ArrayBuffer
      if (base64Data) {
        uploadImageWithArrayBuffer(base64Data, type);
      } else {
        logger.error('No base64 data from gallery');
        Alert.alert('Error', 'Failed to process image from gallery');
      }
    }
  };

  const uploadImageWithArrayBuffer = async (
    base64Data: string,
    type: 'profile' | 'background'
  ) => {
    if (!user) return;

    try {
      if (type === 'profile') {
        setUploadingProfile(true);
      } else {
        setUploadingBackground(true);
      }

      logger.log(`Starting ArrayBuffer upload for ${type}`);

      // Convert base64 to ArrayBuffer using base64-arraybuffer
      const arrayBuffer = decode(base64Data);

      // Log the ArrayBuffer size to verify it has data
      logger.log(`ArrayBuffer created: byteLength=${arrayBuffer.byteLength}`);

      if (arrayBuffer.byteLength === 0) {
        throw new Error('ArrayBuffer is empty');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${user.id}/${type}_${timestamp}.jpg`;

      // Upload ArrayBuffer to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        logger.error('Upload error:', uploadError);
        throw uploadError;
      }

      logger.log(`Upload successful: ${uploadData?.path}`);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        logger.log(
          `Generated public URL for ${type}: ${publicUrlData.publicUrl}`
        );
        if (type === 'profile') {
          setProfilePhoto(publicUrlData.publicUrl);
        } else {
          setBackgroundPhoto(publicUrlData.publicUrl);
        }
        setHasChanges(true);
      } else {
        throw new Error('Failed to generate URL for uploaded image');
      }
    } catch (error) {
      logger.error(`Error uploading ${type} image:`, error);
      Alert.alert('Upload Error', `Failed to upload ${type} photo`);
    } finally {
      if (type === 'profile') {
        setUploadingProfile(false);
      } else {
        setUploadingBackground(false);
      }
    }
  };

  return (
    <>
      <ShScreenHeader
        title="Edit profile"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: () => router.back(),
        }}
        rightAction={{
          type: 'text',
          text: 'Save',
          onPress: handleSave,
        }}
      />
      <ShScreenContainer>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <ShText variant={ShTextVariant.Label} style={styles.photoLabel}>
              Profile Photo{' '}
              <ShText style={{ color: colorPalette.primaryGold }}>*</ShText>
            </ShText>
            <TouchableOpacity
              style={styles.profilePhotoContainer}
              onPress={() => showImagePicker('profile')}
              disabled={uploadingProfile}
            >
              {uploadingProfile ? (
                <ActivityIndicator
                  size="large"
                  color={colorPalette.primaryGold}
                />
              ) : profilePhoto ? (
                // <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.profilePhoto}
                />
              ) : (
                // </View>
                <View style={styles.profilePhotoPlaceholder}>
                  <ShIcon
                    name={IconName.PersonOutline}
                    size={spacing.xxxl}
                    color={colorPalette.stoneGrey}
                  />
                </View>
              )}
              <View
                style={[styles.uploadIconContainer, { bottom: 0, right: 0 }]}
              >
                <ShIcon
                  name={IconName.Camera}
                  size={spacing.iconMd}
                  color={colorPalette.baseDark}
                />
              </View>
            </TouchableOpacity>

            <ShSpacer size={spacing.xxl} />
            <ShText variant={ShTextVariant.Small} style={styles.photoHint}>
              Choose a clear photo of your face
            </ShText>
          </View>

          {/* Background Photo Section */}
          <View style={styles.photoSection}>
            <ShText variant={ShTextVariant.Label} style={styles.photoLabel}>
              Background Photo{' '}
              <ShText style={{ color: colorPalette.primaryGold }}>*</ShText>
            </ShText>
            <TouchableOpacity
              style={styles.backgroundPhotoContainer}
              onPress={() => showImagePicker('background')}
              disabled={uploadingBackground}
            >
              {uploadingBackground ? (
                <ActivityIndicator
                  size="large"
                  color={colorPalette.primaryGold}
                />
              ) : backgroundPhoto ? (
                <Image
                  source={{ uri: backgroundPhoto }}
                  style={styles.backgroundPhoto}
                />
              ) : (
                <View style={styles.backgroundPhotoPlaceholder}>
                  <ShIcon
                    name={IconName.SceneryOutline}
                    size={spacing.xxxl}
                    color={colorPalette.stoneGrey}
                  />
                  <ShText
                    variant={ShTextVariant.Small}
                    style={styles.placeholderText}
                  >
                    Add background photo
                  </ShText>
                </View>
              )}
              <View style={styles.uploadIconContainer}>
                <ShIcon
                  name={IconName.Camera}
                  size={spacing.iconMd}
                  color={colorPalette.baseDark}
                />
              </View>
            </TouchableOpacity>
            <ShSpacer size={spacing.xxl} />
            <View>
              <ShText variant={ShTextVariant.Small} style={styles.photoHint}>
                Choose a photo that represents you and
              </ShText>
              <ShText variant={ShTextVariant.Small} style={styles.photoHint}>
                your sporting interests
              </ShText>
            </View>
          </View>
        </ScrollView>
      </ShScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  saveButton: {
    marginRight: spacing.lg,
  },
  saveButtonText: {
    color: colorPalette.primaryGold,
  },
  photoSection: {
    marginTop: spacing.xl,
    zIndex: 0,
  },
  photoLabel: {
    color: colorPalette.textLight,
    marginBottom: spacing.xxl,
  },
  profilePhotoContainer: {
    width: spacing.profilePhotoSize,
    height: spacing.profilePhotoSize,
    borderRadius: spacing.profilePhotoSize / 2,
    backgroundColor: colorPalette.backgroundColorPhoto,
    borderColor: colorPalette.borderColorLight,
    borderWidth: spacing.xxxs,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  profilePhotoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPhotoContainer: {
    width: '100%',
    height: spacing.backgroundImageHeight,
    backgroundColor: colorPalette.backgroundColorPhoto,
    borderColor: colorPalette.borderColorLight,
    borderWidth: spacing.xxxs,
    borderRadius: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundPhoto: {
    width: '100%',
    height: '100%',
  },
  backgroundPhotoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colorPalette.stoneGrey,
    marginTop: spacing.sm,
  },
  uploadIconContainer: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colorPalette.primaryGold,
    borderRadius: spacing.tabBarHeight,
    padding: spacing.sm,
    zIndex: 999,
    elevation: 10,
  },
  photoHint: {
    color: colorPalette.textSecondary,
    textAlign: 'center',
    fontWeight: fontWeights.regular,
    fontSize: spacing.mdx,
  },
});
