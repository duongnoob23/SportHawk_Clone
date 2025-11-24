import { Routes } from '@con/routes';
import { useUser } from '@hks/useUser';
import { router, Redirect } from 'expo-router';
import React from 'react';

import {
  ShButton,
  ShScreenContainer,
  ShSpacer,
  ShText,
  ShWelcomeContentWrapper,
  ShWelcomeLogo,
  ShWelcomeVideo,
} from '@top/components';

import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const { user, authChecked } = useUser();
  const insets = useSafeAreaInsets();

  if (!authChecked) {
    return (
      <ShScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
        </View>
      </ShScreenContainer>
    );
  }

  if (user) {
    return <Redirect href={Routes.Home} />;
  }

  const handleGetStarted = () => {
    router.push(Routes.SignUp);
  };

  const handleAlreadyHaveAccount = () => {
    router.push(Routes.SignIn);
  };

  return (
    <ShScreenContainer>
      <ShWelcomeVideo />
      <View
        style={{
          backgroundColor: colorPalette.baseDark,
          position: 'absolute',
          bottom: spacing.buttonHeightLarge,
          left: 0,
          right: 0,
          marginBottom: insets.bottom,
        }}
      >
        <ShWelcomeContentWrapper>
          <ShWelcomeLogo />

          <ShSpacer size={spacing.welcomeLogoMargin} />

          <ShText variant={ShTextVariant.Body} color={colorPalette.textMid}>
            Bringing people together through the
          </ShText>
          <ShSpacer size={spacing.xs} />
          <ShText variant={ShTextVariant.Body} color={colorPalette.textMid}>
            power of sport.
          </ShText>

          <ShSpacer size={spacing.welcomeContentGap} />

          <ShButton
            title="Get Started"
            variant={ShButtonVariant.Primary}
            onPress={handleGetStarted}
          />

          <ShSpacer size={spacing.lg} />

          <ShButton
            title="I already have an account"
            variant={ShButtonVariant.Secondary}
            onPress={handleAlreadyHaveAccount}
          />

          <ShSpacer size={spacing.lg} />
        </ShWelcomeContentWrapper>
      </View>
    </ShScreenContainer>
  );
}
