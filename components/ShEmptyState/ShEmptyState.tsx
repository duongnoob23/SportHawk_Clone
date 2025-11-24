import React from 'react';
import { View } from 'react-native';
import { ShText } from '../ShText';
import { styles } from './styles';

interface ShEmptyStateProps {
  message: string;
}

export const ShEmptyState: React.FC<ShEmptyStateProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <ShText style={styles.text}>{message}</ShText>
    </View>
  );
};
