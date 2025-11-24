import { spacing } from '@con/spacing';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: spacing.tabsRowMarginTop,
    height: spacing.tabsRowHeight,
  },
  actionButton: {
    width: spacing.joinButtonWidth,
    height: spacing.joinButtonHeight,
    borderRadius: spacing.borderRadiusLarge,
  },
});
