import React from 'react';
import { View } from 'react-native';

import { spacing } from '@con/spacing';

export type SpacingSize = keyof typeof spacing;

interface ShSpacerProps {
  size?: SpacingSize | number;
  horizontal?: boolean;
}

export const ShSpacer: React.FC<ShSpacerProps> = ({
  size = 'md',
  horizontal = false,
}) => {
  const spacingValue = typeof size === 'number' ? size : spacing[size];

  return (
    <View
      style={horizontal ? { width: spacingValue } : { height: spacingValue }}
    />
  );
};
