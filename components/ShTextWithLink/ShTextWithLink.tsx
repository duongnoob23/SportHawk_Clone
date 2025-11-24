import React from 'react';
import { StyleSheet, Linking } from 'react-native';
import { ShText } from '../ShText';
import { colorPalette } from '@con/colors';
import { ShTextVariant } from '@con/typography';

interface LinkSegment {
  text: string;
  url?: string;
}

interface ShTextWithLinkProps {
  segments: LinkSegment[];
  style?: any;
  testID?: string;
}

export function ShTextWithLink({
  segments,
  style,
  testID,
}: ShTextWithLinkProps) {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ShText
      variant={ShTextVariant.Small}
      style={[styles.container, style]}
      testID={testID}
    >
      {segments.map((segment, index) => {
        if (segment.url) {
          return (
            <ShText
              key={index}
              variant={ShTextVariant.Small}
              color={colorPalette.primaryGold}
              onPress={() => handleLinkPress(segment.url!)}
            >
              {segment.text}
            </ShText>
          );
        }
        return (
          <ShText
            key={index}
            variant={ShTextVariant.Small}
            color={colorPalette.textLight}
          >
            {segment.text}
          </ShText>
        );
      })}
    </ShText>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
