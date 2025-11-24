import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShText } from '../ShText/ShText';
import { ShTextVariant, fontSizes, fontWeights } from '@con/typography';
import { ShSpacer } from '../ShSpacer/ShSpacer';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';

interface ShSectionContentProps {
  title: string;
  content: string | null | undefined;
  defaultContent?: string;
}

export function ShSectionContent({
  title,
  content,
  defaultContent = 'No content provided',
}: ShSectionContentProps) {
  return (
    <View style={styles.container}>
      <ShText variant={ShTextVariant.Subheading}>{title}</ShText>
      <ShSpacer size="md" />
      <ShText variant={ShTextVariant.Body} style={styles.content}>
        {content || defaultContent}
      </ShText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // No flex: 1 - container should only be as tall as its content
  },
  title: {
    color: colorPalette.lightText,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.medium,
    letterSpacing: -0.04,
  },
  content: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.md,
    lineHeight: spacing.iconSizeMedium,
  },
});
