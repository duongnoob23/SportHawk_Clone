import {
  ShButton,
  ShFormFieldEmail,
  ShFormFieldName,
  ShIcon,
  ShNavItem,
  ShScreenContainer,
  ShScreenHeader,
  ShSpacer,
  ShText,
} from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { useUser } from '@hks/useUser';
import { ShButtonVariant } from '@top/constants/buttons';
import { Routes } from '@top/constants/routes';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ManageAccountItemProps {
  icon: IconName;
  label: string;
  onPress: () => void;
}

const ManageAccountItem: React.FC<ManageAccountItemProps> = ({
  icon,
  label,
  onPress,
}) => (
  <TouchableOpacity style={styles.ManageAccountItem} onPress={onPress}>
    <View style={styles.ManageAccountItemLeft}>
      <ShIcon
        name={icon}
        size={spacing.iconMd}
        color={colorPalette.textLight}
      />
      <ShText variant={ShTextVariant.Body} style={styles.ManageAccountItemText}>
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

export default function ManageAccountScreen() {
  const { user, profile, userSignOut, loading, updateProfile } = useUser();
  const [email, setEmail] = useState(user?.user_metadata.email ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  // console.log('USER - PROFILE', JSON.stringify(profile, null, 2));

  const [info, setInfo] = useState({
    'firstName': '',
    'lastName': '',
    'email': '',
  });

  const validateInfo = () => {
    let errors: Record<string, string> = {};

    // Validate firstName
    if (!info.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (info.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (info.firstName.length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters';
    }

    // Validate lastName
    if (!info.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (info.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (info.lastName.length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters';
    }

    // Validate email
    if (!info.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
      errors.email = 'Email is invalid';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (user && profile) {
      const newInfo = {
        firstName: profile?.first_name ?? '',
        lastName: profile?.last_name ?? '',
        email: user.user_metadata.email ?? '',
      };
      setInfo(newInfo);
    }
  }, [user, profile]);

  const handleChangeInfo = (name: string, value: string) => {
    setInfo(pre => ({
      ...pre,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!validateInfo()) return;
    try {
      const payload = {
        first_name: info.firstName,
        last_name: info.lastName,
      };

      const res = await updateProfile(payload);

      if (res && res.success) {
        router.push(Routes.Profile);
      } else {
        console.error('Error in update profile', res.error);
        throw res.error;
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <ShScreenHeader
        title="Manage Account"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: () => router.back(),
        }}
        rightAction={{
          type: 'text',
          text: 'Save',
          onPress: () => handleSave(),
        }}
      />

      <ShScreenContainer>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <ShFormFieldName
              label="First Name"
              placeholder="Enter your first name"
              value={info.firstName}
              onChangeText={text => handleChangeInfo('firstName', text)}
              required
              error={errors.firstName}
            />

            <ShSpacer size={spacing.xs} />

            <ShFormFieldName
              label="Last Name"
              placeholder="Enter your surname"
              value={info.lastName}
              onChangeText={text => handleChangeInfo('lastName', text)}
              required
              error={errors.lastName}
            />
            <ShSpacer size={spacing.xs} />

            <ShFormFieldEmail
              label="Email"
              placeholder="Enter your email"
              value={info.email}
              onChangeText={text => handleChangeInfo('email', text)}
              required
              error={errors.email}
              editable={false}
              // error={errors.email}
            />

            <ShSpacer size={spacing.xs} />

            <ShNavItem
              label={`Password`}
              subtitle={'Change password'}
              onPress={() => navigateTo(Routes.ChangePassword)}
              required
              showDropdownIcon
              isSpaceBetween={true}
            />

            <ShSpacer size={spacing.adminButtonTextTop} />

            <View style={styles.signOutContainer}>
              <ShButton
                title="Delete Account"
                variant={ShButtonVariant.Tertiary}
                onPress={() => navigateTo(Routes.DeleteAccount)}
                loading={loading}
                style={styles.signOutButton}
                textStyle={{ color: colorPalette.error }}
              />
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
    padding: spacing.xxl,
  },
  containerPassword: {
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colorPalette.stoneGrey,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  ManageAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderColor,
  },
  ManageAccountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ManageAccountItemText: {
    marginLeft: spacing.lg,
    color: colorPalette.textLight,
  },
  signOutContainer: {},
  signOutButton: {
    backgroundColor: colorPalette.errorBlack,
    borderColor: colorPalette.error,
    color: colorPalette.error,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
});
