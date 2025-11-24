import { Routes } from '@con/routes';
import { useUser } from '@hks/useUser';
import { supabase } from '@lib/supabase';
import { logger } from '@lib/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';

import {
  ShButton,
  ShConfirmDialog,
  ShFormFieldPassword,
  ShIcon,
  ShLoadingSpinner,
  ShSpacer,
  ShText,
} from '@top/components';

export default function ResetPassword() {
  const router = useRouter();
  const { userResetPassword } = useUser();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [tokensProcessed, setTokensProcessed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isValidJWT = (token: string): boolean => {
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  };

  const handleTokens = useCallback(async () => {
    try {
      const tokenDataStr = await AsyncStorage.getItem('password_reset_tokens');

      if (!tokenDataStr) {
        logger.warn('[USR-002] No password reset tokens found in storage');
        await supabase.auth.signOut();
        router.replace(Routes.ForgotPassword);
        return;
      }

      const tokenData = JSON.parse(tokenDataStr);
      const { access_token, refresh_token, type, timestamp } = tokenData;

      const tokenAge = Date.now() - timestamp;
      const MAX_TOKEN_AGE = 15 * 60 * 1000;

      if (tokenAge > MAX_TOKEN_AGE) {
        logger.warn('[USR-002] Password reset tokens expired', {
          ageMinutes: Math.floor(tokenAge / 60000),
        });
        await AsyncStorage.removeItem('password_reset_tokens');
        await supabase.auth.signOut();
        router.replace(Routes.ForgotPassword);
        return;
      }

      if (
        typeof access_token !== 'string' ||
        typeof refresh_token !== 'string' ||
        type !== 'recovery'
      ) {
        logger.warn('[USR-002] Invalid or missing tokens in reset link:', {
          hasAccessToken: !!access_token,
          hasRefreshToken: !!refresh_token,
          type,
        });
        await AsyncStorage.removeItem('password_reset_tokens');
        await supabase.auth.signOut();
        router.replace(Routes.ForgotPassword);
        return;
      }

      if (!isValidJWT(access_token)) {
        logger.warn('[USR-002] Invalid JWT format in access token');
        await AsyncStorage.removeItem('password_reset_tokens');
        await supabase.auth.signOut();
        router.replace(Routes.ForgotPassword);
        return;
      }

      if (!refresh_token || refresh_token.length < 8) {
        logger.warn('[USR-002] Invalid refresh token');
        await AsyncStorage.removeItem('password_reset_tokens');
        await supabase.auth.signOut();
        router.replace(Routes.ForgotPassword);
        return;
      }

      logger.info('[USR-002] Setting session with password reset tokens');

      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        logger.error('[USR-002] Failed to set session:', error);
        await AsyncStorage.removeItem('password_reset_tokens');
        await supabase.auth.signOut();
        router.replace(Routes.ForgotPassword);
        return;
      }

      if (data?.session) {
        logger.info(
          '[USR-002] Session set successfully, user can now reset password'
        );
        setIsValidSession(true);
        setTokensProcessed(true);
        await AsyncStorage.removeItem('password_reset_tokens');
      } else {
        logger.warn('[USR-002] No session returned after setSession');
        await AsyncStorage.removeItem('password_reset_tokens');
        await supabase.auth.signOut();
        router.replace(Routes.ForgotPassword);
      }
    } catch (error) {
      logger.error('[USR-002] Error handling password reset tokens:', error);
      await AsyncStorage.removeItem('password_reset_tokens');
      await supabase.auth.signOut();
      router.replace(Routes.ForgotPassword);
    }
  }, [router]);

  const checkPasswordResetSession = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsValidSession(true);
      } else {
        if (isResetting) {
          logger.warn('[USR-002] Session check failed during reset attempt');
          return;
        }

        setIsValidSession(false);
        Alert.alert(
          'Invalid Reset Link',
          'This password reset link is invalid or has expired. Please request a new one.',
          [
            {
              text: 'OK',
              onPress: () => router.push(Routes.ForgotPassword),
            },
          ]
        );
      }
    } catch (error) {
      logger.error('[USR-002] Error checking session:', error);
      if (!isResetting) {
        setIsValidSession(false);
      }
    }
  }, [isResetting, router]);

  useEffect(() => {
    const initializePasswordReset = async () => {
      const storedTokens = await AsyncStorage.getItem('password_reset_tokens');

      if (storedTokens && !tokensProcessed) {
        logger.info('[USR-002] Found stored tokens, processing password reset');
        await handleTokens();
      } else if (!storedTokens && !tokensProcessed) {
        logger.info(
          '[USR-002] No stored tokens, checking for existing session'
        );
        await checkPasswordResetSession();
      }
    };

    initializePasswordReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validatePasswords = () => {
    const newErrors: typeof errors = {};
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword =
        'Password must include uppercase, lowercase, number, and special character';
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.newPassword = 'Password must include lowercase';
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'Password must include number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      newErrors.newPassword = 'Password must include special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;
    if (isResetting) return;

    setIsResetting(true);

    try {
      setShowConfirmDialog(false);

      await userResetPassword(newPassword);

      await supabase.auth.signOut();

      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. Please sign in with your new password.',
        [
          {
            text: 'Sign In',
            onPress: () => router.replace(Routes.SignIn),
            style: 'default',
          },
        ],
        {
          cancelable: false,
          onDismiss: () => router.replace(Routes.SignIn),
        }
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to reset password';
      logger.error('[USR-002] Password reset failed:', message);
      setIsResetting(false);

      Alert.alert('Error', message, [{ text: 'OK' }], { cancelable: true });
    }
  };

  const handleBackToSignIn = async () => {
    // Clean up tokens and sign out to clear the password reset session
    await AsyncStorage.removeItem('password_reset_tokens');
    await supabase.auth.signOut();
    router.push(Routes.SignIn);
  };

  const handleCancelModal = () => {
    setShowConfirmDialog(false);
  };

  // Cleanup effect: Remove tokens when component unmounts or user leaves
  useEffect(() => {
    return () => {
      // Clean up tokens on unmount to prevent reuse
      AsyncStorage.removeItem('password_reset_tokens').catch(err =>
        logger.error('[USR-002] Failed to clean up tokens on unmount:', err)
      );
    };
  }, []);

  if (isValidSession === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ShLoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (!isValidSession) {
    return null;
  }

  const isButtonDisabled =
    isResetting ||
    !newPassword ||
    !confirmPassword ||
    newPassword !== confirmPassword ||
    newPassword.length < 8;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.screenPadding,
          paddingTop: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon and Title Section */}
        <View
          style={{
            alignItems: 'center',
            paddingBottom: spacing.xl,
          }}
        >
          <View
            style={{
              width: spacing.logoSize,
              height: spacing.logoSize,
              backgroundColor: colorPalette.backgroundSecondary,
              borderRadius: spacing.borderRadiusLarge,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}
          >
            <ShIcon
              name={IconName.Key}
              size={spacing.xxxl}
              color={colorPalette.primaryGold}
            />
          </View>

          <ShText variant={ShTextVariant.Heading}>Reset Password</ShText>

          <ShSpacer size={spacing.md} />

          <ShText variant={ShTextVariant.Body} style={{ textAlign: 'center' }}>
            Please enter your new and confirmed password
          </ShText>
        </View>

        <ShSpacer size={spacing.xl} />

        {/* Password Fields */}
        <ShFormFieldPassword
          label="New Password"
          placeholder="Enter your new password"
          value={newPassword}
          onChangeText={text => {
            setNewPassword(text);
            setErrors({ ...errors, newPassword: undefined });
          }}
          error={errors.newPassword}
          helperText="Must be at least 8 characters"
        />

        <ShSpacer size={spacing.lg} />

        <ShFormFieldPassword
          label="Confirm Password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            setErrors({ ...errors, confirmPassword: undefined });
          }}
          error={errors.confirmPassword}
        />

        <ShSpacer size={spacing.xxxl} />

        {/* Reset Button */}
        <ShButton
          title="Reset Password"
          variant={ShButtonVariant.Primary}
          onPress={() => {
            if (!validatePasswords()) return;
            setShowConfirmDialog(true);
          }}
          loading={isResetting}
          disabled={isButtonDisabled}
        />

        <ShSpacer size={spacing.xl} />

        {/* Back to Sign In Link */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={handleBackToSignIn}>
            <ShText
              variant={ShTextVariant.Body}
              color={colorPalette.primaryGold}
            >
              Back to Sign In
            </ShText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ShConfirmDialog
        visible={showConfirmDialog}
        title="Reset Password"
        message="Are you sure you want to reset your password?"
        cancelText="Cancel"
        confirmText="Continue"
        onCancel={handleCancelModal}
        onConfirm={handleResetPassword}
      />
    </SafeAreaView>
  );
}
