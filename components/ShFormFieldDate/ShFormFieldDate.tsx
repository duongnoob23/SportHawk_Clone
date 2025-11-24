import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { fontWeights, ShTextVariant, typographyStyles } from '@con/typography';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ShIcon } from '../ShIcon';
import { ShText } from '../ShText';

interface ShFormFieldDateProps {
  label?: string;
  placeholder: string;
  value: Date | null;
  onChangeDate: (date: Date) => void;
  error?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  defaultDate?: Date;
  helperText?: string;
  testID?: string;
}

export function ShFormFieldDate({
label = 'Date of Birth',
  placeholder,
  value,
  onChangeDate,
  error,
  required = false,
  minimumDate,
  maximumDate,
  defaultDate,
  helperText,
  testID,
}: ShFormFieldDateProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    value || defaultDate || new Date()
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedDate) {
        onChangeDate(selectedDate);
      }
    } else {
      // iOS - update temp date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleDone = () => {
    onChangeDate(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ShText variant={ShTextVariant.Label}>
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
      <Pressable
        onPress={() => {
          setTempDate(value || defaultDate || new Date());
          setShowPicker(true);
        }}
        style={[styles.inputContainer, error && styles.inputError]}
        testID={testID}
      >
        <ShText
          variant={ShTextVariant.Body}
          style={[
            styles.inputText,
            ...(!value ? [styles.placeholderText] : []),
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </ShText>
        <ShIcon
          name={IconName.Calendar}
          size={spacing.iconSizeSmall}
          color={colorPalette.stoneGrey}
        />
      </Pressable>
      {helperText && !error && (
        <ShText variant={ShTextVariant.Small} style={styles.helperText}>
          {helperText}
        </ShText>
      )}
      {error && (
        <ShText variant={ShTextVariant.Small} style={styles.errorText}>
          {error}
        </ShText>
      )}
      {showPicker && Platform.OS === 'ios' ? (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showPicker}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <ShText
                    variant={ShTextVariant.Body}
                    style={styles.modalButton}
                  >
                    Cancel
                  </ShText>
                </TouchableOpacity>
                <ShText
                  variant={ShTextVariant.Subheading}
                  style={styles.modalTitle}
                >
                  Select Date
                </ShText>
                <TouchableOpacity onPress={handleDone}>
                  <ShText
                    variant={ShTextVariant.Body}
                    style={styles.modalButtonDone}
                  >
                    Done
                  </ShText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                themeVariant="light"
                textColor={colorPalette.baseDark}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={value || defaultDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colorPalette.backgroundFieldDate,
    borderWidth: 1,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    height: spacing.buttonHeightLarge,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md + 1,
  },
  inputError: {
    borderColor: colorPalette.primaryGold,
  },
  inputText: {
    ...typographyStyles.body,
    color: colorPalette.textLight,
    flex: 1,
  },
  placeholderText: {
    color: colorPalette.stoneGrey,
  },
  arrowText: {
    color: colorPalette.stoneGrey,
    fontSize: typographyStyles.small.fontSize,
    marginLeft: spacing.xs,
  },
  helperText: {
    color: colorPalette.stoneGrey,
    marginTop: spacing.xs,
    fontSize: typographyStyles.small.fontSize,
  },
  errorText: {
    color: colorPalette.primaryGold,
    marginTop: spacing.xs,
    fontSize: typographyStyles.small.fontSize,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colorPalette.modalOverlay,
  },
  modalContent: {
    backgroundColor: colorPalette.modalBackground,
    borderTopLeftRadius: spacing.borderRadiusXl,
    borderTopRightRadius: spacing.borderRadiusXl,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderSubtle,
  },
  modalTitle: {
    color: colorPalette.baseDark,
    fontWeight: fontWeights.semiBold,
  },
  modalButton: {
    color: colorPalette.stoneGrey,
    fontSize: typographyStyles.body.fontSize,
  },
  modalButtonDone: {
    color: colorPalette.primaryGold,
    fontSize: typographyStyles.body.fontSize,
    fontWeight: fontWeights.semiBold,
  },
});
