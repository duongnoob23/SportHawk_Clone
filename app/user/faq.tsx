import React from 'react';
import { View, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { ShScreenContainer, ShText } from '@cmp/index';
import { ShTextVariant } from '@con/typography';
import { spacing } from '@con/spacing';
import { colorPalette } from '@con/colors';
import { logger } from '@lib/utils/logger';

export default function FAQScreen() {
  React.useEffect(() => {
    logger.log('[USR-001] FAQ screen mounted');
    return () => {
      logger.log('[USR-001] FAQ screen unmounted');
    };
  }, []);

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer:
        'Click "Forgot Password" on the sign-in screen, enter your email address, and follow the instructions sent to your email.',
    },
    {
      question: 'How do I join a team?',
      answer:
        'Navigate to the Teams section, search for your team, and tap "Request to Join". The team admin will review your request.',
    },
    {
      question: 'How do I make a payment?',
      answer:
        'Go to the payment request in your notifications or team page, review the details, and tap "Pay Now" to complete the payment securely.',
    },
    {
      question: 'Can I change my email address?',
      answer:
        'Yes, go to your Profile Settings and tap on Edit Profile to update your email address.',
    },
    {
      question: 'How do I contact support?',
      answer:
        'You can reach our support team at support@sporthawk.com or through the Contact Support page.',
    },
  ];

  return (
    <ShScreenContainer>
      <Stack.Screen
        options={{
          title: 'FAQ',
          headerStyle: {
            backgroundColor: colorPalette.baseDark,
          },
          headerTintColor: colorPalette.textLight,
        }}
      />
      <ScrollView>
        <View style={{ padding: spacing.lg }}>
          <ShText variant={ShTextVariant.Heading}>
            Frequently Asked Questions
          </ShText>

          <View style={{ marginTop: spacing.xl }}>
            {faqs.map((faq, index) => (
              <View key={index} style={{ marginBottom: spacing.xl }}>
                <ShText variant={ShTextVariant.SubHeading}>
                  {faq.question}
                </ShText>
                <ShText
                  variant={ShTextVariant.Body}
                  color={colorPalette.textSecondary}
                  style={{ marginTop: spacing.sm }}
                >
                  {faq.answer}
                </ShText>
              </View>
            ))}
          </View>

          <View
            style={{
              marginTop: spacing.xl,
              paddingTop: spacing.xl,
              borderTopWidth: 1,
              borderTopColor: colorPalette.borderInputField,
            }}
          >
            <ShText
              variant={ShTextVariant.Body}
              color={colorPalette.textSecondary}
            >
              Can&apos;t find what you&apos;re looking for?
            </ShText>
            <ShText
              variant={ShTextVariant.Body}
              color={colorPalette.primaryGold}
              style={{ marginTop: spacing.sm }}
            >
              Contact us at support@sporthawk.com
            </ShText>
          </View>
        </View>
      </ScrollView>
    </ShScreenContainer>
  );
}
