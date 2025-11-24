import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
  },
  teamsList: {
    gap: spacing.sectionListGap,
  },
  emptyContainer: {
    paddingVertical: spacing.emptyStatePaddingVertical,
    alignItems: 'center',
  },
  viewAllButton: {
    backgroundColor: colorPalette.primaryGold,
    paddingVertical: spacing.buttonPaddingVertical,
    paddingHorizontal: spacing.buttonPaddingHorizontal,
    borderRadius: spacing.borderRadiusSmall,
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
