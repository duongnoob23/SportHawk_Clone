import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ShScreenContainer, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant, fontWeights, fontSizes } from '@con/typography';

export default function PlaceholderScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Invitations',
          headerStyle: {
            backgroundColor: colorPalette.baseDark,
          },
          headerTintColor: colorPalette.textLight,
          headerTitleStyle: {
            fontWeight: fontWeights.medium,
            fontSize: fontSizes.lg,
          },
        }}
      />
      <ShScreenContainer>
        <View style={styles.container}>
          <ShText variant={ShTextVariant.Display} style={styles.title}>
            Coming Soon
          </ShText>
          <ShText variant={ShTextVariant.Body} style={styles.description}>
            This feature is currently under development.
          </ShText>
        </View>
      </ShScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    color: colorPalette.textLight,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  description: {
    color: colorPalette.textSecondary,
    textAlign: 'center',
  },
});
