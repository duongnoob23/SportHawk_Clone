import { StyleSheet } from 'react-native';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontSizes } from '@con/typography';

export const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: spacing.fabButtonBottom,
    alignSelf: 'center',
    width: 'auto',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.fabButtonSize / 2,
    backgroundColor: colorPalette.baseDark,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colorPalette.black,
    shadowOffset: {
      width: 0,
      height: spacing.fabButtonShadowOffsetHeight,
    },
    shadowOpacity: spacing.fabButtonShadowOpacity,
    shadowRadius: spacing.fabButtonShadowRadius,
    elevation: spacing.fabButtonShadowElevation,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    color: colorPalette.textLight,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
