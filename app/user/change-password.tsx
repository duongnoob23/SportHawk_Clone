import { useUser } from '@hks/useUser';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';

import {
  ShButton,
  ShFormFieldPassword,
  ShScreenHeader,
  ShSpacer,
} from '@top/components';

import { IconName } from '@top/constants/icons';

export default function ChangePassword() {
  const router = useRouter();

  const { userSignOut, updatePassword } = useUser();

  const [password, setPassword] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<{
    password?: string;
    passwordNew?: string;
    passwordConfirm?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        'Password must include uppercase, lowercase, number, and special character';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must include lowercase';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must include number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = 'Password must include special character';
    }

    if (!passwordNew) {
      newErrors.passwordNew = 'Password is required';
    } else if (passwordNew.length < 8) {
      newErrors.passwordNew = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(passwordNew)) {
      newErrors.passwordNew =
        'Password must include uppercase, lowercase, number, and special character';
    } else if (!/[a-z]/.test(passwordNew)) {
      newErrors.passwordNew = 'Password must include lowercase';
    } else if (!/[0-9]/.test(passwordNew)) {
      newErrors.passwordNew = 'Password must include number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordNew)) {
      newErrors.passwordNew = 'Password must include special character';
    }

    if (!passwordConfirm) {
      newErrors.passwordConfirm = 'Please confirm your password';
    } else if (passwordConfirm !== passwordNew) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignOut = async () => {
    try {
      await userSignOut();
      router.replace(Routes.Welcome);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    try {
      // TODO: move to UserContext, check the current password, or change whole screen to use SupaBase passwordReset
      // Problem: if use resetPasswordForEmail then user get OTP and needs to verify!
      const result = await updatePassword(password, passwordNew);

      if (!result.success) {
        Alert.alert('Change password failed', result.error!);
        return;
      }

      Alert.alert('Password Changed', 'Now sign in using your new password');

      await handleSignOut();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Please try again, else contact support.';
      Alert.alert('Change password failed', message);
    }
  };

  return (
    <>
      <ShScreenHeader
        title="Change Password"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: () => router.back(),
        }}
      />
      <View style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <ShSpacer size={spacing.xxl} />

            <ShFormFieldPassword
              required
              label="Type Current Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <ShSpacer size={spacing.xxl} />

            <ShFormFieldPassword
              required
              label="Type New Password"
              placeholder="Enter password"
              value={passwordNew}
              onChangeText={setPasswordNew}
              error={errors.passwordNew}
            />
            <ShSpacer size={spacing.xxl} />

            <ShFormFieldPassword
              required
              label="Confirm New Password"
              placeholder="Enter password"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              error={errors.passwordConfirm}
            />

            <ShSpacer size={spacing.adminButtonTextTop} />

            <ShButton
              title="Save new password"
              variant={ShButtonVariant.Primary}
              onPress={handleChangePassword}
            />

            <ShSpacer size={spacing.md} />

            <ShButton
              title="Forgot Password?"
              variant={ShButtonVariant.Secondary}
              onPress={() => router.replace(Routes.ForgotPassword)}
            />

            <ShSpacer size={spacing.xl} />
          </View>
        </ScrollView>
      </View>
    </>
  );
}
