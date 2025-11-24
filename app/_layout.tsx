import { colorPalette } from '@con/colors';
import { UserProvider } from '@ctx/UserContext';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { queryClient } from '@lib/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StripeProvider } from '@stripe/stripe-react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { ShErrorMessage, ShScreenContainer, ShSpacer } from '@top/components';
import { spacing } from '@top/constants/spacing';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
const { height: screenHeight } = Dimensions.get('window');

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const { url } = event;

      if (!url) return;

      try {
        const hashIndex = url.indexOf('#');
        const hash = hashIndex >= 0 ? url.substring(hashIndex + 1) : '';

        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const type = params.get('type');

        if (!type || !access_token) return;

        if (type === 'recovery') {
          const tokenData = JSON.stringify({
            access_token,
            refresh_token: refresh_token || '',
            type,
            timestamp: Date.now(),
          });

          await AsyncStorage.setItem('password_reset_tokens', tokenData);
          await new Promise(resolve => setTimeout(resolve, 100));
          router.replace('/(auth)/ResetPassword');
        }
      } catch (err) {
        console.error('[DEEPLINK] Failed to process URL:', err);
      }
    };

    Linking.getInitialURL()
      .then(url => {
        if (url) handleUrl({ url });
      })
      .catch(err =>
        console.error('[DEEPLINK] Error getting initial URL:', err)
      );

    const subscription = Linking.addEventListener('url', handleUrl);

    return () => subscription.remove();
  }, [router]);

  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const isTestMode = publishableKey?.startsWith('pk_test_');

  console.log('[STRIPE INIT] Checking publishable key:', {
    keyExists: !!publishableKey,
    keyPrefix: publishableKey?.substring(0, 7),
    isTestKey: isTestMode,
  });

  if (!isTestMode && __DEV__) {
    console.warn('⚠️ WARNING: Using LIVE Stripe key in development!');
  }

  console.log(
    '[STRIPE INIT] Initializing StripeProvider with merchant:',
    'merchant.com.sporthawk.app'
  );

  if (!publishableKey) {
    console.error('[STRIPE INIT] No publishable key found in environment');
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
        <Stack.Screen options={{ headerShown: false }} />
        <ShScreenContainer>
          <ShSpacer size={spacing.xxxl} />
          <ShErrorMessage message="Payment system not configured. Please contact support." />
        </ShScreenContainer>
      </SafeAreaView>
    );
  }

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.sporthawk.app"
    >
      <GestureHandlerRootView>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <QueryClientProvider client={queryClient}>
              <ActionSheetProvider>
                <UserProvider>
                  <View style={styles.container}>
                    <StatusBar style="light" />
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        contentStyle: {
                          backgroundColor: colorPalette.baseDark,
                        },
                      }}
                    />
                  </View>
                </UserProvider>
              </ActionSheetProvider>
            </QueryClientProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    minHeight: screenHeight,
  },
});
