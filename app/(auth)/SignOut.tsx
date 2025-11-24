import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Routes } from '@con/routes';

import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShButtonVariant } from '@con/buttons';

import { ShText, ShButton, ShSpacer } from '@top/components';

export default function SignOut() {
  const router = useRouter();

  const handleDesign = () => {
    router.push(Routes.DesignSystem);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
      <ScrollView contentContainerStyle={{ padding: spacing.screenPadding }}>
        <ShText variant={ShTextVariant.Display} style={{ textAlign: 'center' }}>
          Sign Out
        </ShText>

        <ShSpacer size={spacing.xxl} />

        <ShButton
          title="Design System"
          variant={ShButtonVariant.Primary}
          onPress={handleDesign}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
