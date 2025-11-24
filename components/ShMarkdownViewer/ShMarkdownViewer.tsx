import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontSizes, fontWeights, lineHeights } from '@con/typography';

interface ShMarkdownViewerProps {
  content: string;
  scrollable?: boolean;
}

export const ShMarkdownViewer: React.FC<ShMarkdownViewerProps> = ({
  content,
  scrollable = false,
}) => {
  const markdownStyles = {
    body: {
      color: colorPalette.textMid,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.lg,
      fontFamily: 'Inter',
    },
    heading1: {
      color: colorPalette.textLight,
      fontSize: fontSizes.xxxl,
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.display,
      marginBottom: spacing.lg,
      marginTop: spacing.xl,
    },
    heading2: {
      color: colorPalette.textLight,
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.semiBold,
      lineHeight: lineHeights.xxl,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    heading3: {
      color: colorPalette.textLight,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.xl,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    heading4: {
      color: colorPalette.textLight,
      fontSize: fontSizes.lg2,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.lg,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    heading5: {
      color: colorPalette.textLight,
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.lg,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    heading6: {
      color: colorPalette.textLight,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.md,
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    paragraph: {
      marginBottom: spacing.md,
      color: colorPalette.textMid,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.lg,
    },
    strong: {
      fontWeight: fontWeights.semiBold,
      color: colorPalette.textLight,
    },
    em: {
      fontStyle: 'italic' as const,
      color: colorPalette.textMid,
    },
    link: {
      color: colorPalette.primaryGold,
      textDecorationLine: 'underline' as const,
    },
    list_item: {
      marginBottom: spacing.xs,
      flexDirection: 'row' as const,
    },
    ordered_list: {
      marginBottom: spacing.md,
    },
    bullet_list: {
      marginBottom: spacing.md,
    },
    bullet_list_icon: {
      color: colorPalette.textSecondary,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.lg,
      marginRight: spacing.xs,
    },
    ordered_list_icon: {
      color: colorPalette.textSecondary,
      fontSize: fontSizes.md,
      lineHeight: lineHeights.lg,
      marginRight: spacing.xs,
    },
    code_inline: {
      backgroundColor: colorPalette.cardBackground,
      color: colorPalette.primaryGold,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      borderRadius: spacing.xs,
      fontFamily: 'monospace',
      fontSize: fontSizes.sm,
    },
    code_block: {
      backgroundColor: colorPalette.cardBackground,
      padding: spacing.md,
      borderRadius: spacing.sm,
      marginBottom: spacing.md,
      fontFamily: 'monospace',
      fontSize: fontSizes.sm,
      color: colorPalette.textMid,
    },
    blockquote: {
      borderLeftWidth: spacing.xs,
      borderLeftColor: colorPalette.primaryGold,
      paddingLeft: spacing.md,
      marginBottom: spacing.md,
      fontStyle: 'italic' as const,
    },
    hr: {
      backgroundColor: colorPalette.border,
      height: 1,
      marginVertical: spacing.lg,
    },
    table: {
      borderWidth: 1,
      borderColor: colorPalette.border,
      marginBottom: spacing.md,
    },
    thead: {
      backgroundColor: colorPalette.cardBackground,
    },
    tbody: {},
    th: {
      borderWidth: 1,
      borderColor: colorPalette.border,
      padding: spacing.sm,
      fontWeight: fontWeights.semiBold,
      color: colorPalette.textLight,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: colorPalette.border,
    },
    td: {
      borderWidth: 1,
      borderColor: colorPalette.border,
      padding: spacing.sm,
      color: colorPalette.textMid,
    },
  };

  const renderContent = () => (
    <Markdown style={markdownStyles}>{content}</Markdown>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    );
  }

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
