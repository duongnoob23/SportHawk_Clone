import {
  ShButton,
  ShFormFieldChoice,
  ShFormFieldDateTime,
  ShFormFieldReadOnly,
  ShFormFieldSelect,
  ShFormFieldText,
  ShFormFieldTextArea,
  ShLoadingSpinner,
  ShPaymentAmountInput,
  ShScreenHeader,
  ShSpacer,
  ShText,
} from '@cmp/index';
import { HeaderAction } from '@cmp/ShScreenHeader';
import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { logger } from '@lib/utils/logger';
import {
  usePaymentCancelNotification,
  usePaymentUpdateNotification,
} from '@top/features/event/hooks/useNotification';
import { PaymentTypeOption } from '@top/features/payments';
import {
  DEFAULT_PAYMENT_TYPE,
  PAYMENT_TYPES,
  PaymentLimits,
} from '@top/features/payments/constants';
import { isDueDatePast } from '@top/features/payments/constants/paymentUtils';
import { useGetTeamStripeAccount } from '@top/features/payments/hooks';
import { useCancelPaymentRequest } from '@top/features/payments/hooks/useCancelPaymentRequest';
import {
  useGetPaymentRequestWithMembers,
  useUpdatePaymentRequest,
} from '@top/features/payments/hooks/usePaymentRequest';
import { useUpdatePaymentRequestMembersByPaymentId } from '@top/features/payments/hooks/usePaymentRequestMember';
import { usePaymentRequestMemberSimple } from '@top/features/payments/hooks/usePaymentRequestMemberSimple';
import useEventFormStore from '@top/stores/eventFormStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PAYMENT_TYPE_OPTIONS = [
  { label: 'Required', value: 'required' },
  { label: 'Optional', value: 'optional' },
];

