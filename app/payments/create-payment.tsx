import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import {
  ShFormFieldChoice,
  ShFormFieldDateTime,
  ShFormFieldReadOnly,
  ShFormFieldText,
  ShFormFieldTextArea,
  ShLoadingSpinner,
  ShNavItem,
  ShPaymentAmountInput,
  ShScreenContainer,
  ShScreenHeader,
  ShSpacer,
  ShText,
} from '@cmp/index';

import { HeaderAction } from '@cmp/ShScreenHeader';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { usePaymentCreateNotification } from '@top/features/event/hooks/useNotification';
import { useTeamMembersWithTeamId } from '@top/features/event/hooks/useTeamMembersWithTeamId';
import {
  DEFAULT_PAYMENT_TYPE,
  getDaysUntilDue,
  PAYMENT_TYPES,
} from '@top/features/payments/constants';
import {
  useCreatePaymentRequest,
  useCreatePaymentRequestMembers,
  usePaymentForm,
  useSendPaymentNotifications,
} from '@top/features/payments/hooks';
import { paymentCaculationStripeFee } from '@top/features/payments/utils/paymentCaculationiStripeFee';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreatePaymentScreen() {
  const params = useLocalSearchParams<{
    teamId?: string;
    selectedTeam?: string;
  }>();
  const selectedTeam = useMemo(() => {
    if (!params?.selectedTeam) {
      return undefined;
    }
    try {
      return JSON.parse(params.selectedTeam);
    } catch {
      return undefined;
    }
  }, [params?.selectedTeam]);
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateField,
    clearForm,
    isFormValid,
    getValidationErrors,
    loading,
    stripeAccount,
    touchedFields,
    getDueByDefault,
    handleSelectMembers,
    markFieldAsTouched,
  } = usePaymentForm({ teamId: params.teamId || '' });

  const { data: teamMembersData } = useTeamMembersWithTeamId(params.teamId);

  const [submitted, setSubmitted] = useState(false);
  // Use mutations directly
  const {
    mutateAsync: createPaymentRequest,
    isPending: isCreatingPaymentRequest,
  } = useCreatePaymentRequest();
  const {
    mutateAsync: createPaymentRequestMembers,
    isPending: isCreatingMembers,
  } = useCreatePaymentRequestMembers();
  const { mutateAsync: sendNotifications, isPending: isSendingNotifications } =
    useSendPaymentNotifications();

  const {
    mutateAsync: sendCreatePaymentNoti,
    isPending: pendingCreatePaymentNoti,
  } = usePaymentCreateNotification();

  const submitting =
    isCreatingPaymentRequest || isCreatingMembers || isSendingNotifications;

  const handleSubmit = async () => {
    setSubmitted(true);

    if (!isFormValid()) {
      const errors = getValidationErrors();
      const firstError = Object.values(errors)[0];
      Alert.alert('Validation Error', String(firstError));
      return;
    }

    if (!stripeAccount) {
      Alert.alert('Error', 'Stripe account not configured');
      return;
    }
    try {
      if (!formData.amountPence) return;
      const { amountInPounds, transactionFee, total } =
        paymentCaculationStripeFee(formData.amountPence, true);

      console.log('JSON-MOUNT', amountInPounds, total);

      const paymentRequest = await createPaymentRequest({
        title: formData.title || '',
        description: formData.description,
        amountPence: amountInPounds || 0,
        dueDate: formData.dueDate || new Date().toISOString(),
        paymentType: formData.paymentType || DEFAULT_PAYMENT_TYPE,
        teamId: params.teamId || '',
        totalMembers: formData.selectedMembers?.length || 0,
      });
      // Step 2: Create payment request members
      if (
        formData.selectedMembers &&
        formData.selectedMembers.length > 0 &&
        formData
      ) {
        await createPaymentRequestMembers({
          paymentRequestId: paymentRequest.id,
          memberIds: formData.selectedMembers,
          amountPence: Math.round(total || 0),
        });
        // Step 3: Send notifications

        formData.selectedMembers.map(item => {
          sendCreatePaymentNoti({
            userId: item,
            amount: Math.round(total || 0),
            description: formData.description ?? undefined,
            daysOverdue: getDaysUntilDue(formData.dueDate),
            paymentId: paymentRequest.id,
            paymentTitle: paymentRequest.title!,
            clubName: selectedTeam?.club.name,
          });
        });
      }
      Alert.alert('Success', 'Payment request created successfully', [
        {
          text: 'OK',
          onPress: () => {
            clearForm();
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating payment request:', error);
      Alert.alert(
        'Error',
        'Failed to create payment request. Please try again.'
      );
    }
  };

  const leftAction: HeaderAction = {
    type: 'icon',
    iconName: IconName.ArrowLeft,
    onPress: () => router.back(),
  };

  const rightAction: HeaderAction = {
    type: submitting ? 'text' : 'text',
    text: 'Send',
    onPress: handleSubmit,
    disabled: loading || submitting,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ShScreenHeader
          title="Create Request"
          leftAction={leftAction}
          rightAction={{
            type: 'text',
            text: 'Send',
            onPress: handleSubmit,
          }}
        />
        <ShScreenContainer scrollable={false}>
          <ShLoadingSpinner />
        </ShScreenContainer>
      </View>
    );
  }

  return (
    <View style={[styles.container, { marginBottom: insets.bottom }]}>
      <ShScreenHeader
        title="Create Request"
        leftAction={leftAction}
        rightAction={{
          type: 'text',
          text: 'Send',
          onPress: handleSubmit,
        }}
      />
      <ShScreenContainer style={styles.screenContainer}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bottomOffset={insets.bottom}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          <ShSpacer size={spacing.xxl} />
          <ShFormFieldText
            label="Title"
            required
            value={formData.title || ''}
            onChangeText={text => updateField('title', text)}
            placeholder="Title"
            error={submitted ? getValidationErrors().title : undefined}
          />

          <ShFormFieldTextArea
            label="Description"
            value={formData.description || ''}
            onChangeText={text => updateField('description', text)}
            placeholder="Enter description"
            numberOfLines={4}
          />

          <ShSpacer size={spacing.xxl} />

          <ShFormFieldDateTime
            label="Due by"
            required
            value={formData.dueDate ? new Date(formData.dueDate) : null}
            onChange={date => updateField('dueDate', date.toISOString())}
            minimumDate={new Date()}
            defaultPickerValue={getDueByDefault()}
            error={submitted ? getValidationErrors().dueDate : undefined}
          />

          <ShSpacer size={spacing.xxl} />

          <ShFormFieldChoice
            label="Type"
            required
            options={PAYMENT_TYPES.map(type => ({
              label: type.label,
              value: type.value,
            }))}
            value={formData.paymentType || DEFAULT_PAYMENT_TYPE}
            onChangeValue={value => updateField('paymentType', value)}
          />

          <ShSpacer size={spacing.xxl} />

          {/* Members error message */}

          {/* Members selector */}
          <ShNavItem
            label={`Members ${formData.selectedMembers && formData.selectedMembers.length > 0 ? `(${formData.selectedMembers.length})` : '(0)'}`}
            subtitle={
              formData.selectedMembers && formData.selectedMembers.length > 0
                ? formData.selectedMembers.length ===
                  teamMembersData?.memberData.length
                  ? 'All team members selected'
                  : `${formData.selectedMembers.length} selected`
                : 'Select team members'
            }
            onPress={handleSelectMembers}
            required
            showDropdownIcon
            isSpaceBetweenNotColor={true}
          />

          <ShSpacer size={spacing.xs} />

          {submitted
            ? getValidationErrors().selectedMembers && (
                <ShText variant={ShTextVariant.Small} style={styles.errorText}>
                  {getValidationErrors().selectedMembers}
                </ShText>
              )
            : undefined}

          <ShSpacer size={spacing.xxl} />

          <ShFormFieldReadOnly
            label="Stripe ID"
            value={formData.stripeAccountId || 'Not configured'}
            showReadOnlyText
          />

          <ShSpacer size={spacing.xxl} />

          <ShPaymentAmountInput
            label="Amount"
            required
            value={formData.amountPence || 0}
            onChangeValue={pence => {
              markFieldAsTouched('amount');
              updateField('amountPence', pence);
            }}
            placeholder="Enter amount"
            error={submitted ? !!getValidationErrors().amount : undefined}
            errorMessage={
              touchedFields.has('amount')
                ? getValidationErrors().amount
                : undefined
            }
          />

          <ShSpacer size={spacing.xxl} />
          <View>
            <ShText
              style={{
                paddingHorizontal: spacing.xl,
              }}
              variant={ShTextVariant.SmallText}
            >
              Recipients will pay the total and will not see the transaction
              fee.{' '}
            </ShText>
          </View>
          <ShSpacer size={spacing.xxl} />
          <ShSpacer size={spacing.xxl} />
        </KeyboardAwareScrollView>
      </ShScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colorPalette.backgroundSecondary,
  },
  screenContainer: {
    paddingHorizontal: spacing.lg,
    borderTopColor: colorPalette.borderColorLight,
    borderTopWidth: 0.5,
    // paddingTop: spacing.xxl,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  errorText: {
    color: colorPalette.primaryGold,
    marginBottom: spacing.xs,
  },
});
