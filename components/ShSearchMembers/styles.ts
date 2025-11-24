import { StyleSheet } from 'react-native';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontSizes } from '@con/typography';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(158,155,151,0.2)',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.md,
    fontFamily: 'Inter',
    color: colorPalette.lightText,
  },
});
