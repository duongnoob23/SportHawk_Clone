import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontWeights } from '@top/constants/typography';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.black,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.md,
    borderRadius: spacing.paymentCardBorderRadius,
    overflow: 'hidden',
    borderWidth:0.5,
    borderColor:colorPalette.borderColorDark,
    padding:spacing.xxl,

  },
  content: {
  },
  topContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: spacing.lg,
  },
  logo: {
    width: spacing.clubLogoSize,
    height: spacing.clubLogoSize,
    borderRadius: spacing.borderRadiusMedium,
  },
  logoPlaceholder: {
    width: spacing.clubLogoSize,
    height: spacing.clubLogoSize,
    borderRadius: spacing.borderRadiusMedium,
    backgroundColor: colorPalette.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    gap:0,
    flex: 1,
    justifyContent: 'flex-start',
  },
  clubName: {
    color: colorPalette.lightText,
  },
  teamName: {
    color: colorPalette.textThird,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: colorPalette.stoneGrey,
    marginLeft: spacing.xs,
    flex: 1,
    fontSize:spacing.mdx,
    fontWeight:fontWeights.regular,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberText: {
    color: colorPalette.stoneGrey,
    marginLeft: spacing.xs,
  },
  chevron: {
    marginLeft: spacing.md,
  },
  buttonContainer: {
    // backgroundColor:"red",
    // paddingHorizontal: spacing.paymentCardPadding,
    // paddingBottom: spacing.paymentCardPadding,
    // paddingTop: spacing.sm,
    height:spacing.buttonHeightLarge,
  },
});