export default function EditPaymentRequestScreen() {
  const { id: paymentId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    updateInvitationMembers,
    updateRawInvitationMembers,
    clearFormEditEvent,
  } = useEventFormStore();

  const { formData: formDataMember } = useEventFormStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    paymentType: 'required',
    amountPence: 0,
  });

  const [selectedMembersCount, setSelectedMembersCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingPayments, setHasExistingPayments] = useState(false);
  const [userIds, setUserIds] = useState<string[]>([]);

  const {
    data: paymentData,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useGetPaymentRequestWithMembers(paymentId || '');

  const { mutateAsync: updatePaymentRequest, isError: errorPaymentRequest } =
    useUpdatePaymentRequest();

  const { mutateAsync: updatePaymentRequestMembers } =
    useUpdatePaymentRequestMembersByPaymentId();

  const { mutateAsync: cancelPaymentRequest } = useCancelPaymentRequest();

  const { mutateAsync: sendCancelPaymentNoti } = usePaymentCancelNotification();

  const {
    mutateAsync: sendPaymentUpdateNoti,
    isPending: pendingPaymentUpdateNoti,
  } = usePaymentUpdateNotification();

  const { data: stripeData } = useGetTeamStripeAccount(
    paymentData?.teamId || ''
  );

  const teamId = useMemo(() => {
    return paymentData?.teamId;
  }, [paymentData]);

  const {
    data: MemberData,
    isLoading: isLoadingMemberData,
    error: errorMemberData,
  } = usePaymentRequestMemberSimple({ teamId, paymentRequestId: paymentId });

  useEffect(() => {
    return () => {
      clearFormEditEvent();
    };
  }, []);

  useEffect(() => {
    if (MemberData?.memberData) {
      updateInvitationMembers(MemberData.memberData);
      updateRawInvitationMembers(MemberData.memberData);
    }
  }, [MemberData]);

  useEffect(() => {
    logger.log('[PAY-007] Edit payment screen mounted:', paymentId);
    return () => {
      logger.log('[PAY-007] Edit payment screen unmounted');
    };
  }, [paymentId]);

  useEffect(() => {
    if (paymentData) {
      setFormData({
        title: paymentData.title,
        description: paymentData.description || '',
        dueDate: new Date(paymentData.dueDate || ''),
        paymentType: paymentData.paymentType || 'required',
        amountPence: paymentData.amountPence,
      });

      const paidMembers =
        paymentData.paymentRequestMembers?.filter(
          m => m.paymentStatus === 'paid'
        ) || [];
      const memberIds = paymentData.paymentRequestMembers?.map(
        item => item.profiles!.id
      );
      if (memberIds) {
        setUserIds(memberIds);
      }
      setHasExistingPayments(paidMembers.length > 0);
      setSelectedMembersCount(paymentData.paymentRequestMembers?.length || 0);
    }
  }, [paymentData]);

  const selectMemberCountTwo = useMemo(() => {
    const count = formDataMember.invitationMembers?.reduce((acc, item) => {
      if (item.isChoose == true) {
        acc++;
      }
      return acc;
    }, 0);

    return count;
  }, [formDataMember]);

  const canEditAmountAndMembers = () => {
    return !isDueDatePast(paymentData?.dueDate);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    if (formData.amountPence < PaymentLimits.MIN_AMOUNT_PENCE) {
      Alert.alert(
        'Error',
        `Minimum amount is £${PaymentLimits.MIN_AMOUNT_PENCE / 100}`
      );
      return;
    }

    if (formData.amountPence > PaymentLimits.MAX_AMOUNT_PENCE) {
      Alert.alert(
        'Error',
        `Maximum amount is £${PaymentLimits.MAX_AMOUNT_PENCE / 100}`
      );
      return;
    }

    // Warn if changing amount after payments
    if (
      hasExistingPayments &&
      formData.amountPence !== paymentData?.amountPence
    ) {
      Alert.alert(
        'Warning',
        'Some members have already paid. Changing the amount will affect their payment status. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: performSave },
        ]
      );
    } else {
      performSave();
    }
  };

  const performSave = async () => {
    setIsSaving(true);
    logger.log('[PAY-007] Saving payment changes:', formData);

    try {
      await updatePaymentRequest({
        id: paymentId!,
        data: {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate.toISOString(),
          paymentType: formData.paymentType as PaymentTypeOption,
          amountPence: formData.amountPence,
        },
      });

      const addMember = formDataMember?.invitationMembers
        ?.filter(item => {
          const raw = formDataMember?.rawInvitationMembers?.find(
            r => r.userId === item.userId
          );
          return item.isChoose === true && raw?.isChoose === false;
        })
        .map(item => item.userId);
      const notChangeMember = formDataMember?.invitationMembers
        ?.filter(item => {
          const raw = formDataMember?.rawInvitationMembers?.find(
            r => r.userId === item.userId
          );
          return item.isChoose === true && raw?.isChoose === true;
        })
        .map(item => item.userId);

      const notiMember = [...(addMember || []), ...(notChangeMember || [])];

      if (formData.amountPence !== paymentData?.amountPence) {
        try {
          await updatePaymentRequestMembers({
            paymentRequestId: paymentId!,
            data: {
              amountPence: formData.amountPence,
            },
          });
          logger.log(
            '[PAY-007] Payment request members amount updated:',
            paymentId
          );
        } catch (memberUpdateError: any) {
          logger.error(
            '[PAY-007] Failed to update payment request members:',
            memberUpdateError
          );
        }
      }

      if (notiMember && notiMember.length > 0 && paymentData) {
        await Promise.all(
          notiMember.map(userId =>
            sendPaymentUpdateNoti({
              userId,
              amount: formData.amountPence,
              description: formData.description,
              paymentTitle: formData.title,
              paymentId: paymentData?.id!,
              updateReason: 'Payment updated by admin',
            })
          )
        );
      }

      Alert.alert('Success', 'Payment request updated');
      logger.log('[PAY-007] Payment updated:', paymentId);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update payment request');
      logger.error('[PAY-007] Update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment Request',
      'Are you sure you want to cancel this payment request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          onPress: async () => {
            try {
              // step 1: call api cancel event
              const reason = 'Because Android not display Alert';
              await cancelPaymentRequest({
                paymentRequestId: paymentId!,
                reason,
              });
              // step 2: call notification
              if (userIds && userIds.length > 0 && paymentData) {
                await Promise.all(
                  userIds.map(item => {
                    sendCancelPaymentNoti({
                      userId: item,
                      clubName: paymentData.teams!.clubs.name,
                      paymentTitle: paymentData.title,
                      paymentId: paymentData.id,
                    });
                  })
                );
              }
              Alert.alert(
                'Payment Cancelled',
                'The payment request has been cancelled successfully.'
              );
              // Navigate back to the payment list
              router.back();
            } catch (error) {
              logger.error('[PAY-007] Cancel payment error:', error);
              Alert.alert(
                'Error',
                'Failed to cancel payment request. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleMemberSelection = () => {
    if (!canEditAmountAndMembers()) {
      Alert.alert(
        'Cannot Edit Members',
        'Cannot edit members - due date has passed. Please adjust the due date to a future date first.'
      );
      return;
    }

    logger.log('[PAY-007] Navigating to member selection');
    router.push({
      pathname: '/payments/edit-members',
      params: {
        teamId: paymentData?.teamId,
        paymentId: paymentId,
        returnRoute: `/payments/${paymentId}/edit`,
      },
    });
  };

  const leftAction: HeaderAction = {
    type: 'icon',
    iconName: IconName.ArrowLeft,
    onPress: () => router.back(),
  };

  const rightAction: HeaderAction = {
    type: isSaving ? 'loading' : 'text',
    text: 'Save',
    onPress: () => {
      handleSave();
    },
    disabled: isSaving,
  };

  if (isLoadingDetail) {
    return (
      <View style={[styles.container, { marginBottom: insets.bottom }]}>
        <ShScreenHeader
          title="Edit Request"
          leftAction={leftAction}
          rightAction={rightAction}
        />
        <ShLoadingSpinner text="Loading payment details..." />
      </View>
    );
  }

  if (detailError) {
    return (
      <View style={[styles.container, { marginBottom: insets.bottom }]}>
        <ShScreenHeader
          title="Edit Request"
          leftAction={leftAction}
          rightAction={rightAction}
        />
        <View style={styles.errorContainer}>
          <ShText variant={ShTextVariant.Body} style={styles.errorText}>
            {detailError?.message || 'Failed to load payment details'}
          </ShText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { marginBottom: insets.bottom }]}>
      <ShScreenHeader
        title="Edit Request"
        leftAction={leftAction}
        rightAction={rightAction}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bottomOffset={insets.bottom}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + spacing.xxl,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ShFormFieldText
          label="Title"
          value={formData.title}
          onChangeText={text => setFormData({ ...formData, title: text })}
          placeholder="Enter payment title"
          required
        />

        <ShFormFieldTextArea
          label="Description"
          value={formData.description}
          onChangeText={text => setFormData({ ...formData, description: text })}
          placeholder="Enter payment description"
        />

        <ShSpacer size={spacing.xxl} />

        <ShFormFieldDateTime
          label="Due by"
          value={formData.dueDate}
          onChange={date => setFormData({ ...formData, dueDate: date })}
          required
        />

        {isDueDatePast(paymentData?.dueDate) && (
          <>
            <ShSpacer size={spacing.xxl} />
            <View style={styles.warningBanner}>
              <ShText
                variant={ShTextVariant.Caption}
                style={styles.warningText}
              >
                ⚠️ Due date has passed. Set a future date to edit amount or
                members.
              </ShText>
            </View>
          </>
        )}

        <ShSpacer size={spacing.xxl} />

        <ShFormFieldChoice
          label="Type"
          required
          options={PAYMENT_TYPES.map(type => ({
            label: type.label,
            value: type.value,
          }))}
          value={formData.paymentType || DEFAULT_PAYMENT_TYPE}
          onChangeValue={value =>
            setFormData({ ...formData, paymentType: value })
          }
        />

        <ShSpacer size={spacing.xxl} />

        <View
          style={[
            styles.disabledContainer,
            { opacity: canEditAmountAndMembers() ? 1 : 0.5 },
          ]}
        >
          <ShFormFieldSelect
            label="Members"
            value={`${selectMemberCountTwo} members selected`}
            onPress={handleMemberSelection}
            isRequired
            disabled={!canEditAmountAndMembers()}
          />
        </View>

        <ShSpacer size={spacing.xxl} />

        <ShFormFieldReadOnly
          label="Stripe ID"
          value={stripeData?.stripeAccountId || 'Not configured'}
          showReadOnlyText
        />

        <ShSpacer size={spacing.xxl} />

        <View
          style={[
            styles.disabledContainer,
            { opacity: canEditAmountAndMembers() ? 1 : 0.5 },
          ]}
        >
          <ShPaymentAmountInput
            label="Amount"
            value={formData.amountPence}
            onChangeValue={value =>
              setFormData({ ...formData, amountPence: value })
            }
            editable={canEditAmountAndMembers()}
          />
        </View>

        <ShSpacer size={spacing.xxl} />

        <ShButton
          title="Cancel Payment Request"
          onPress={handleCancel}
          variant={ShButtonVariant.Error}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colorPalette.error,
  },
  warningBanner: {
    backgroundColor: colorPalette.paymentDueDateBannerBg,
    padding: spacing.sm,
    borderRadius: spacing.borderRadiusSmall,
  },
  warningText: {
    color: colorPalette.warning,
  },
  disabledContainer: {
    // Base style for disabled containers
  },
});
