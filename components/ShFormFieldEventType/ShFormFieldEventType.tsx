import { colorPalette } from '@con/colors';
import { EVENT_TYPES } from '@con/eventTypes';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { fontSizes, ShTextVariant } from '@con/typography';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShIcon } from '../ShIcon';
import { ShSpacer } from '../ShSpacer';
import { ShText } from '../ShText';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRef } from 'react';

interface ShFormFieldEventTypeProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  options?: { label: string; value: string }[];
  error?: string;
  required?: boolean;
  editable?: boolean;
  testID?: string;
}

export function ShFormFieldEventType({
  label = 'Event Type',
  value,
  onChange,
  options = EVENT_TYPES,
  error,
  required = false,
  editable = true,
  testID,
}: ShFormFieldEventTypeProps) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const handlePress = () => {
    if (editable && onChange) {
      setModalVisible(true);
    }
  };

  const handleSelect = (selectedValue: string) => {
    if (onChange) {
      onChange(selectedValue);
    }
    setModalVisible(false);
  };

  const handlePress1 = () => {
    if (editable && onChange) {
      bottomSheetRef.current?.present();
    }
  };

  const handleSelect1 = (selectedValue: string) => {
    if (onChange) {
      onChange(selectedValue);
    }
    bottomSheetRef.current?.dismiss();
  };

  // Find the label for the current value
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : 'Select type';

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ShText variant={ShTextVariant.Label} style={styles.textEventType}>
          {label}
          {required && (
            <ShText
              variant={ShTextVariant.Label}
              color={colorPalette.primaryGold}
            >
              {' '}
              *
            </ShText>
          )}
        </ShText>
      </View>

      <TouchableOpacity
        style={[
          styles.inputContainer,
          styles.inputContainer,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          value ? styles.inputWithValue : styles.inputPlaceholder,
          value ? styles.inputWithValue : styles.inputPlaceholder,
        ]}
        onPress={handlePress1}
        disabled={!editable}
        testID={testID}
      >
        <ShText
          variant={ShTextVariant.Body}
          style={[styles.valueText, !value && styles.placeholderText]}
        >
          {displayValue}
        </ShText>
        <ShIcon
          name={IconName.ChevronDown}
          size={spacing.iconSizeSmall}
          color={colorPalette.stoneGrey}
        />
      </TouchableOpacity>

      {error && (
        <ShText variant={ShTextVariant.Small} style={styles.errorText}>
          {error}
        </ShText>
      )}

      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        backgroundStyle={{ backgroundColor: colorPalette.baseDark }}
        handleIndicatorStyle={{ backgroundColor: colorPalette.stoneGrey }}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close" // click ngoài => đóng sheet
          />
        )}
      >
        <BottomSheetView
          style={[
            styles.modalContent,
            { marginBottom: insets.bottom, paddingBottom: spacing.xl },
          ]}
        >
          <ShSpacer size={spacing.xxl} />
          <View style={styles.modalHeader}>
            <ShText
              variant={ShTextVariant.SectionTitle}
              style={styles.modalTitle}
            >
              Select Event Type
            </ShText>
          </View>

          <ShSpacer size={spacing.xxl} />

          <FlatList
            data={options}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: spacing.xxl }}>
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.optionItemSelected,
                  ]}
                  onPress={() => handleSelect1(item.value)}
                >
                  <ShText
                    variant={ShTextVariant.Body}
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </ShText>
                </TouchableOpacity>
                <ShSpacer size={spacing.md} />
              </View>
            )}
          />

          <ShSpacer size={spacing.marginBottomModal - spacing.md} />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: 'rgba(158, 155, 151, 0.2)',
    borderWidth: spacing.borderWidthThin,
    borderColor: 'rgba(229, 231, 235, 0.2)',
    borderRadius: spacing.borderRadiusLarge,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: spacing.buttonHeightLarge,
  },
  inputWithValue: {
    backgroundColor: 'rgba(158, 155, 151, 0.2)',
  },
  inputPlaceholder: {
    backgroundColor: 'rgba(158, 155, 151, 0.2)',
  },
  inputError: {
    borderColor: colorPalette.primaryGold,
  },
  inputDisabled: {
    opacity: 0.8,
  },
  valueText: {
    fontSize: fontSizes.md,
    color: colorPalette.lightText,
    flex: 1,
  },
  placeholderText: {
    color: colorPalette.stoneGrey,
  },
  errorText: {
    color: colorPalette.primaryGold,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colorPalette.baseDark,
    // backgroundColor: colorPalette.error,
    // borderTopLeftRadius: spacing.borderRadiusXLarge,
    // borderTopRightRadius: spacing.borderRadiusXLarge,
    // borderWidth: spacing.xxxs,
    // borderTopColor: colorPalette.borderColorDark,
    // borderTopLeftRadius: spacing.lg,
    // borderTopRightRadius: spacing.lg,
  },
  modalHeader: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xxl,
  },
  modalTitle: {
    color: colorPalette.lightText,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: spacing.lg,
    borderWidth: spacing.xxxs,
    borderColor: colorPalette.borderColorLight,
  },
  optionItemSelected: {
    backgroundColor: 'rgba(234, 189, 34, 0.1)',
    borderColor: colorPalette.primaryGold,
    borderWidth: spacing.xxxs,
  },
  optionText: {
    color: colorPalette.lightText,
  },
  optionTextSelected: {
    color: colorPalette.primaryGold,
  },
  textEventType: {
    fontSize: fontSizes.sm,
  },
});
