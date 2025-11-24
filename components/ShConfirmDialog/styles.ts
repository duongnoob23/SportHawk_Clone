import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colorPalette.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: colorPalette.cardBackground,
    borderRadius: spacing.borderRadiusXl,
    paddingHorizontal: spacing.xxl,
    paddingVertical:spacing.topNavIndicatorWidth,
    width: '85%',
    maxWidth: 340,
    borderWidth:0.5,
    borderColor:colorPalette.borderColorDark,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: colorPalette.textMid,
  },
  buttonContainer: {
    flexDirection: 'column',
  },
  buttonWrapper: {
    // flex: 1,
  },
});


