import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './colors';
const { width } = Dimensions.get('window');

export const globalStyles = StyleSheet.create({
  // Layout styles
  container: {
    flex: 1,
    backgroundColor: colors.base, // Dark Charcoal background
  },
  scrollViewContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 72, // Add 72px of padding at the bottom for scrolling
  },
  headerContainer: {
    alignItems: 'center',
    gap: 16,
  },
  formContainer: {
    gap: 16,
  },

  // Social buttons styles
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the single button
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18, // Adjusted padding for 56px height
    backgroundColor: colors.base, // Match background for now
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.1)',
    width: width - 48, // Full width minus padding
    height: 56, // Set height to 56px
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialButtonText: {
    color: '#ECEAE8',
    fontSize: 16,
    fontWeight: '600',
    textAlignVertical: 'center',
  },

  // Separator styles
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(229, 231, 235, 0.1)',
  },
  separatorText: {
    marginHorizontal: 16,
    color: colors.mediumGray,
    fontSize: 14,
  },
});

// Typography constants
export const typography = {
  sizes: {
    small: 12,
    medium: 14,
    large: 16,
  },
  weights: {
    normal: 'normal',
    bold: 'bold',
    semiBold: '600',
  },
  lineHeights: {
    normal: 18,
  },
} as const;

// Spacing constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 40,
  xxxl: 72,
};

// Border radius constants
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
};

// Component height constants
export const heights = {
  button: 56,
  input: 56,
};

// Form validation constants
export const SH_NAME_LEN_MIN = 2;
export const SH_PASSWORD_LEN_MIN = 8;

// Component styles
export const componentStyles = StyleSheet.create({
  // ShHero styles
  hero: {
    color: colors.lightGray,
    fontSize: 24,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },

  // ShTitle styles
  title: {
    color: colors.lightGray,
    fontSize: 24,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },

  // ShSubtitle styles
  subtitle: {
    color: colors.mediumGray,
    fontSize: typography.sizes.large,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ShTextPrimary styles
  textPrimary: {
    color: colors.mediumGray,
    fontSize: typography.sizes.large,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ShTextMuted styles
  textMuted: {
    color: colors.mediumGray,
    fontSize: typography.sizes.large,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ShWelcomeVideo styles
  welcomeVideoContainer: {
    backgroundColor: colors.darkCharcoal,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.lightGray,
    width: '100%', // Full width of the container
  },
  welcomeVideo: {
    // Dynamic sizing handled by props
  },

  // ShLogo styles
  logoContainer: {
    backgroundColor: colors.darkCharcoal,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ShLogoAndTitle styles
  logoAndTitleContainer: {
    backgroundColor: colors.darkCharcoal,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoAndTitle: {
    width: '100%',
    height: '100%',
    contentFit: 'contain',
  },

  // ShTextTerms styles
  termsText: {
    color: colors.mediumGray,
    fontSize: typography.sizes.medium,
    lineHeight: typography.lineHeights.normal,
  },
  termsLink: {
    color: colors.yellow,
  },

  // ShTextWithLink styles
  textWithLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  textWithLinkText: {
    color: colors.mediumGray,
    fontSize: typography.sizes.large,
    marginRight: spacing.xs,
  },
  textWithLinkLink: {
    color: colors.yellow,
    fontSize: typography.sizes.large,
  },

  // ShFormSubmit styles
  submitButton: {
    backgroundColor: colors.yellow,
    paddingVertical: 18,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    height: heights.button,
  },
  submitButtonText: {
    color: colors.darkCharcoal,
    fontSize: typography.sizes.large,
    textAlignVertical: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabledGray,
    opacity: 0.7,
  },
  submitButtonTextDisabled: {
    color: colors.mediumGray,
  },
  submitButtonLoading: {
    opacity: 0.7,
  },
  submitErrorText: {
    color: colors.error,
    fontSize: typography.sizes.medium,
    textAlign: 'center',
    marginTop: spacing.md,
  },

  // Shared field styles
  inputLabel: {
    color: colors.lightGray,
    fontSize: typography.sizes.large,
    marginBottom: spacing.sm,
  },
  requiredIndicator: {
    color: colors.yellow,
  },
  input: {
    backgroundColor: colors.darkCharcoal,
    color: colors.lightGray,
    paddingVertical: 20,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    fontSize: typography.sizes.large,
    height: heights.input,
    textAlignVertical: 'center',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.small,
    marginTop: spacing.xs,
  },

  // ShFieldHint styles
  hintText: {
    color: colors.mediumGray,
    fontSize: typography.sizes.small,
    marginTop: spacing.xs,
  },

  // ShFieldChoiceButtons styles
  choiceContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    height: heights.input,
  },
  choiceButtonSelected: {
    backgroundColor: colors.yellowWithOpacity,
    borderColor: colors.yellow,
  },
  choiceButtonText: {
    color: colors.lightGray,
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.semiBold,
    textAlignVertical: 'center',
  },
  choiceButtonTextSelected: {
    color: colors.yellow,
  },

  // ShFieldDate styles
  dateInput: {
    backgroundColor: colors.darkCharcoal,
    color: colors.lightGray,
    paddingVertical: 20,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    fontSize: typography.sizes.large,
    height: heights.input,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderText: {
    color: colors.mediumGray,
    fontSize: typography.sizes.large,
    flex: 1,
  },
  inputText: {
    color: colors.lightGray,
  },
  dropdownArrow: {
    color: colors.mediumGray,
    fontSize: typography.sizes.small,
    marginLeft: spacing.sm,
  },
});
