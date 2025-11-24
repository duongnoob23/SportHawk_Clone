import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { colorPalette } from '@top/constants/colors';
import { spacing } from '@top/constants/spacing';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type ShBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type ShBottomSheetProps = Partial<BottomSheetModalProps> & {
  onFirstPress?: () => void;
  onSecondPress?: () => void;
};

// Export BottomSheetModal ref type for direct usage
export type { BottomSheetModal };

const ShBottomSheet = forwardRef<ShBottomSheetRef, ShBottomSheetProps>(
  ({ onFirstPress, onSecondPress, ...bottomSheetProps }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const snapPoints = useMemo(() => ['25%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      []
    );

    const handleSheetChange = useCallback((index: number) => {
      // Track sheet state if needed
      console.log('ShBottomSheet changed to index:', index);
    }, []);

    useImperativeHandle(ref, () => ({
      present: () => {
        console.log(
          'ShBottomSheet present called, ref:',
          bottomSheetRef.current
        );
        if (bottomSheetRef.current) {
          console.log('Calling bottomSheetRef.current.present(0)');
          // Try calling with index 0
          bottomSheetRef.current.present(0);
        } else {
          console.warn('bottomSheetRef.current is null in useImperativeHandle');
        }
      },
      dismiss: () => {
        bottomSheetRef.current?.dismiss();
      },
    }));

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={bottomSheetProps.snapPoints || snapPoints}
        backdropComponent={bottomSheetProps.backdropComponent || renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onChange={handleSheetChange}
        enablePanDownToClose={true}
        enableDismissOnClose={true}
        {...bottomSheetProps}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.button, styles.primary]}
            onPress={() => {
              onFirstPress?.();
              bottomSheetRef.current?.dismiss();
            }}
          >
            <Text style={styles.buttonText}>First Action</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondary]}
            onPress={() => {
              onSecondPress?.();
              bottomSheetRef.current?.dismiss();
            }}
          >
            <Text style={styles.buttonText}>Second Action</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    );
  }
);

ShBottomSheet.displayName = 'ShBottomSheet';
export default ShBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colorPalette.baseDark,
    zIndex: 999,
  },
  handleIndicator: {
    backgroundColor: colorPalette.stoneGrey,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
  button: {
    paddingVertical: spacing.lg,
    borderRadius: spacing.borderRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colorPalette.primaryGold,
  },
  secondary: {
    backgroundColor: colorPalette.borderInputField,
  },
  buttonText: {
    color: colorPalette.baseDark,
    fontWeight: '600',
    fontSize: 16,
  },
});
