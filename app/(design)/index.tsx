import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { colorPalette } from '@con/colors';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShButtonVariant } from '@con/buttons';

import { ShText, ShButton } from '@top/components';

export default function DesignScreen() {
  const router = useRouter();

  const handleColors = () => {
    router.push(Routes.DesignColors);
  };

  const handleText = () => {
    router.push(Routes.DesignTypography);
  };

  const handleButtons = () => {
    router.push(Routes.DesignButtons);
  };

  const handleIcons = () => {
    router.push(Routes.DesignIcons);
  };

  const handleGoBack = () => {
    router.push(Routes.Home);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ShButton
          title="← Go Back"
          variant={ShButtonVariant.Link}
          onPress={handleGoBack}
          style={styles.homeButton}
        />

        <ShText variant={ShTextVariant.Display} style={styles.mainTitle}>
          Design System
        </ShText>

        <ShButton
          title="Colours"
          variant={ShButtonVariant.Primary}
          onPress={handleColors}
          style={styles.homeButton}
        />

        <ShButton
          title="Text"
          variant={ShButtonVariant.Primary}
          onPress={handleText}
          style={styles.homeButton}
        />

        <ShButton
          title="Buttons"
          variant={ShButtonVariant.Primary}
          onPress={handleButtons}
          style={styles.homeButton}
        />

        <ShButton
          title="Icons"
          variant={ShButtonVariant.Primary}
          onPress={handleIcons}
          style={styles.homeButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  container: {
    padding: spacing.screenPadding,
  },
  homeButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  mainTitle: {
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  buttonRow: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colorPalette.surface,
  },
  buttonLabel: {
    color: colorPalette.textMid,
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
