import { StyleSheet } from 'react-native';
import { colorPalette } from '@con/colors';
import { fontSizes, fontWeights, lineHeights } from '@con/typography';

export const styles = StyleSheet.create({
  container: {
    // No padding needed - just wraps the text
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.medium,
    color: colorPalette.textLight,
    lineHeight: lineHeights.xl,
  },
});
