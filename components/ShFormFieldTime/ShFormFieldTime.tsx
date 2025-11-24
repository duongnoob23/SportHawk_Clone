import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant, fontWeights } from '@con/typography';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ShIcon } from '../ShIcon';
import { ShText } from '../ShText';

interface ShFormFieldTimeProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  required?: boolean;
  editable?: boolean;
  placeholder?: string;
  defaultPickerValue?: Date;
  testID?: string;
}

export function ShFormFieldTime({
  label,
  value,
  onChange,
  error,
  required = false,
  editable = true,
  placeholder = 'Select time',
  defaultPickerValue,
  testID,
}: ShFormFieldTimeProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date>(value || new Date());

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePress = () => {
    if (editable) {
      // Use defaultPickerValue if provided and value is null, otherwise fall back to current behavior
      setTempTime(value || defaultPickerValue || new Date());
      setShowPicker(true);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedTime) {
        onChange(selectedTime);
      }
    } else {
      // iOS - update temp time
      if (selectedTime) {
        setTempTime(selectedTime);
      }
    }
  };

  const handleDone = () => {
    onChange(tempTime);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempTime(value || new Date());
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

      <TouchableOpacity
        style={[
          styles.inputContainer,
          styles.inputContainer,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          !editable && styles.inputDisabled,
        ]}
        onPress={handlePress}
        disabled={!editable}
        testID={testID}
      >
        <ShText
          variant={ShTextVariant.Body}
          style={[styles.timeText, !value && styles.placeholderText]}
        >
          {value ? formatTime(value) : placeholder}
        </ShText>
        <ShIcon
          name={IconName.Clock}
          size={spacing.iconSizeSmall}
          color={editable ? colorPalette.stoneGrey : colorPalette.textSubtle}
        />
      </TouchableOpacity>

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
                  />
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
                />
                <ShText
                  variant={ShTextVariant.Subheading}
                  style={styles.modalTitle}
                >
                  Select Time
                </ShText>
                <TouchableOpacity onPress={handleDone}>
                  <ShText
                    variant={ShTextVariant.Body}
                    style={styles.modalButtonDone}
                  />
                  <ShText
                    variant={ShTextVariant.Body}
                    style={styles.modalButtonDone}
                  >
                    Done
                  </ShText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                themeVariant="light"
                textColor={colorPalette.baseDark}
                testID={testID ? `${testID}-picker` : undefined}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={value || defaultPickerValue || new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            testID={`${testID}-picker`}
          />
        )
      )}
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
    backgroundColor: colorPalette.timeBackground,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: spacing.buttonHeightLarge,
  },
  inputError: {
    borderColor: colorPalette.primaryGold,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  timeText: {
    color: colorPalette.white,
  },
  errorText: {
    color: colorPalette.primaryGold,
    marginTop: spacing.xs,
  },
  placeholderText: {
    color: colorPalette.stoneGrey,
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
  },
  modalButtonDone: {
    color: colorPalette.primaryGold,
    fontWeight: fontWeights.semiBold,
  },
});
