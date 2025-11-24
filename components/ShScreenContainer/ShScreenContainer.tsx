import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { colorPalette } from '@con/colors';

const { height: screenHeight } = Dimensions.get('window');

interface ShScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ShScreenContainer: React.FC<ShScreenContainerProps> = ({
  children,
  scrollable = true,
  style,
}) => {
  if (!scrollable) {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <ScrollView
      style={[styles.scrollView, style]}
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  scrollView: {
    position: 'relative',
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  scrollContentContainer: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
});
