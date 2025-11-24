import { Routes } from '@con/routes';
import { useUser } from '@hks/useUser';
import { logger } from '@lib/utils/logger';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { fontWeights, ShTextVariant } from '@con/typography';

import {
  ShButton,
  ShConfirmDialog,
  ShFormFieldEmail,
  ShIcon,
  ShSpacer,
  ShText,
} from '@top/components';

export default function ForgotPassword() {
  const router = useRouter();
  const { userForgotPassword, loading } = useUser();

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    logger.log('[USR-001] ForgotPassword screen mounted');
    return () => {
      logger.log('[USR-001] ForgotPassword screen unmounted');
    };
  }, []);

  const validateEmail = () => {
    logger.debug('[USR-001] Validating email:', email);

    if (!email) {
      logger.warn('[USR-001] Email validation failed: empty email');
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      logger.warn('[USR-001] Email validation failed: invalid format', email);
      setError('Please enter a valid email');
      return false;
    }

    logger.log('[USR-001] Email validation passed:', email);
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    logger.log('[USR-001] Reset password initiated for email:', email);

    if (!validateEmail()) {
      logger.debug('[USR-001] Reset aborted: validation failed');
      return;
    }

    try {
      setShowConfirmDialog(false);

      logger.log('[USR-001] Calling userForgotPassword API...');
      await userForgotPassword(email);
      logger.log('[USR-001] Password reset email sent successfully to:', email);
      setEmailSent(true);

      Alert.alert(
        'Reset Link Sent',
        'A password reset link has been sent to your email. Please check your inbox (and spam folder) within the next few minutes.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      logger.error(
        '[USR-001] Failed to send reset email:',
        error.message,
        error
      );
      Alert.alert(
        'Error',
        error.message || 'Failed to send reset email. Please try again.'
      );
    }
  };

  const handleBackToSignIn = () => {
    logger.log('[USR-001] Navigating back to Sign In screen');
    router.replace(Routes.SignIn);
  };

  const handleCancelModal = () => {
    setShowConfirmDialog(false);
  };

  if (emailSent) {
    logger.log('[USR-001] Rendering success screen for email:', email);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
        <ScrollView
          contentContainerStyle={{
            padding: spacing.screenPadding,
            paddingTop: spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Message */}
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
                name={IconName.Mail}
                size={spacing.xxxl}
                color={colorPalette.primaryGold}
              />
            </View>

            <ShText variant={ShTextVariant.Heading}>
              Reset Password Triggered
            </ShText>

            <ShSpacer size={spacing.md} />

            <ShText
              variant={ShTextVariant.Body}
              style={{ textAlign: 'center' }}
            >
              We&apos;ve sent a password reset link to{'\n'}
              {email}
            </ShText>
          </View>

          <ShSpacer size={spacing.xxxl} />

          <ShText
            variant={ShTextVariant.Body}
            style={{
              textAlign: 'center',
              color: colorPalette.textSecondary,
              lineHeight: spacing.xxl,
            }}
          >
            Enter your email and we’ll send you
          </ShText>
          <ShText
            variant={ShTextVariant.Body}
            style={{
              textAlign: 'center',
              color: colorPalette.textSecondary,
              lineHeight: spacing.xxl,
            }}
          >
            instructions to reset your password
          </ShText>

          <ShSpacer size={spacing.xxxl} />

          {/* Removed Back to Sign In button to prevent navigation away per requirements */}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

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
              backgroundColor: colorPalette.primaryBlack,
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
          <ShSpacer size={spacing.lg} />
          <ShText
            variant={ShTextVariant.Heading}
            style={{ fontSize: spacing.xxl, fontWeight: fontWeights.semiBold }}
          >
            Forgot Password
          </ShText>
          <ShSpacer size={spacing.lg} />
          <ShText
            variant={ShTextVariant.Body}
            style={{
              textAlign: 'center',
              color: colorPalette.textThird,
              lineHeight: spacing.xxl,
            }}
          >
            Enter your email and we’ll send you
          </ShText>
          <ShText
            variant={ShTextVariant.Body}
            style={{
              textAlign: 'center',
              color: colorPalette.textThird,
              lineHeight: spacing.xxl,
            }}
          >
            instructions to reset your password
          </ShText>
        </View>

        <ShSpacer size={spacing.xl} />

        {/* Email Input */}
        <ShFormFieldEmail
          required
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={text => {
            setEmail(text);
            setError('');
          }}
          error={error}
        />

        <ShSpacer size={spacing.md} />

        {/* Reset Button */}
        <ShButton
          title="Send Reset Link"
          variant={ShButtonVariant.Primary}
          onPress={() => {
            if (!validateEmail()) {
              logger.debug('[USR-001] Reset aborted: validation failed');
              return;
            }
            setShowConfirmDialog(true);
          }}
          loading={loading}
          disabled={loading}
        />

        <ShSpacer size={spacing.xl} />

        {/* Back to Sign In Link */}
        <ShButton
          title="Back to Sign In"
          variant={ShButtonVariant.Secondary}
          onPress={handleBackToSignIn}
        />

        <ShSpacer size={spacing.xxl} />

        {/* Need Help? Section */}
        <View style={{ alignItems: 'center' }}>
          <ShText variant={ShTextVariant.Body} color={colorPalette.textMid}>
            Need Help?
          </ShText>
          <ShSpacer size={spacing.xxl} />
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.lg,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                logger.log('[USR-001] User tapped Contact Support');
                router.push(Routes.Support);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShIcon
                  name={IconName.Mail}
                  size={16}
                  color={colorPalette.primaryGold}
                />
                <ShText
                  variant={ShTextVariant.Body}
                  color={colorPalette.primaryGold}
                  style={{ marginLeft: spacing.xs }}
                >
                  Contact Support
                </ShText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <ShConfirmDialog
        visible={showConfirmDialog}
        title="Forgot Password"
        message="We will send a password reset link to your email. Do you want to continue?"
        cancelText="Cancel"
        confirmText="Continue"
        onCancel={handleCancelModal}
        onConfirm={handleResetPassword}
      />
    </SafeAreaView>
  );
}
