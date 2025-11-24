import { useUser } from '@hks/useUser';
import { logger } from '@lib/utils/logger';
import {
  PlatformPay,
  usePlatformPay,
  useStripe,
} from '@stripe/stripe-react-native';
import {
  getPaymentErrorMessage,
  PAYMENT_FLOW_STATUS,
  PaymentStatus,
} from '@top/features/payments/constants';
import { PaymentDetail, PaymentFlowStatus } from '@top/features/payments/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useCreatePaymentIntent } from './usePaymentIntent';
import { useUpdatePaymentRequestMemberStatus } from './usePaymentRequestMember';

interface UsePaymentProcessingProps {
  paymentDetail: PaymentDetail | null;
}

export const usePaymentProcessing = ({
  paymentDetail,
}: UsePaymentProcessingProps) => {
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { confirmPlatformPayPayment } = usePlatformPay();
  const { user: currentUser } = useUser();

  const { mutateAsync: createPaymentIntent } = useCreatePaymentIntent();
  const { mutateAsync: updatePaymentStatus } =
    useUpdatePaymentRequestMemberStatus();

  const [paymentStatus, setPaymentStatus] = useState<PaymentFlowStatus>(
    PAYMENT_FLOW_STATUS.IDLE
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activePaymentMethod, setActivePaymentMethod] = useState<
    'card' | 'apple' | 'google' | null
  >(null);

  const handlePayment = async (paymentMethod: 'card' | 'apple' | 'google') => {
    console.log('[PAYMENT START] Payment initiated:', {
      method: paymentMethod,
      memberPaymentId: paymentDetail?.memberPaymentId,
      amount: paymentDetail?.amountPence,
      userId: currentUser?.id,
    });

    logger.log('[APPLE_PAY] Payment method selected:', paymentMethod);
    setActivePaymentMethod(paymentMethod);

    if (!paymentDetail?.memberPaymentId) {
      console.error('[PAYMENT VALIDATION] No memberPaymentId found');
      Alert.alert(
        'Error',
        'You are not assigned to this payment request. Please contact your team admin.'
      );
      return;
    }

    if (!currentUser) {
      console.error('[PAYMENT VALIDATION] No current user found');
      Alert.alert('Error', 'Please log in to make a payment.');
      return;
    }

    try {
      // Step 1: Update UI to processing
      console.log('[PAYMENT STATE] Changing status to CREATING_INTENT');
      setPaymentStatus(PAYMENT_FLOW_STATUS.CREATING_INTENT);
      setErrorMessage('');

      // Step 2: Create payment intent via mutation
      console.log('Creating payment intent with:', {
        paymentRequestMemberId: paymentDetail.memberPaymentId,
        amountPence: paymentDetail.amountPence,
        paymentRequestId: paymentDetail.id,
      });

      const paymentIntentResponse = await createPaymentIntent({
        paymentRequestMemberId: paymentDetail.memberPaymentId,
        amountPence: paymentDetail.amountPence,
        currency: 'gbp',
        paymentRequestId: paymentDetail.id,
        userId: currentUser.id,
        paymentMethodType: paymentMethod, // Track payment method type
      });

      console.log('Payment intent created:', paymentIntentResponse);

      // Step 3: Handle different payment methods
      if (paymentMethod === 'google') {
        // Use confirmPlatformPayPayment for Google Pay
        console.log('[GOOGLE_PAY] Using confirmPlatformPayPayment');
        console.log('[PAYMENT STATE] Changing status to SHEET_PRESENTED');
        setPaymentStatus(PAYMENT_FLOW_STATUS.SHEET_PRESENTED);

        const { error: googlePayError, paymentIntent: googlePayResult } =
          await confirmPlatformPayPayment(paymentIntentResponse.clientSecret, {
            googlePay: {
              testEnv: __DEV__,
              merchantName: 'SportHawk',
              merchantCountryCode: 'GB',
              currencyCode: 'GBP',
              billingAddressConfig: {
                format: 'Full' as any,
                isPhoneNumberRequired: false,
                isRequired: false,
              },
            },
          });

        if (googlePayError) {
          console.log('[GOOGLE_PAY] Payment error:', {
            code: googlePayError.code,
            message: googlePayError.message,
            type: googlePayError.type,
            isCancellation: googlePayError.code === 'Canceled',
          });

          if (googlePayError.code === 'Canceled') {
            console.log('[GOOGLE_PAY] User cancelled payment');
            setPaymentStatus(PAYMENT_FLOW_STATUS.IDLE);
            return;
          }
          throw googlePayError;
        }

        console.log(
          '[GOOGLE_PAY] Payment completed successfully:',
          googlePayResult
        );
      } else if (paymentMethod === 'apple') {
        // Use confirmPlatformPayPayment for Apple Pay
        console.log('[APPLE_PAY] Using confirmPlatformPayPayment');
        console.log('[PAYMENT STATE] Changing status to SHEET_PRESENTED');
        setPaymentStatus(PAYMENT_FLOW_STATUS.SHEET_PRESENTED);

        const { error: applePayError, paymentIntent: applePayResult } =
          await confirmPlatformPayPayment(paymentIntentResponse.clientSecret, {
            applePay: {
              merchantCountryCode: 'GB',
              currencyCode: 'GBP',
              requiredBillingContactFields: [],
              cartItems: [
                {
                  label: paymentDetail.title || 'Payment',
                  amount: (paymentDetail.amountPence / 100).toFixed(2),
                  paymentType: PlatformPay.PaymentType.Immediate,
                },
              ],
            },
          });

        if (applePayError) {
          console.log('[APPLE_PAY] Payment error:', {
            code: applePayError.code,
            message: applePayError.message,
            type: applePayError.type,
            isCancellation: applePayError.code === 'Canceled',
          });

          if (applePayError.code === 'Canceled') {
            console.log('[APPLE_PAY] User cancelled payment');
            setPaymentStatus(PAYMENT_FLOW_STATUS.IDLE);
            return;
          }
          throw applePayError;
        }

        console.log(
          '[APPLE_PAY] Payment completed successfully:',
          applePayResult
        );
      } else {
        // Use Mobile Payment Element for card payments only
        const initOptions = {
          paymentIntentClientSecret: paymentIntentResponse.clientSecret,
          merchantDisplayName: 'SportHawk',
          defaultBillingDetails: {
            name: currentUser.user_metadata?.full_name || '',
            email: currentUser.email || '',
          },
          returnURL: 'sporthawk://payment-return',
          allowsDelayedPaymentMethods: false,
        };

        console.log('[PAYMENT SHEET] Using standard card payment');

        console.log('[PAYMENT SHEET] Initializing with options:', {
          hasClientSecret: !!initOptions.paymentIntentClientSecret,
          merchantDisplayName: initOptions.merchantDisplayName,
          billingName: initOptions.defaultBillingDetails.name,
          billingEmail: initOptions.defaultBillingDetails.email,
          paymentMethod: paymentMethod,
        });

        const { error: initError } = await initPaymentSheet(initOptions);

        if (initError) {
          console.error('[PAYMENT SHEET] Init failed:', {
            code: initError.code,
            message: initError.message,
            localizedMessage: initError.localizedMessage,
            declineCode: initError.declineCode,
            type: initError.type,
          });
        } else {
          console.log('[PAYMENT SHEET] Successfully initialized');
        }

        if (initError) throw new Error(initError.message);

        // Step 4: Present payment sheet
        console.log('[PAYMENT STATE] Changing status to SHEET_PRESENTED');
        setPaymentStatus(PAYMENT_FLOW_STATUS.SHEET_PRESENTED);

        console.log('[PAYMENT SHEET] Presenting payment sheet to user');
        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          console.log('[PAYMENT SHEET] Present error:', {
            code: presentError.code,
            message: presentError.message,
            type: presentError.type,
            isCancellation: presentError.code === 'Canceled',
          });

          // User cancelled or error occurred
          if (presentError.code === 'Canceled') {
            console.log('[PAYMENT CANCELLED] User cancelled payment');
            setPaymentStatus(PAYMENT_FLOW_STATUS.IDLE);
            return;
          }
          throw presentError;
        }

        console.log('[PAYMENT SHEET] Payment sheet completed successfully');
      }

      // Step 5: Payment successful
      console.log('[PAYMENT SUCCESS] Payment completed, updating status');
      setPaymentStatus(PAYMENT_FLOW_STATUS.SUCCESS);

      // Update local state
      console.log('[DATABASE] Updating payment status to paid');
      await updatePaymentStatus({
        paymentRequestMemberId: paymentDetail.memberPaymentId,
        status: PaymentStatus.PAID,
      });
      console.log('[DATABASE] Payment status updated successfully');

      // Navigate back after short delay
      console.log('[NAVIGATION] Navigating back in 2 seconds');
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: unknown) {
      const err = error as Error & {
        name?: string;
        code?: string;
        type?: string;
        declineCode?: string;
        localizedMessage?: string;
        stripeErrorCode?: string;
      };
      console.error('[PAYMENT ERROR] Full error details:', {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        type: err?.type,
        declineCode: err?.declineCode,
        localizedMessage: err?.localizedMessage,
        stripeErrorCode: err?.stripeErrorCode,
        stack: err?.stack?.split('\n').slice(0, 3).join('\n'),
      });

      const errorMessage = getPaymentErrorMessage(error);
      console.log('[PAYMENT ERROR] User-facing message:', errorMessage);

      setPaymentStatus(PAYMENT_FLOW_STATUS.ERROR);
      setErrorMessage(errorMessage);
      setActivePaymentMethod(null);
    }
  };

  const handleRetryPayment = () => {
    console.log('[PAYMENT RETRY] User initiated retry');
    setPaymentStatus(PAYMENT_FLOW_STATUS.IDLE);
    setErrorMessage('');
    setActivePaymentMethod(null);
  };

  return {
    paymentStatus,
    errorMessage,
    handlePayment,
    handleRetryPayment,
    activePaymentMethod,
  };
};
