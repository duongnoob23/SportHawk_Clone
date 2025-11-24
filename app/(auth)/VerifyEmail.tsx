import { appValues } from '@con/app-values';
import { useUser } from '@hks/useUser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant, fontWeights } from '@con/typography';

import {
  ShButton,
  ShIcon,
  ShOTPInput,
  ShSpacer,
  ShText,
} from '@top/components';

export default function VerifyEmail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userVerify, userResendVerification, loading } = useUser();

  // Get email from params or use placeholder
  const email = (params.email as string) || 'email@example.com';

  // OTP state
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(appValues.resendTimerSeconds);
  const [canResend, setCanResend] = useState(false);

  // Timer for resend functionality
  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const handleVerify = async (code: string) => {
    console.log('run');

    if (code.length !== appValues.otpCodeLength) {
      Alert.alert(
        'Invalid Code',
        `Please enter all ${appValues.otpCodeLength} digits of the verification code.`
      );
      return;
    }

    setOtp(code);

    try {
      await userVerify(email, code);
      // After successful verification, navigate to Home
    } catch (error: any) {
      Alert.alert(
        'Verification Failed',
        error.message || 'Invalid verification code. Please try again.'
      );
      // Clear OTP on error
      setOtp('');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      // Reset timer
      setResendTimer(appValues.resendTimerSeconds);
      setCanResend(false);

      // Resend verification email
      await userResendVerification(email);

      Alert.alert(
        'Code Resent',
        `A new verification code has been sent to ${email}`
      );
    } catch (error: any) {
      // Reset the timer state on error
      setCanResend(true);
      setResendTimer(0);

      Alert.alert(
        'Resend Failed',
        error.message || 'Failed to resend verification code. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
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
            <ShSpacer size={spacing.xxl}></ShSpacer>
            <View
              style={{
                width: spacing.logoSize,
                height: spacing.logoSize,
                backgroundColor: colorPalette.primaryBlack,
                borderRadius: spacing.borderRadiusLarge,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ShIcon
                name={IconName.VerifyEmail}
                size={spacing.xxxl}
                color={colorPalette.primaryGold}
              />
            </View>

            <ShSpacer size={spacing.lg} />

            <ShText
              variant={ShTextVariant.Heading}
              style={{
                fontSize: spacing.xxl,
                fontWeight: fontWeights.semiBold,
              }}
            >
              Verify Your Email
            </ShText>

            <ShSpacer size={spacing.lg} />

            <ShText
              variant={ShTextVariant.Body}
              style={{
                textAlign: 'center',
                fontSize: spacing.lg,
                fontWeight: fontWeights.regular,
              }}
            >
              We&apos;ve sent a verification code to{'\n'}your email address
            </ShText>
          </View>
          <ShSpacer size={spacing.lg} />

          {/* Email Display */}
          <View
            style={{
              alignItems: 'center',
              gap: spacing.xs,
            }}
          >
            <ShText
              variant={ShTextVariant.Body}
              style={{
                fontWeight: fontWeights.medium,
                color: colorPalette.textLight,
              }}
            >
              {email}
            </ShText>
          </View>

          <ShSpacer size={spacing.xxl} />

          {/* OTP Input */}
          <ShOTPInput
            length={appValues.otpCodeLength}
            onComplete={handleVerify}
            value={otp ? otp.split('') : undefined}
          />

          <ShSpacer size={spacing.xxl} />

          {/* Verify Button */}
          <TouchableOpacity
            style={{ marginHorizontal: spacing.sm }}
            onPress={() => handleVerify(otp)}
          >
            <ShButton
              style={{
                backgroundColor: colorPalette.primaryGold,
                // marginHorizontal: spacing.sm,
              }}
              title="Verify Email"
              variant={ShButtonVariant.Primary}
              loading={loading}
              disabled={loading || otp.length !== appValues.otpCodeLength}
              textStyle={{ color: colorPalette.baseDark }}
            />
          </TouchableOpacity>

          <ShSpacer size={spacing.xl} />

          {/* Resend Section */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ShText
              variant={ShTextVariant.Body}
              color={colorPalette.stoneGrey}
              style={{ fontSize: spacing.lg, color: colorPalette.textThird }}
            >
              Didn&apos;t receive the code?{' '}
            </ShText>
            <TouchableOpacity onPress={handleResend} disabled={!canResend}>
              <ShText
                variant={ShTextVariant.Body}
                style={{
                  fontSize: spacing.lg,
                  fontWeight: fontWeights.regular,
                }}
                color={
                  canResend
                    ? colorPalette.primaryGold
                    : colorPalette.textSecondary
                }
              >
                Resend
              </ShText>
            </TouchableOpacity>
          </View>

          <ShSpacer size={spacing.lg} />

          {!canResend && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ShText
                variant={ShTextVariant.Small}
                style={{
                  textAlign: 'center',
                  color: colorPalette.textThird,
                  fontSize: spacing.mdx,
                }}
              >
                You can resend code in{' '}
              </ShText>
              <TouchableOpacity>
                <ShText
                  variant={ShTextVariant.Body}
                  color={
                    canResend
                      ? colorPalette.primaryGold
                      : colorPalette.primaryGold
                  }
                >
                  {resendTimer} seconds
                </ShText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
