import { useUser } from '@hks/useUser';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { fontWeights, ShTextVariant } from '@con/typography';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  ShButton,
  ShFormFieldEmail,
  ShFormFieldPassword,
  ShLogoAndTitle,
  ShSpacer,
  ShText,
} from '@top/components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function SignIn() {
  const router = useRouter();
  const { userSignIn, loading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const insets = useSafeAreaInsets();

  const handleForgotPassword = () => {
    router.push(Routes.ForgotPassword);
  };

  const handleSignUp = () => {
    router.push(Routes.SignUp);
    // router.push(Routes.ResetPassword);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      const result = await userSignIn(email, password);

      if (!result.success) {
        Alert.alert(
          'Sign In Failed',
          result.message || 'Please check your credentials and try again.'
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Please check your credentials and try again.';
      Alert.alert('Sign In Failed', message);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorPalette.baseDark,
      }}
    >
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bottomOffset={insets.bottom}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + spacing.xxl,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and Title Section */}
        <View
          style={{
            alignItems: 'center',
            paddingBottom: spacing.xl,
            marginBottom: spacing.xxxl,
          }}
        >
          <View
            style={{
              width: spacing.authLogoSize,
              height: spacing.authLogoSize,
              backgroundColor: colorPalette.baseDark,
              borderRadius: spacing.borderRadiusXl,
              borderWidth: spacing.listSeparator,
              borderColor: colorPalette.borderSubtle,
              justifyContent: 'center',
              alignItems: 'center',
              padding: spacing.md,
            }}
          >
            <ShLogoAndTitle variant="xs" showTitle={false} />
          </View>
          <ShSpacer size={spacing.lg} />

          <ShText
            variant={ShTextVariant.Heading}
            style={{
              fontSize: spacing.xxl,
              fontWeight: fontWeights.semiBold,
            }}
          >
            Sign In
          </ShText>
          <ShSpacer size={spacing.lg} />

          <View>
            <ShText
              variant={ShTextVariant.Body}
              style={{
                fontSize: spacing.lg,
                fontWeight: fontWeights.regular,
              }}
            >
              Sign in to manage your sports activities
            </ShText>
          </View>
        </View>

        <ShSpacer size={spacing.xxl} />

        {/* Form Fields */}
        <ShFormFieldEmail
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />
        <ShSpacer size={spacing.xs} />

        <ShFormFieldPassword
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={{
            alignSelf: 'flex-end',
            marginTop: spacing.sm,
          }}
        >
          <ShText
            variant={ShTextVariant.Label}
            color={colorPalette.primaryGold}
          >
            Forgot Password?
          </ShText>
        </TouchableOpacity>

        <ShSpacer size={spacing.xxxl} />

        {/* Sign In Button */}
        <ShButton
          title="Sign In"
          variant={ShButtonVariant.Primary}
          onPress={handleSignIn}
          loading={loading}
          disabled={loading}
        />

        <ShSpacer size={spacing.xl} />

        {/* Sign Up Link */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.xxxl,
          }}
        >
          <ShText variant={ShTextVariant.Body} color={colorPalette.stoneGrey}>
            Don&apos;t have an account?{' '}
          </ShText>
          <TouchableOpacity onPress={handleSignUp}>
            <ShText
              variant={ShTextVariant.Body}
              color={colorPalette.primaryGold}
            >
              Sign Up
            </ShText>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
