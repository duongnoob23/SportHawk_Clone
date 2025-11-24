import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    // paddingVertical: spacing.md,
    
    
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderColor:colorPalette.borderColorDark,
    borderBottomWidth:1,
  },
  sportButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusLarge,
    marginRight: spacing.sm,
    
  },
  sportButtonSelected: {
    backgroundColor: 'transparent',
  },
  sportButtonContent: {
    alignItems: 'center',
    position: 'relative',
    
  },
  sportText: {
    color: colorPalette.primaryGold,
    marginTop: spacing.xs,
  },
  sportTextSelected: {
    color: colorPalette.primaryGold,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -spacing.sm - 1,
    left: 0,
    right: 0,
    height: 1.25,
    backgroundColor: colorPalette.primaryGold,
  },
});
