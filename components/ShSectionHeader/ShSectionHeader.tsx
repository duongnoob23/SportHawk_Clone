import React from 'react';
import { View } from 'react-native';
import { ShText } from '../ShText';
import { styles } from './styles';

interface ShSectionHeaderProps {
  title: string;
}

export const ShSectionHeader: React.FC<ShSectionHeaderProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <ShText style={styles.title}>{title}</ShText>
    </View>
  );
};
