import { colorPalette } from '@con/colors';
import { opacity } from '@con/opacity';
import { spacing } from '@con/spacing';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    height: spacing.heroImageHeight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: spacing.none,
    left: spacing.none,
    right: spacing.none,
    height: '100%',
    backgroundColor: colorPalette.baseDark,
    opacity: opacity.none,
  },
});
