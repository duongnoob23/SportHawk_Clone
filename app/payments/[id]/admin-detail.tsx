import {
  type DropdownItem,
  ShAdminPaymentMemberItem,
  ShAmountDisplay,
  ShDropdownMenu,
  ShDueDateBanner,
  ShLoadingSpinner,
  ShPaymentStatusBadge,
  ShScreenHeader,
  ShSectionContent,
  ShSpacer,
  ShText,
} from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { usePaymentReminderNotification } from '@hks/useNotifications';
import { usePaymentMemberSort } from '@hks/usePaymentMemberSort';
import { logger } from '@lib/utils/logger';
import { useGetPaymentRequestWithMembers } from '@top/features/payments';
import { getDaysUntilDue } from '@top/features/payments/constants/paymentUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminPaymentDetailScreen() {
  const { id: paymentId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { mutateAsync: sendPaymentReminder } = usePaymentReminderNotification();

  const {
    data: paymentData,
    isLoading,
    error,
    refetch,
  } = useGetPaymentRequestWithMembers(paymentId || '');

  // Transform payment members to camelCase format for the sort hook
  const paymentMembers = useMemo(() => {
    if (!paymentData?.paymentRequestMembers) return [];

    return paymentData.paymentRequestMembers.map(member => ({
      userId: member.userId,
      name: `${member.profiles?.firstName || ''} ${member.profiles?.lastName || ''}`.trim(),
      avatarUrl: member.profiles?.profilePhotoURI || null,
      paymentStatus: member.paymentStatus,
      amountPence: member.amountPaidPence || paymentData.amountPence,
      paidAt: member.paidAt,
    }));
  }, [paymentData]);

  // Use custom sort hook
  const {
    sortBy,
    sortedMembers,
    isDropdownOpen,
    toggleDropdown,
    handleSortChange,
    sortOptions,
  } = usePaymentMemberSort({
    members: paymentMembers,
  });

  const handleRefresh = async () => {
    logger.log('[PAY-007] User action: pull_to_refresh');
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSendReminders = async () => {
    const unpaidMembers = paymentMembers.filter(
      m => m.paymentStatus === 'unpaid'
    );

    if (unpaidMembers.length === 0) {
      Alert.alert('No Reminders Needed', 'All members have already paid');
      return;
    }

    Alert.alert(
      'Send Reminders',
      `Send payment reminders to ${unpaidMembers.length} unpaid members?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              logger.log('[PAY-007] Send reminders requested', {
                paymentId,
                count: unpaidMembers.length,
              });

              // Send reminders to all unpaid members
              const memberIds = unpaidMembers.map(m => m.userId);

              const results = await Promise.allSettled(
                memberIds.map(userId =>
                  sendPaymentReminder({
                    userId,
                    paymentRequestId: paymentId!,
                    amount: paymentData?.amountPence || 0,
                    description: paymentData?.title || 'Payment',
                    daysUntilDue: getDaysUntilDue(paymentData?.dueDate),
                    paymentTitle: paymentData?.title!,
                  })
                )
              );

              const successful = results.filter(
                r => r.status === 'fulfilled'
              ).length;
              const failed = results.filter(
                r => r.status === 'rejected'
              ).length;

              if (successful > 0) {
                const reminderText = failed === 1 ? 'reminder' : 'reminders';
                const failedMessage =
                  failed > 0
                    ? ` ${failed} ${reminderText} could not be sent.`
                    : '';

                Alert.alert(
                  'Reminders Sent',
                  `Successfully sent ${successful} payment reminder${successful === 1 ? '' : 's'}.${failedMessage}`
                );
              } else {
                Alert.alert(
                  'No Reminders Sent',
                  'All members have been reminded within the last 24 hours.'
                );
              }
            } catch (error) {
              logger.error('[PAY-007] Send reminders error:', error);
              Alert.alert(
                'Error',
                'Failed to send payment reminders. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleEditPaymentRequest = () => {
    router.push(`/payments/${paymentId}/edit`);
  };

  const handleMemberPress = (userId: string) => {
    const member = paymentMembers.find(m => m.userId === userId);
    if (member?.paymentStatus === 'unpaid') {
      Alert.alert(
        'Send Individual Reminder',
        `Send reminder to ${member.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send',
            onPress: async () => {
              try {
                logger.log('[PAY-007] Individual reminder requested:', {
                  userId,
                });

                try {
                  await sendPaymentReminder({
                    userId,
                    paymentRequestId: paymentId!,
                    amount: member.amountPence,
                    description: paymentData?.title || 'Payment',
                    daysUntilDue: getDaysUntilDue(paymentData?.dueDate),
                    paymentTitle: paymentData?.title || 'Payment',
                  });
                  Alert.alert(
                    'Reminder Sent',
                    `Payment reminder sent to ${member.name}.`
                  );
                } catch (reminderError) {
                  logger.error(
                    '[PAY-007] Individual reminder error:',
                    reminderError
                  );
                  Alert.alert(
                    'Error',
                    'Failed to send payment reminder. Please try again.'
                  );
                }
              } catch (error) {
                logger.error('[PAY-007] Individual reminder error:', error);
                Alert.alert(
                  'Error',
                  'Failed to send payment reminder. Please try again.'
                );
              }
            },
          },
        ]
      );
    }
  };

  const paidCount = paymentMembers.filter(
    m => m.paymentStatus === 'paid'
  ).length;
  const unpaidCount = paymentMembers.filter(
    m => m.paymentStatus === 'unpaid'
  ).length;

  // Create dropdown items
  const dropdownItems: DropdownItem[] = [
    {
      id: 'send_reminders',
      label: 'Send Reminders',
      icon: IconName.Bell,
      onPress: handleSendReminders,
    },
    {
      id: 'edit_payment',
      label: 'Edit Payment Request',
      icon: IconName.EditPen,
      onPress: handleEditPaymentRequest,
    },
  ];

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colorPalette.baseDark,
          marginBottom: insets.bottom,
        }}
      >
        <ShScreenHeader
          title="Payment Details"
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft,
            onPress: () => router.back(),
          }}
        />
        <ShLoadingSpinner text="Loading payment details..." />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colorPalette.baseDark,
          marginBottom: insets.bottom,
        }}
      >
        <ShScreenHeader
          title="Payment Details"
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft,
            onPress: () => router.back(),
          }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.xl,
          }}
        >
          <ShText
            variant={ShTextVariant.Body}
            style={{ color: colorPalette.error }}
          >
            {error?.message || 'Failed to load payment details'}
          </ShText>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, marginBottom: insets.bottom }}>
      <ShScreenHeader
        title="Payment Details"
        showBorder
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft,
          onPress: () => router.back(),
        }}
        rightAction={{
          type: 'icon',
          iconName: IconName.Edit,
          onPress: () => setShowDropdown(!showDropdown),
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colorPalette.white}
            colors={[colorPalette.white]}
          />
        }
      >
        <View style={{ padding: spacing.lg }}>
          <ShDropdownMenu
            items={dropdownItems}
            isVisible={showDropdown}
            onClose={() => setShowDropdown(false)}
            testID="payment-actions-dropdown"
          />
          <ShText
            variant={ShTextVariant.SubheadingTitle}
            style={{ color: colorPalette.white }}
          >
            {paymentData?.title}
          </ShText>

          <ShSpacer size={spacing.sm} />

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ShText
              variant={ShTextVariant.LabelLight}
              style={{ color: colorPalette.textSecondary }}
            >
              Requested by
            </ShText>
            {paymentData?.teams && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {paymentData.teams.teamPhotoUrl && (
                  <Image
                    source={{ uri: paymentData.teams.teamPhotoUrl }}
                    style={{
                      width: spacing.iconSizeMedium,
                      height: spacing.iconSizeMedium,
                      borderRadius: spacing.borderRadiusRound,
                      marginHorizontal: spacing.xs,
                    }}
                  />
                )}
                <ShText
                  variant={ShTextVariant.LabelLight}
                  style={{ color: colorPalette.textSecondary }}
                >
                  {paymentData.teams.name}
                </ShText>
              </View>
            )}
          </View>

          <ShSpacer size={spacing.xxl} />

          <ShDueDateBanner dueDate={paymentData?.dueDate || ''} />

          <ShSpacer size={spacing.xxl} />

          {paymentData?.description && (
            <>
              <ShSectionContent
                title="Description"
                content={paymentData.description}
                defaultContent="No description provided"
              />
              <ShSpacer size={spacing.lg} />
            </>
          )}

          <ShAmountDisplay amountPence={paymentData?.amountPence || 0} />

          <ShSpacer size={spacing.avatarSizeMedium2} />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <ShText
              variant={ShTextVariant.Heading}
              style={{ color: colorPalette.white }}
            >
              Responses
            </ShText>
          </View>

          <ShSpacer size={spacing.lgx} />

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <ShPaymentStatusBadge
              status="paid"
              count={paidCount}
              size="medium"
            />
            <ShPaymentStatusBadge
              status="unpaid"
              count={unpaidCount}
              size="medium"
            />
          </View>

          <ShSpacer size={spacing.lg} />

          {sortedMembers.length === 0 && (
            <View
              style={{
                paddingVertical: spacing.xl,
                alignItems: 'center',
              }}
            >
              <ShText
                variant={ShTextVariant.Body}
                style={{
                  color: colorPalette.textSecondary,
                  textAlign: 'center',
                }}
              >
                No members added to this payment request.
              </ShText>
            </View>
          )}

          {sortedMembers.length > 0 &&
            paidCount === paymentMembers.length &&
            paidCount > 0 && (
              <View
                style={{
                  paddingVertical: spacing.xl,
                  alignItems: 'center',
                }}
              >
                <ShText
                  variant={ShTextVariant.Body}
                  style={{
                    color: colorPalette.success,
                    textAlign: 'center',
                  }}
                >
                  ✅ All members have paid! Payment complete.
                </ShText>
              </View>
            )}

          <ShSpacer size={spacing.md} />

          {sortedMembers.length > 0 &&
            !(paidCount === paymentMembers.length && paidCount > 0) &&
            sortedMembers.map(member => (
              <ShAdminPaymentMemberItem
                key={member.userId}
                name={member.name}
                photoUri={member.avatarUrl}
                paymentStatus={member.paymentStatus}
                amount={member.amountPence}
                onPress={() => handleMemberPress(member.userId)}
                testID={`member-${member.userId}`}
              />
            ))}
        </View>
      </ScrollView>
    </View>
  );
}
