import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { ShText, ShSpacer, ShIcon } from '@cmp/index';
import { spacing } from '@con/spacing';
import { colorPalette } from '@con/colors';
import { ShTextVariant } from '@con/typography';
import { IconName } from '@con/icons';

export default function TeamAdminSettingsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colorPalette.baseDark,
          },
          headerTintColor: colorPalette.textLight,
          headerTitle: 'Team Settings',
        }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.content}>
            <ShIcon
              name={IconName.Settings}
              size={spacing.iconSizeXLarge}
              color={colorPalette.primaryGold}
            />

            <ShSpacer size={spacing.lg} />

            <ShText variant={ShTextVariant.Heading} style={styles.title}>
              Team Settings
            </ShText>

            <ShSpacer size={spacing.md} />

            <ShText variant={ShTextVariant.Body} style={styles.subtitle}>
              Configure team details,
            </ShText>
            <ShText variant={ShTextVariant.Body} style={styles.subtitle}>
              preferences, and settings
            </ShText>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: colorPalette.white,
    textAlign: 'center',
  },
  subtitle: {
    color: colorPalette.textMid,
    textAlign: 'center',
  },
});
