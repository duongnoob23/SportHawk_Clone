import { HeaderAction } from '@cmp/ShScreenHeader';
import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { useUser } from '@hks/useUser';
import {
  ShAmountDisplay,
  ShButton,
  ShDueDateBanner,
  ShErrorMessage,
  ShLoadingSpinner,
  ShPaymentTitle,
  ShScreenContainer,
  ShScreenHeader,
  ShSectionContent,
  ShSpacer,
} from '@top/components';
import {
  usePaymentFailNotification,
  usePaymentReceivedNotification,
  usePaymentSuccessNotification,
} from '@top/features/event/hooks/useNotification';
import {
  PaymentButtons,
  PaymentErrorBanner,
  PaymentSuccessBanner,
} from '@top/features/payments/components';
import { PAYMENT_FLOW_STATUS } from '@top/features/payments/constants';
import {
  useGetPaymentRequestById,
  useGetPaymentRequestMember,
  usePaymentProcessing,
} from '@top/features/payments/hooks';
import { PaymentDetail } from '@top/features/payments/types';
import { transformPaymentRequestToDetail } from '@top/features/payments/utils/paymentTransformers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function PaymentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useUser();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const {
    data: paymentRequest,
    isLoading: isLoadingPaymentRequest,
    error: paymentRequestError,
  } = useGetPaymentRequestById(id);

  const {
    data: paymentMember,
    isLoading: isLoadingPaymentMember,
    error: paymentMemberError,
  } = useGetPaymentRequestMember(id, currentUser?.id || '');

  // Transform data to UI format
  const paymentDetail: PaymentDetail | null = (() => {
    if (paymentRequest && paymentMember) {
      return transformPaymentRequestToDetail(paymentRequest, paymentMember);
    }
    if (paymentRequest) {
      return transformPaymentRequestToDetail(paymentRequest, null);
    }
    return null;
  })();

  const {
    paymentStatus,
    errorMessage,
    handlePayment,
    handleRetryPayment,
    activePaymentMethod,
  } = usePaymentProcessing({ paymentDetail });

  const {
    mutateAsync: sendPaymentSuccessNoti,
    isPending: pendingPaymentSuccessNoti,
  } = usePaymentSuccessNotification();
  const {
    mutateAsync: sendPaymentFailNoti,
    isPending: pendingPaymentFailNoti,
  } = usePaymentFailNotification();
  const {
    mutateAsync: sendPaymentReceivedNoti,
    isPending: pendingPaymentReceivedNoti,
  } = usePaymentReceivedNotification();

  useEffect(() => {
    if (
      paymentStatus === PAYMENT_FLOW_STATUS.SUCCESS &&
      paymentDetail &&
      paymentRequest
    ) {
      const userId = user?.id;
      const memberFullName = `${user?.user_metadata.first_name} ${user?.user_metadata.last_name}`;
      if (userId && memberFullName) {
        sendPaymentSuccessNoti({
          userId,
          amount: paymentDetail.amountPence,
          description: paymentRequest.description!,
          paymentTitle: paymentRequest.title,
          paymentId: paymentRequest.id,
        });

        sendPaymentReceivedNoti({
          userId: paymentRequest.createdBy,
          amount: paymentRequest.amountPence,
          paymentTitle: paymentRequest.title!,
          paymentId: paymentRequest.id,
          memberFullName,
        });
      }
    }
  }, [paymentStatus]);

  useEffect(() => {
    if (
      paymentStatus === PAYMENT_FLOW_STATUS.ERROR &&
      paymentDetail &&
      paymentRequest
    ) {
      const userId = user?.id;
      const reason = 'Because ...';
      if (userId) {
        sendPaymentFailNoti({
          userId,
          amount: paymentDetail.amountPence,
          description: paymentRequest.description!,
          paymentId: paymentRequest.id,
          paymentTitle: paymentRequest.title,
          reason,
        });
      }
    }
  }, [paymentStatus]);

  const loading = isLoadingPaymentRequest || isLoadingPaymentMember;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <ShScreenContainer>
          <ShLoadingSpinner text="Loading payment details..." fullScreen />
        </ShScreenContainer>
      </SafeAreaView>
    );
  }

  if (!paymentDetail || paymentRequestError || paymentMemberError) {
    console.error(
      'Error loading payment data:',
      paymentRequestError || paymentMemberError
    );
    Alert.alert('Error', 'Unable to load payment details. Please try again.', [
      { text: 'OK', onPress: () => router.back() },
    ]);

    return (
      <View style={[{ marginBottom: insets.bottom, flex: 1 }]}>
        <ShScreenContainer>
          <ShSpacer size={spacing.xxxl} />
          <ShErrorMessage message="Payment not found" />
          <ShSpacer size={spacing.lg} />
          <ShButton
            title="Go Back"
            onPress={() => router.back()}
            variant={ShButtonVariant.Primary}
          />
        </ShScreenContainer>
      </View>
    );
  }

  const leftAction: HeaderAction = {
    type: 'icon',
    iconName: IconName.ArrowLeft,
    onPress: () => router.back(),
  };

  return (
    <View style={[{ marginBottom: insets.bottom, flex: 1 }]}>
      <ShScreenHeader
        title="Payment Details"
        leftAction={leftAction}
        // rightAction={rightAction}
        showBorder={true}
      />

      <ShScreenContainer>
        <View style={styles.safeArea}>
          <ShPaymentTitle
            title={paymentDetail.title}
            teamName={paymentDetail.team.name}
            teamImageUrl={paymentDetail.team.imageUrl}
          />

          <ShSpacer size={spacing.lg} />

          <ShDueDateBanner dueDate={paymentDetail.dueDate} />

          <ShSpacer size={spacing.lg} />

          <ShSectionContent
            title="Description"
            content={paymentDetail.description}
            defaultContent="No description provided"
          />

          <ShSpacer size={spacing.avatarSizeMedium2} />

          <ShAmountDisplay
            amountPence={paymentDetail.amountPence}
            label="Total"
          />

          <ShSpacer size={spacing.avatarSizeMedium2} />

          {paymentStatus === PAYMENT_FLOW_STATUS.SUCCESS && (
            <PaymentSuccessBanner />
          )}

          {paymentStatus === PAYMENT_FLOW_STATUS.ERROR && (
            <PaymentErrorBanner
              errorMessage={errorMessage}
              onRetry={handleRetryPayment}
            />
          )}

          {paymentStatus !== PAYMENT_FLOW_STATUS.ERROR &&
            paymentStatus !== PAYMENT_FLOW_STATUS.SUCCESS && (
              <PaymentButtons
                paymentStatus={paymentStatus}
                userPaymentStatus={paymentDetail.userPaymentStatus}
                onCardPayment={() => handlePayment('card')}
                onApplePayment={() => handlePayment('apple')}
                onGooglePayment={() => handlePayment('google')}
                activePaymentMethod={activePaymentMethod}
              />
            )}

          <ShSpacer size={spacing.xl} />
        </View>
      </ShScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colorPalette.baseDark,
  },
});
