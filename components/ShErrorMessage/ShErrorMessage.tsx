import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShText } from '../ShText/ShText';
import { ShTextVariant } from '@con/typography';
import { colorPalette } from '@con/colors';

interface ShErrorMessageProps {
  message: string;
}

export function ShErrorMessage({ message }: ShErrorMessageProps) {
  return (
    <View style={styles.container}>
      <ShText variant={ShTextVariant.Heading} style={styles.text}>
        {message}
      </ShText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    color: colorPalette.lightText,
    textAlign: 'center',
  },
});
