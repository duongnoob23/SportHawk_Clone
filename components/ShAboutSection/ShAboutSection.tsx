import { ShText } from '@cmp/ShText';
import { ShTextVariant } from '@con/typography';
import React from 'react';
import { View } from 'react-native';
import { styles } from './ShAboutSection.styles';
import { ShSpacer } from '../ShSpacer';
import { spacing } from '@top/constants/spacing';

interface ShAboutSectionProps {
  title?: string;
  description?: string;
  emptyText?: string;
}

export const ShAboutSection: React.FC<ShAboutSectionProps> = ({
  title = 'About',
  description,
  emptyText = 'No description available',
}) => {
  return (
    <View style={styles.container}>
      <ShText variant={ShTextVariant.SectionTitle}>{title}</ShText>
      <ShSpacer size={spacing.xxl} />

      <ShText variant={ShTextVariant.Body}>{description || emptyText}</ShText>
    </View>
  );
};
