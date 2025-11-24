import { StyleSheet } from 'react-native';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    gap: spacing.gridGap,
  },
  button: {
    width: spacing.adminButtonWidth,
    height: spacing.adminButtonHeight,
    backgroundColor: colorPalette.backgroundListItem,
    borderWidth: 1,
    borderColor: colorPalette.borderAdminButton,
    borderRadius: spacing.adminButtonBorderRadius,
    alignItems: 'center',
    position: 'relative',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    position: 'absolute',
    top: spacing.adminButtonIconTop,
    alignItems: 'center',
  },
  label: {
    position: 'absolute',
    top: spacing.adminButtonTextTop,
    fontSize: spacing.adminButtonTextSize,
    color: colorPalette.lightText,
  },
  labelDisabled: {
    color: colorPalette.textSecondary,
  },
});
