import { StyleSheet } from 'react-native';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';

export const styles = StyleSheet.create({
  // Standard card styles (ADM-001, ADM-003)
  container: {
    height: spacing.memberCardHeight,
    backgroundColor: colorPalette.backgroundListItem,
    borderWidth: 1,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: spacing.cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: spacing.md,
    gap: 4,
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: colorPalette.lightText,
  },
  subtitle: {
    fontSize: 14,
    color: colorPalette.stoneGrey,
  },
  iconButton: {
    padding: spacing.sm,
    marginRight: spacing.lg,
  },

  // Remove icon (horizontal bar)
  removeIcon: {
    width: spacing.removeIconWidth,
    height: spacing.removeIconHeight,
    backgroundColor: colorPalette.primaryGold,
  },

  // Add icon (plus sign made of two bars)
  addIconContainer: {
    width: spacing.removeIconWidth,
    height: spacing.removeIconWidth,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  addIconHorizontal: {
    position: 'absolute',
    width: spacing.removeIconWidth,
    height: spacing.removeIconHeight,
    backgroundColor: colorPalette.primaryGold,
  },
  addIconVertical: {
    position: 'absolute',
    width: spacing.removeIconHeight,
    height: spacing.removeIconWidth,
    backgroundColor: colorPalette.primaryGold,
  },

  // Interest expression card styles (ADM-002)
  interestContainer: {
    backgroundColor: colorPalette.backgroundListItem,
    borderWidth: 1,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },
  interestContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colorPalette.borderInputField,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.memberCardButtonGap,
    justifyContent: 'center',
  },
  acceptButton: {
    width: spacing.interestCardButtonWidth,
    height: 50,
    backgroundColor: colorPalette.paymentStatusProcessing,
  },
  ignoreButton: {
    width: spacing.interestCardButtonWidth,
    height: 50,
    backgroundColor: colorPalette.borderColorLight,
  },
});
