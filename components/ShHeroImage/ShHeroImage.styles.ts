import { StyleSheet } from 'react-native';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';

export const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    backgroundColor: colorPalette.baseDark,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: spacing.none,
    left: spacing.none,
  },
  overlay: {
    position: 'absolute',
    top: spacing.none,
    left: spacing.none,
    right: spacing.none,
    bottom: spacing.none,
    backgroundColor: colorPalette.baseDark,
  },
});
