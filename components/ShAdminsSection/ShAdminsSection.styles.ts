import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
  },
  emptyContainer: {
    paddingVertical: spacing.emptyStatePaddingVertical,
    alignItems: 'center',
  },
  adminsList: {
    gap: spacing.md,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colorPalette.backgroundListItem,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusXl,
    borderWidth: spacing.borderWidthThin,
    padding: spacing.containerPaddingListItem,
    height: spacing.heightListItem,
    
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  adminAvatar: {
    width: spacing.avatarSizeSmall,
    height: spacing.avatarSizeSmall,
    borderRadius: spacing.avatarSizeSmall / 2,
  },
  avatarPlaceholder: {
    width: spacing.avatarSizeSmall,
    height: spacing.avatarSizeSmall,
    borderRadius: spacing.avatarSizeSmall / 2,
    backgroundColor: colorPalette.backgroundListItem,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  adminBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
