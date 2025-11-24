import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ShText, ShButton, ShIcon } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { IconName } from '@con/icons';

export default function PaymentSuccessScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/(app)/teams');
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ShIcon
          name={IconName.Check}
          size={spacing.iconSizeLarge}
          color={colorPalette.success}
        />

        <ShText variant={ShTextVariant.Heading} style={styles.title}>
          Success!
        </ShText>

        <ShText variant={ShTextVariant.Body} style={styles.message}>
          Payment request sent to team members
        </ShText>

        <ShButton
          title="Done"
          onPress={() => router.replace('/(app)/teams')}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPalette.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colorPalette.textSecondary,
  },
  button: {
    marginTop: spacing.xl,
    minWidth: 150,
  },
});
