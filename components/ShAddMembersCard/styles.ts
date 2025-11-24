import { StyleSheet } from 'react-native';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';

export const styles = StyleSheet.create({
  container: {
    height: spacing.addMembersCardHeight,
    backgroundColor: colorPalette.backgroundListItem,
    borderWidth: 1,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  alertIconContainer: {
    width: spacing.alertIconContainerSize,
    height: spacing.alertIconContainerSize,
    backgroundColor: colorPalette.paymentDueDateBannerBg,
    borderRadius: spacing.borderRadiusLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    color: colorPalette.lightText,
  },
  subtitle: {
    fontSize: 14,
    color: colorPalette.stoneGrey,
  },
});
