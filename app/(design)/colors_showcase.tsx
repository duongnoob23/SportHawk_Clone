import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Clipboard,
  Text,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colorPalette, ColorName } from '@con/colors';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShButtonVariant } from '@con/buttons';

import { ShText, ShButton } from '@top/components';

const ColorSwatch = ({ name, hex }: { name: ColorName; hex: string }) => {
  const onCopyToClipboard = () => {
    Clipboard.setString(hex);
    Alert.alert('Copied!', `${hex} has been copied to the clipboard.`);
  };

  return (
    <View style={styles.colorRow}>
      <View style={[styles.swatch, { backgroundColor: hex }]} />
      <View>
        <ShText variant={ShTextVariant.Body} color={colorPalette.textLight}>
          {name}
        </ShText>
        <Text style={styles.hexText} onPress={onCopyToClipboard}>
          {hex} (tap to copy)
        </Text>
      </View>
    </View>
  );
};

export default function ColorShowcaseScreen() {
  const router = useRouter();
  const colorNames = Object.keys(colorPalette) as ColorName[];

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
          Color Palette
        </ShText>
        {colorNames.map(name => (
          <ColorSwatch key={name} name={name} hex={colorPalette[name]} />
        ))}
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
  },
  mainTitle: {
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadiusMedium,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colorPalette.surface,
  },
  hexText: {
    color: colorPalette.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
