import React from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { colorPalette } from '@con/colors';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShButtonVariant } from '@con/buttons';

import { ShText, ShButton } from '@top/components';

/*
const ButtonRow = ({ variant }: { variant: ShButtonVariant }) => (
  <View style={styles.buttonRow}>
    <ShText variant={ShTextVariant.Label} style={styles.buttonLabel}>
      {Object.keys(ShButtonVariant).find(key => ShButtonVariant[key as keyof typeof ShButtonVariant] === variant)}
    </ShText>
    <View style={styles.buttonsContainer}>
      <ShButton title="Enabled" variant={variant} />
      <View style={{ width: spacing.lg }} />
      <ShButton title="Disabled" variant={variant} disabled={true} />
    </View>
  </View>
);
*/

export default function ButtonShowcaseScreen() {
  const router = useRouter();
  /*
  const buttonVariants = Object.values(ShButtonVariant).filter(
    v => typeof v === 'string'
  ) as ShButtonVariant[];
*/
  const handleGoBack = () => {
    router.push(Routes.DesignSystem);
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
          Button Variants
        </ShText>

        {/* Primary Button */}
        <View style={styles.buttonGroup}>
          <ShText variant={ShTextVariant.Label} style={styles.buttonLabel}>
            Primary
          </ShText>
          <ShButton title="Primary" variant={ShButtonVariant.Primary} />
        </View>

        {/* Secondary Button */}
        <View style={styles.buttonGroup}>
          <ShText variant={ShTextVariant.Label} style={styles.buttonLabel}>
            Secondary
          </ShText>
          <ShButton title="Secondary" variant={ShButtonVariant.Secondary} />
        </View>

        {/* Tertiary Button */}
        <View style={styles.buttonGroup}>
          <ShText variant={ShTextVariant.Label} style={styles.buttonLabel}>
            Tertiary
          </ShText>
          <ShButton title="Tertiary" variant={ShButtonVariant.Tertiary} />
        </View>
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
