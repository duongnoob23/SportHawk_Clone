import { colorPalette } from '@con/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type CheckboxState = 'inactive' | 'active' | 'cross';

interface ShCheckboxProps {
  state: CheckboxState;
  color?: string;
  size?: number;
}

export function ShCheckbox({ state, color, size = 24 }: ShCheckboxProps) {
  const getStateConfig = () => {
    switch (state) {
      case 'active':
        return {
          borderColor: color || colorPalette.primaryGold,
          character: '✓',
          characterColor: 'black',
          backgroundColor: colorPalette.primaryGold,
        };
      case 'cross':
        return {
          borderColor: color || colorPalette.error,
          character: '✕',
          characterColor: color || colorPalette.error,
        };
      case 'inactive':
      default:
        return {
          borderColor: color || colorPalette.stoneGrey,
          character: '',
          characterColor: '',
        };
    }
  };

  const config = getStateConfig();
  const fontSize = size * 0.67; // Scale font relative to container size

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: config.borderColor,
          backgroundColor: config.backgroundColor,
        },
      ]}
    >
      {config.character ? (
        <Text
          style={[
            styles.character,
            {
              fontSize,
              color: config.characterColor,
            },
          ]}
        >
          {config.character}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  character: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
