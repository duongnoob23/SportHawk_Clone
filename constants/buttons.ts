import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { typographyStyles } from '@con/typography';

export enum ShButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Error = 'error',
  WelcomePrimary = 'welcomePrimary',
  WelcomeSecondary = 'welcomeSecondary',
  Link = 'link',
}

export const buttonStyles = {
  primary: {
    default: {
      ...typographyStyles.button,
      backgroundColor: colorPalette.primaryGold,
      color: colorPalette.baseDark,
      borderRadius: spacing.buttonBorderRadius,
      height: spacing.buttonHeight,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabled: {
      ...typographyStyles.button,
      backgroundColor: colorPalette.surface,
      color: colorPalette.textSecondary,
      borderRadius: spacing.buttonBorderRadius,
      height: spacing.buttonHeight,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  secondary: {
    default: {
      ...typographyStyles.button,
      backgroundColor: colorPalette.black,
      color: colorPalette.textLight,
      borderRadius: spacing.buttonBorderRadius,
      borderWidth: spacing.borderWidthThin,
      borderColor: colorPalette.borderColor,
      height: spacing.buttonHeight,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabled: {
      ...typographyStyles.button,
      backgroundColor: 'transparent',
      color: colorPalette.textSecondary,
      borderRadius: spacing.buttonBorderRadius,
      borderWidth: spacing.borderWidthThin,
      borderColor: colorPalette.borderColor,
      height: spacing.buttonHeight,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  tertiary: {
    default: {
      ...typographyStyles.button,
      backgroundColor: colorPalette.surface,
      color: colorPalette.textLight,
      borderRadius: spacing.buttonBorderRadius,
      height: spacing.buttonHeight,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabled: {
      ...typographyStyles.button,
      backgroundColor: colorPalette.backgroundTertiary,
      color: colorPalette.textSecondary,
      borderRadius: spacing.buttonBorderRadius,
      height: spacing.buttonHeight,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  error: {
    default: {
      ...typographyStyles.button,
      backgroundColor: colorPalette.errorButtonBg,
      color: colorPalette.error,
      borderRadius: spacing.buttonBorderRadius,
      height: spacing.buttonHeight,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabled: {
      ...typographyStyles.button,
      backgroundColor: colorPalette.backgroundTertiary,
      color: colorPalette.textSecondary,
      borderRadius: spacing.buttonBorderRadius,
      height: spacing.buttonHeight,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  welcomePrimary: {
    default: {
      width: '100%',
      height: spacing.buttonHeightLarge,
    },
    disabled: {
      width: '100%',
      height: spacing.buttonHeightLarge,
    },
  },
  welcomeSecondary: {
    default: {
      width: '100%',
      height: spacing.buttonHeightLarge,
      marginTop: spacing.lg,
    },
    disabled: {
      width: '100%',
      height: spacing.buttonHeightLarge,
      marginTop: spacing.lg,
    },
  },
};
