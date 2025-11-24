import React from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { colorPalette } from '@con/colors';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShButtonVariant } from '@con/buttons';

import { ShText, ShButton } from '@top/components';

export default function TypographyShowcaseScreen() {
  const router = useRouter();
  const variantKeys = Object.keys(
    ShTextVariant
  ) as (keyof typeof ShTextVariant)[];

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
        <ShText variant={ShTextVariant.Heading} style={styles.title}>
          Typography
        </ShText>
        {variantKeys.map(key => (
          <View key={key} style={styles.row}>
            <ShText variant={ShTextVariant[key]}>{key}</ShText>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colorPalette.showcaseSafeArea },
  container: { padding: spacing.screenPadding },
  title: {
    marginBottom: spacing.xxl,
    color: colorPalette.textMid,
  },
  row: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colorPalette.showcaseBottomBorder,
  },
});
