import {
  ShIcon,
  ShScreenContainer,
  ShScreenHeader,
  ShSpacer,
  ShText,
} from '@cmp/index';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { IconName } from '@top/constants/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const handleBack = () => {};
  const handleToggleDropdown = () => {};
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colorPalette.baseDark,
        paddingBottom: insets.bottom,
      }}
    >
      <ShScreenHeader
        title="Alerts"
        showBorder={true}
        notShowLeft={true}
        rightAction={{
          type: 'icon',
          iconName: IconName.Edit,
          onPress: handleToggleDropdown,
        }}
      />
      <ShScreenContainer>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View style={styles.emptyTabContent}>
            <ShIcon
              name={IconName.Bell}
              size={spacing.iconSizeXLarge}
              color={colorPalette.primaryGold}
            />
            <ShSpacer size={spacing.lg} />
            <ShText
              variant={ShTextVariant.Subheading}
              style={styles.centerText}
            >
              You don’t have any alerts
            </ShText>
            <ShSpacer size={spacing.md} />
            <ShText variant={ShTextVariant.Body} style={styles.centerText}>
              Enable notifications to make sure
            </ShText>
            <ShText variant={ShTextVariant.Body} style={styles.centerText}>
              you stay up to date with activity
            </ShText>
          </View>
        </View>
      </ShScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colorPalette.stoneGrey,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderColor,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    marginLeft: spacing.lg,
    color: colorPalette.textLight,
  },
  signOutContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  signOutButton: {
    borderColor: colorPalette.error,
  },
  emptyTabContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.emptyStateVerticalPadding,
  },
  centerText: {
    textAlign: 'center',
  },
});
