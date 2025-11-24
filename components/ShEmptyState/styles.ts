import { StyleSheet } from 'react-native';
import { colorPalette } from '@con/colors';
import { fontSizes } from '@con/typography';
import { spacing } from '@con/spacing';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.emptyStatePaddingVertical,
    alignItems: 'center',
  },
  text: {
    fontSize: fontSizes.md,
    color: colorPalette.stoneGrey,
    textAlign: 'center',
  },
});
