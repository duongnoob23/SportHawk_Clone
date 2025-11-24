import { ShScreenContainer, ShScreenHeader, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { IconName } from '@top/constants/icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function PlaceholderScreen() {
  return (
    <>
      <ShScreenHeader
        title="Help & Feedback"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: () => router.back(),
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
