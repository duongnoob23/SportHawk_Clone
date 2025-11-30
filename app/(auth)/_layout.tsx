import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontSizes, fontWeights } from '@con/typography';
import { useUser } from '@hks/useUser';
import { ShIcon } from '@top/components';
import { IconName } from '@top/constants/icons';
import { router, Stack, useSegments } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export default function AuthLayout() {
  const { user, authChecked } = useUser();
  const segments = useSegments();

  // Show loading while checking auth status
  // if (!authChecked) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         backgroundColor: colorPalette.baseDark,
  //       }}
  //     >
  //       <ActivityIndicator size="large" color={colorPalette.primaryGold} />
  //       <ShText
  //         variant={ShTextVariant.Body}
  //         style={{
  //           marginTop: spacing.md,
  //           color: colorPalette.textMid,
  //         }}
  //       >
  //         Loading...
  //       </ShText>
  //     </View>
  //   );
  // }

  // Get current route to check if user is on password reset flow
  const currentRoute = segments[segments.length - 1];

  // Allow access to ForgotPassword and ResetPassword for all users
  const isPasswordResetFlow =
    currentRoute === 'ForgotPassword' || currentRoute === 'ResetPassword';

  // if (!isPasswordResetFlow) {
  //   if (user && user.email_confirmed_at) {
  //     return <Redirect href={Routes.Home} />;
  //   }

  //   if (user && !user.email_confirmed_at) {
  //     return <Redirect href={Routes.VerifyEmail} />;
  //   }
  // }

  // Show auth screens for non-authenticated users
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colorPalette.baseDark,
        },
        headerTintColor: colorPalette.textLight,
        headerTitleStyle: {
          fontFamily: 'System',
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.semiBold,
        },
        headerBackTitle: 'Back',
        animation: 'slide_from_right',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ paddingLeft: spacing.md }}
          ></TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="SignIn"
        options={{
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ShIcon
                name={IconName.ArrowLeft}
                size={spacing.xxxl}
                color={colorPalette.lightText}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="SignUp"
        options={{
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ShIcon
                name={IconName.ArrowLeft}
                size={spacing.xxxl}
                color={colorPalette.lightText}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="VerifyEmail"
        options={{
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ShIcon
                name={IconName.ArrowLeft}
                size={spacing.xxxl}
                color={colorPalette.lightText}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        options={{
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ShIcon
                name={IconName.ArrowLeft}
                size={spacing.xxxl}
                color={colorPalette.lightText}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        options={{
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ShIcon
                name={IconName.ArrowLeft}
                size={spacing.xxxl}
                color={colorPalette.lightText}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="SignOut"
        options={{
          title: 'Sign Out',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
