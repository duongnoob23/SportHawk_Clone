import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontSizes } from '@con/typography';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    // paddingVertical: spacing.md,
    paddingTop:spacing.md,
    gap: spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorPalette.backgroundListItem,
    borderRadius: spacing.borderRadiusLarge,
    paddingHorizontal: spacing.lg,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colorPalette.lightText,
    paddingVertical: 0,
  },
  loadingIndicator: {
    marginLeft: spacing.sm,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: colorPalette.backgroundListItem,
    borderRadius: spacing.borderRadiusLarge,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
