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

interface ShFormFieldDateTimeProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  required?: boolean;
  editable?: boolean;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  defaultPickerValue?: Date;
  testID?: string;
}

export function ShFormFieldDateTime({
  label,
  value,
  onChange,
  error,
  required = false,
  editable = true,
  placeholder = 'Select date and time',
  minimumDate,
  maximumDate,
  defaultPickerValue,
  testID,
}: ShFormFieldDateTimeProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState(value || new Date());

  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} ${timeStr}`;
  };

  const handlePress = () => {
    if (editable) {
      setMode('date');
      // Use defaultPickerValue if provided and value is null, otherwise fall back to current behavior
      setTempDate(value || defaultPickerValue || new Date());
      setShowPicker(true);
    }
  };

  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setShowPicker(false);
        return;
      }

      if (selectedDate) {
        if (mode === 'date') {
          // After selecting date on Android, show time picker
          setTempDate(selectedDate);
          setMode('time');
          setTimeout(() => setShowPicker(true), 100);
        } else {
          // After selecting time, save the complete datetime
          onChange(selectedDate);
          setShowPicker(false);
        }
      }
    } else {
      // iOS
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleIOSDone = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleIOSCancel = () => {
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ShText variant={ShTextVariant.Label} style={styles.label}>
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
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        onPress={handlePress}
        disabled={!editable}
        testID={testID}
      >
        <ShText
          variant={ShTextVariant.Body}
          style={[styles.dateTimeText, !value && styles.placeholderText]}
        >
          {value ? formatDateTime(value) : placeholder}
        </ShText>
        <ShIcon
          name={IconName.CalendarOutline}
          size={spacing.iconSizeSmall}
          color={colorPalette.stoneGrey}
        />
      </TouchableOpacity>

      {error && (
        <ShText variant={ShTextVariant.Small} style={styles.errorText}>
          {error}
        </ShText>
      )}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={mode === 'date' ? tempDate : tempDate}
          mode={mode}
          display="default"
          onChange={handleDateTimeChange}
          minimumDate={mode === 'date' ? minimumDate : undefined}
          maximumDate={mode === 'date' ? maximumDate : undefined}
          testID={`${testID}-picker`}
        />
      )}

      {showPicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showPicker}
          onRequestClose={handleIOSCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleIOSCancel}>
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
                  Select Date & Time
                </ShText>
                <TouchableOpacity onPress={handleIOSDone}>
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
                mode="datetime"
                display="spinner"
                onChange={handleDateTimeChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                themeVariant="light"
                textColor={colorPalette.baseDark}
                testID={`${testID}-picker`}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
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
  dateTimeText: {
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
  label: {
    fontSize: spacing.mdx,
  },
});
