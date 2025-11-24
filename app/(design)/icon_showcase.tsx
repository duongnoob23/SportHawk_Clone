// src/screens/IconShowcaseScreen.tsx
import React from 'react';
import { SafeAreaView, View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { spacing } from '@con/spacing';
import { Routes } from '@con/routes';
import { colorPalette } from '@con/colors';
import { IconName, iconMap } from '@con/icons';
import { ShTextVariant } from '@con/typography';
import { ShButtonVariant } from '@con/buttons';

import { ShText, ShIcon, ShButton } from '@top/components';

export default function IconShowcaseScreen() {
  const router = useRouter();
  const allIcons = Object.values(IconName);

  const handleGoBack = () => {
    router.push(Routes.DesignSystem);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ShButton
        title="← Go Back"
        variant={ShButtonVariant.Link}
        onPress={handleGoBack}
        style={styles.homeButton}
      />

      <ShText variant={ShTextVariant.Display} style={styles.mainTitle}>
        Icons
      </ShText>

      <FlatList
        data={allIcons}
        keyExtractor={item => item}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <ShText variant={ShTextVariant.Heading}>Available Icons</ShText>
        }
        renderItem={({ item }) => (
          <View style={styles.iconWrapper}>
            <ShIcon
              name={item}
              size={spacing.avatarSizeMedium}
              color={colorPalette.textLight}
            />
            <ShText variant={ShTextVariant.Small}>{item}</ShText>
            <ShText variant={ShTextVariant.Caption}>
              ({iconMap[item].filename})
            </ShText>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  listContainer: { paddingHorizontal: spacing.sm },
  iconWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    margin: spacing.xs,
    backgroundColor: colorPalette.baseDark,
    borderRadius: spacing.borderRadiusMedium,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.textMid,
  },
});
