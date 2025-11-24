import { StyleSheet } from 'react-native';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.clubHeaderGap,
  },
  logoContainer: {
    width: spacing.clubLogoContainerSize,
    height: spacing.clubLogoContainerSize,
    borderRadius: spacing.borderRadiusXl,
    backgroundColor: colorPalette.black,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    padding: spacing.clubLogoPadding,
  },
  clubLogo: {
    width: spacing.clubLogoSize,
    height: spacing.clubLogoSize,
    borderRadius: spacing.borderRadiusXl,
  },
  logoPlaceholder: {
    width: spacing.clubLogoSize,
    height: spacing.clubLogoSize,
    borderRadius: spacing.borderRadiusXl,
    backgroundColor: colorPalette.backgroundListItem,
  },
  clubInfo: {
    flex: 1,
    gap: spacing.clubInfoGap,
    paddingTop: spacing.clubInfoPaddingTop,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.locationRowGap,
  },
});
