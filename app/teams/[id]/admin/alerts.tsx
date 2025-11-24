import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { ShText, ShSpacer, ShIcon } from '@cmp/index';
import { spacing } from '@con/spacing';
import { colorPalette } from '@con/colors';
import { ShTextVariant } from '@con/typography';
import { IconName } from '@con/icons';

export default function TeamAdminAlertsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colorPalette.baseDark,
          },
          headerTintColor: colorPalette.textLight,
          headerTitle: 'Manage Alerts',
        }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.content}>
            <ShIcon
              name={IconName.Bell}
              size={spacing.iconSizeXLarge}
              color={colorPalette.primaryGold}
            />

            <ShSpacer size={spacing.lg} />

            <ShText variant={ShTextVariant.Heading} style={styles.title}>
              Manage Alerts
            </ShText>

            <ShSpacer size={spacing.md} />

            <ShText variant={ShTextVariant.Body} style={styles.subtitle}>
              Send notifications and alerts
            </ShText>
            <ShText variant={ShTextVariant.Body} style={styles.subtitle}>
              to team members
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
