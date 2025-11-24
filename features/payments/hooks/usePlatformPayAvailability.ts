import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { isPlatformPaySupported } from '@stripe/stripe-react-native';
import { logger } from '@lib/utils/logger';

interface PlatformPayAvailability {
  isApplePaySupported: boolean;
  isGooglePaySupported: boolean;
  isLoading: boolean;
}

export const usePlatformPayAvailability = (): PlatformPayAvailability => {
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        logger.log('[PLATFORM_PAY] Checking platform pay availability', {
          platform: Platform.OS,
        });

        // Check Apple Pay (iOS only)
        if (Platform.OS === 'ios') {
          const applePaySupported = await isPlatformPaySupported();
          setIsApplePaySupported(applePaySupported);
          logger.log('[APPLE_PAY] Availability check result:', {
            supported: applePaySupported,
          });
        } else {
          setIsApplePaySupported(false);
          logger.log('[APPLE_PAY] Not available on Android');
        }

        // Check Google Pay (Android only)
        if (Platform.OS === 'android') {
          const googlePaySupported = await isPlatformPaySupported({
            googlePay: { testEnv: __DEV__ },
          });
          setIsGooglePaySupported(googlePaySupported);
          logger.log('[GOOGLE_PAY] Availability check result:', {
            supported: googlePaySupported,
            testEnv: __DEV__,
          });
        } else {
          setIsGooglePaySupported(false);
          logger.log('[GOOGLE_PAY] Not available on iOS');
        }
      } catch (error) {
        logger.error('[PLATFORM_PAY] Error checking availability:', error);
        setIsApplePaySupported(false);
        setIsGooglePaySupported(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, []);

  return {
    isApplePaySupported,
    isGooglePaySupported,
    isLoading,
  };
};
