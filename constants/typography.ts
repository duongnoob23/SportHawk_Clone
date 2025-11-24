import { colorPalette } from './colors';

/**
 * Font weight constants for consistent typography
 */
export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
} as const;

/**
 * Font size constants for consistent typography
 */
export const fontSizes = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 17, // iOS system font size
  lg2: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/**
 * Line height constants for consistent typography
 */
export const lineHeights = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  display: 40,
} as const;

/**
 * An enum of named constants for each text variant.
 * This has been extended to include all styles from your design system.
 */
export enum ShTextVariant {
  Display = 'display',
  Heading = 'heading',
  Subheading = 'subheading',
  SubheadingTitle = 'subheadingTitle',
  SectionTitle = 'sectionTitle',
  Label = 'label',
  LabelLight = 'labelLight',
  LabelSecondary = 'labelSecondary',
  Body = 'body', // should be same as "Body Text" in Figma
  BodySmall = 'bodySmall', // should be same as "Body Text" in Figma
  BodyLight = 'bodyLight',
  BodySecondary = 'bodySecondary',
  Button = 'button',
  Small = 'small',
  SmallX = 'smallx',
  Caption = 'caption',
  CaptionItalic = 'captionItalic',
  ClubName = 'clubName',
  LocationText = 'locationText',
  EmptyState = 'emptyState',
  ErrorText = 'errorText',
  ProfileValue = 'profileValue',
  CenterTitle = 'centerTitle',
  CenterSubtitle = 'centerSubtitle',
  CenterEmail = 'centerEmail',
  TabText = 'tabText',
  Total = 'total',
  Amount = 'amount',
  Selected = 'selected',
  SmallText = 'smallText',
}

/**
 * The application's complete, centralized typography system.
 * It has been updated with the styles from your `text.ts` file.
 */

/*
  Google Gemini formula: letterSpacing = fontSize * (figmaPercentage / 100)
  https://gemini.google.com/app/b340e75c8a77d75b
*/

export const typographyStyles = {
  bodySmall: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20, // đề xuất để tránh crop
    color: colorPalette.textMid,
  },

  display: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 32,
    letterSpacing: -0.16, // Figma -0.5% LS
    fontWeight: '700' as const,
    color: colorPalette.textLight,
  },
  heading: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 24,
    letterSpacing: -0.072, // Figma -0.3% LS
    fontWeight: '600' as const,
    color: colorPalette.textLight,
  },
  subheading: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 20,
    fontWeight: '500' as const,
    letterSpacing: -0.04, // Figma -0.2%
    color: colorPalette.textLight,
  },
  subheadingTitle: {
    fontFamily: 'Inter',
    fontStyle: 'medium' as const,
    fontSize: 20,
    fontWeight: '500' as const,
    letterSpacing: -0.04, // Figma -0.2%
    color: colorPalette.textLight,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 20,
    letterSpacing: -0.04, // Figma -0.2%
    fontWeight: '500' as const,
    color: colorPalette.textLight,
  },

  smallText: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.06,
    color: colorPalette.textThird,
  },

  label: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 14,
    fontWeight: '400' as const,
    color: colorPalette.lightText, // Changed from textMid to match Figma #eceae8
  },
  labelLight: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 14,
    fontWeight: '400' as const,
    color: colorPalette.stoneGrey,
  },
  body: {
    // should be same as "Body Text" in Figma:
    // Inter, 400, regular, 16px, 100% line height, 0% adjustment of letter spacing, horiz: center
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 16,
    fontWeight: '400' as const,
    color: colorPalette.textMid,
  },
  bodyLight: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 16,
    fontWeight: '400' as const,
    color: colorPalette.textLight,
  },
  link: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontWeight: '400' as const,
    color: colorPalette.primaryGold,
  },
  button: {
    // doesn't exist in Figma Design System,
    // buttons SHOULD use "Body"
    // TODO: undo temporary use of "button" and later move to "body"
    // Inter, 400, regular, 16px, 100% line height, 0% adjustment of letter spacing, horiz: center
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 16,
    fontWeight: '400' as const,
    textAlign: 'center',
    // Note: Color is defined in the button style itself.
  },
  small: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 12,
    fontWeight: '400' as const,
    color: colorPalette.textMid,
  },
  smallx: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 14,
    fontWeight: '400' as const,
    color: colorPalette.textMid,
  },
  caption: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: 12,
    letterSpacing: 0.06, // Figma +0.5%
    fontWeight: '500' as const,
    color: colorPalette.textSecondary,
  },
  captionItalic: {
    fontFamily: 'Inter',
    fontStyle: 'italic' as const,
    fontSize: 12,
    letterSpacing: 0.06, // Figma +0.5%
    fontWeight: '400' as const,
    color: colorPalette.textSecondary,
  },
  clubName: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.medium,
    color: colorPalette.textLight,
  },
  locationText: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colorPalette.stoneGrey,
  },
  emptyState: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colorPalette.stoneGrey,
  },
  errorText: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    color: colorPalette.primaryGold,
  },
  profileValue: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colorPalette.textLight,
  },
  labelSecondary: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colorPalette.textSecondary,
  },
  bodySecondary: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colorPalette.textSecondary,
  },
  centerTitle: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    textAlign: 'center' as const,
    color: colorPalette.textLight,
  },
  centerSubtitle: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    textAlign: 'center' as const,
    color: colorPalette.textMid,
  },
  centerEmail: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    textAlign: 'center' as const,
    color: colorPalette.textSecondary,
  },
  tabText: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.sm, // 14px - smaller to fit in tabs
    fontWeight: fontWeights.regular,
    letterSpacing: -0.2, // Tighter letter spacing to fit text
    color: colorPalette.stoneGrey,
  },
  total: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.lg2, // 18px
    fontWeight: fontWeights.regular,
    color: colorPalette.textLight,
  },
  amount: {
    fontFamily: 'Inter',
    fontStyle: 'normal' as const,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.regular,
    color: colorPalette.textLight,
  },
} as const;
