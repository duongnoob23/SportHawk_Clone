import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { typographyStyles } from '@con/typography';
import React, { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

interface ShOTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  value?: string[];
  autoFocus?: boolean;
}

export const ShOTPInput: React.FC<ShOTPInputProps> = ({
  length = 6,
  onComplete,
  value: externalValue,
  autoFocus = true,
}) => {
  const [internalValue, setInternalValue] = useState<string[]>(
    Array(length).fill('')
  );
  const value = externalValue || internalValue;
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const updateValue = (newValue: string[]) => {
    if (!externalValue) setInternalValue(newValue);
  };

  const handleChange = (text: string, index: number) => {
    // Paste case: user paste more than 1 char
    if (text.length > 1) {
      const chars = text.replace(/\D/g, '').slice(0, length).split('');
      if (chars.length === length) {
        updateValue(chars);
        onComplete(chars.join(''));
        // focus last input
        inputRefs.current[length - 1]?.blur();
      }
      return;
    }

    // Only allow single digit
    if (text && !/^\d$/.test(text)) return;

    const newValue = [...value];
    newValue[index] = text;
    updateValue(newValue);

    // Auto-focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check complete
    if (newValue.join('').length === length) {
      onComplete(newValue.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.sm,
      }}
    >
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            style={{
              width: spacing.buttonHeightLarge,
              height: spacing.buttonHeightLarge + spacing.xs,
              borderRadius: spacing.borderRadiusMedium,
              textAlign: 'center',
              fontSize: typographyStyles.heading.fontSize,
              fontWeight: '600',
              color: colorPalette.textLight,
              backgroundColor: colorPalette.timeBackground,
              borderWidth: value[index] ? 2 : 1,
              borderColor: value[index]
                ? colorPalette.primaryGold
                : colorPalette.borderColorOtp,
            }}
            value={value[index]}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus={autoFocus && index === 0}
            selectionColor={colorPalette.primaryGold}
          />
        ))}
    </View>
  );
};
