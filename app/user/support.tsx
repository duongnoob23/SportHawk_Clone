import React from 'react';
import { View, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { ShScreenContainer, ShText } from '@cmp/index';
import { ShTextVariant } from '@con/typography';
import { spacing } from '@con/spacing';
import { colorPalette } from '@con/colors';
import { logger } from '@lib/utils/logger';

export default function SupportScreen() {
  React.useEffect(() => {
    logger.log('[USR-001] Support screen mounted');
    return () => {
      logger.log('[USR-001] Support screen unmounted');
    };
  }, []);

  return (
    <ShScreenContainer>
      <Stack.Screen
        options={{
          title: 'Contact Support',
          headerStyle: {
            backgroundColor: colorPalette.baseDark,
          },
          headerTintColor: colorPalette.textLight,
        }}
      />
      <ScrollView>
        <View style={{ padding: spacing.lg }}>
          <ShText variant={ShTextVariant.Heading}>Contact Support</ShText>

          <View style={{ marginTop: spacing.lg }}>
            <ShText variant={ShTextVariant.Body}>
              We&apos;re here to help!
            </ShText>

            <View style={{ marginTop: spacing.md }}>
              <ShText
                variant={ShTextVariant.Body}
                color={colorPalette.textSecondary}
              >
                For support inquiries, please email:
              </ShText>
              <ShText
                variant={ShTextVariant.Body}
                color={colorPalette.primaryGold}
                style={{ marginTop: spacing.sm }}
              >
                support@sporthawk.com
              </ShText>
            </View>

            <View style={{ marginTop: spacing.xl }}>
              <ShText variant={ShTextVariant.SubHeading}>Response Times</ShText>
              <ShText
                variant={ShTextVariant.Body}
                color={colorPalette.textSecondary}
                style={{ marginTop: spacing.sm }}
              >
                We aim to respond to all support requests within 24-48 hours
                during business days.
              </ShText>
            </View>

            <View style={{ marginTop: spacing.xl }}>
              <ShText variant={ShTextVariant.SubHeading}>Common Issues</ShText>
              <View style={{ marginTop: spacing.sm }}>
                <ShText
                  variant={ShTextVariant.Body}
                  color={colorPalette.textSecondary}
                >
                  • Password reset problems
                </ShText>
                <ShText
                  variant={ShTextVariant.Body}
                  color={colorPalette.textSecondary}
                >
                  • Account verification
                </ShText>
                <ShText
                  variant={ShTextVariant.Body}
                  color={colorPalette.textSecondary}
                >
                  • Payment issues
                </ShText>
                <ShText
                  variant={ShTextVariant.Body}
                  color={colorPalette.textSecondary}
                >
                  • Team management
                </ShText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ShScreenContainer>
  );
}
