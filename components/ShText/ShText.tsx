// src/components/ShText.tsx

import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { ColorName, colorPalette } from '@con/colors';
import { ShTextVariant, typographyStyles } from '@con/typography';

interface ShTextProps extends TextProps {
  variant?: ShTextVariant;
  color?: ColorName | string;
}

export const ShText = ({
  variant = ShTextVariant.Body,
  color,
  style,
  ...rest
}: ShTextProps) => {
  const baseStyle = typographyStyles[variant];

  const colorStyle = color
    ? {
        color: color in colorPalette ? colorPalette[color as ColorName] : color,
      }
    : {};

  const combinedStyle: StyleProp<TextStyle> = [baseStyle, colorStyle, style];

  return <Text allowFontScaling={false} style={combinedStyle} {...rest} />;
};
