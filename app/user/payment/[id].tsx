import {
  ShIcon,
  ShLoadingSpinner,
  ShScreenContainer,
  ShScreenHeader,
  ShText,
} from '@cmp/index';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontWeights, ShTextVariant } from '@con/typography';
import { paymentsApi } from '@lib/api/payments';
import { logger } from '@lib/utils/logger';
import { IconName } from '@top/constants/icons';
import { PaymentStatusConfig } from '@top/constants/payments';
import {
  formatCurrency,
  formatPaymentDateTime,
  PaymentUIConstants,
} from '@top/features/payments/constants';
import { PaymentHistoryStatusType } from '@top/features/payments/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

interface PaymentDetail {
  id: string;
  title: string;
  team_name: string;
  amount_pence: number;
  payment_date: string;
  status: PaymentHistoryStatusType;
  description: string;
  requested_by: {
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  transaction_fee_pence?: number;
  net_amount_pence?: number;
  stripe_payment_intent_id?: string;
}

export default function PaymentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      logger.log('[USR-003] Payment detail screen mounted for:', id);
      fetchPaymentDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPaymentDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug('[USR-003] Fetching payment detail for ID:', id);
      const data = await paymentsApi.getPaymentHistoryDetail(id as string);
      setPayment(data);
      logger.log('[USR-003] Payment detail loaded successfully', {
        paymentId: data.id,
        title: data.title,
        amount: data.amount_pence,
        status: data.status,
      });
    } catch (err: any) {
      logger.error('[USR-003] Failed to load payment detail:', {
        paymentId: id,
        error: err.message,
      });
      setError(err.message || 'Failed to load payment details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    logger.debug('[USR-003] Showing payment detail loading state');
    return (
      <>
        <ShScreenHeader
          title="Payment Details"
          showBorder={true}
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
            onPress: () => router.back(),
          }}
        />
        <ShScreenContainer>
          <View style={styles.loadingContainer}>
            <ShLoadingSpinner size="large" />
            <ShText
              variant={ShTextVariant.Small}
              color={colorPalette.textSecondary}
            >
              Loading payment details...
            </ShText>
          </View>
        </ShScreenContainer>
      </>
    );
  }

  if (error || !payment) {
    logger.error('[USR-003] Payment detail error state:', error);
    return (
      <>
        <ShScreenHeader
          title="Payment Details"
          showBorder={true}
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
            onPress: () => router.back(),
          }}
        />
        <ShScreenContainer>
          <View style={styles.errorContainer}>
            <ShText variant={ShTextVariant.Body} color={colorPalette.error}>
              {error || 'Payment not found'}
            </ShText>
          </View>
        </ShScreenContainer>
      </>
    );
  }

  const formattedAmount = formatCurrency(payment.amount_pence);
  const formattedDateTime = formatPaymentDateTime(payment.payment_date);
  const statusConfig = PaymentStatusConfig[payment.status];

  logger.debug('[USR-003] Rendering payment detail for:', {
    paymentId: payment.id,
    title: payment.title,
    status: payment.status,
  });

  return (
    <>
      <ShScreenHeader
        title="Payment Details"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: () => router.back(),
        }}
      />
      <ShScreenContainer>
        <ScrollView style={styles.container}>
          <View style={styles.content}>
            {/* Payment Header */}
            <View style={styles.headerSection}>
              <ShText
                variant={ShTextVariant.SubHeading}
                style={{
                  color: colorPalette.textLight,
                  fontSize: spacing.xl,
                  fontWeight: fontWeights.medium,
                }}
              >
                {payment.title}
              </ShText>
              <View style={styles.requestedBy}>
                <ShText
                  variant={ShTextVariant.Label}
                  color={colorPalette.textSecondary}
                  style={{
                    fontSize: spacing.mdx,
                    fontWeight: fontWeights.regular,
                  }}
                >
                  Requested by
                </ShText>
                <View style={styles.requesterInfo}>
                  {payment.requested_by.avatar_url && (
                    <Image
                      source={{ uri: payment.requested_by.avatar_url }}
                      style={styles.avatar}
                    />
                  )}
                  <ShText
                    variant={ShTextVariant.Label}
                    color={colorPalette.textSecondary}
                    style={{
                      fontSize: spacing.mdx,
                      fontWeight: fontWeights.regular,
                    }}
                  >
                    {payment.team_name}
                  </ShText>
                </View>
              </View>
            </View>

            {/* Status Card */}
            <View
              style={[
                styles.statusCard,
                { backgroundColor: statusConfig.backgroundColor },
              ]}
            >
              <View style={styles.statusRow}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ShIcon
                    name={IconName.Tick}
                    size={PaymentUIConstants.ICON_SIZE_MEDIUM}
                    color={statusConfig.textColor}
                  />
                  <ShText> </ShText>
                  <ShText
                    variant={ShTextVariant.Body}
                    color={statusConfig.textColor}
                  >
                    {statusConfig.label}
                  </ShText>
                </View>
                <View>
                  <ShText
                    variant={ShTextVariant.Body}
                    color={statusConfig.textColor}
                  >
                    {formattedDateTime}
                  </ShText>
                </View>
              </View>
            </View>

            {/* Description Section */}
            {payment.description && (
              <View style={styles.descriptionSection}>
                <ShText variant={ShTextVariant.Subheading}>Description</ShText>
                <ShText
                  variant={ShTextVariant.Body}
                  color={colorPalette.textSecondary}
                  style={styles.descriptionText}
                >
                  {payment.description}
                </ShText>
              </View>
            )}

            {/* Total Card */}
            <View style={styles.totalCard}>
              <ShText variant={ShTextVariant.Body}>Total</ShText>
              <ShText variant={ShTextVariant.Subheading}>
                {formattedAmount}
              </ShText>
            </View>

            {/* Transaction Details (if available) */}
            {/* {(payment.transaction_fee_pence !== undefined ||
              payment.stripe_payment_intent_id) && (
              <View style={styles.transactionDetails}>
                {payment.transaction_fee_pence !== undefined && (
                  <>
                    <View style={styles.detailRow}>
                      <ShText
                        variant={ShTextVariant.Small}
                        color={colorPalette.textSecondary}
                      >
                        Transaction Fee:
                      </ShText>
                      <ShText
                        variant={ShTextVariant.Small}
                        color={colorPalette.textSecondary}
                      >
                        {formatCurrency(payment.transaction_fee_pence)}
                      </ShText>
                    </View>
                    {payment.net_amount_pence !== undefined && (
                      <View style={styles.detailRow}>
                        <ShText
                          variant={ShTextVariant.Small}
                          color={colorPalette.textSecondary}
                        >
                          Net Amount:
                        </ShText>
                        <ShText
                          variant={ShTextVariant.Small}
                          color={colorPalette.textSecondary}
                        >
                          {formatCurrency(payment.net_amount_pence)}
                        </ShText>
                      </View>
                    )}
                  </>
                )}
                {payment.stripe_payment_intent_id && (
                  <View style={styles.detailRow}>
                    <ShText
                      variant={ShTextVariant.Small}
                      color={colorPalette.textSecondary}
                    >
                      Reference:
                    </ShText>
                    <ShText
                      variant={ShTextVariant.Small}
                      color={colorPalette.textSecondary}
                      numberOfLines={1}
                    >
                      {payment.stripe_payment_intent_id}
                    </ShText>
                  </View>
                )}
              </View>
            )} */}
          </View>
        </ScrollView>
      </ShScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  headerSection: {
    gap: spacing.md,
  },
  requestedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: PaymentUIConstants.AVATAR_SIZE,
    height: PaymentUIConstants.AVATAR_SIZE,
    borderRadius: PaymentUIConstants.AVATAR_BORDER_RADIUS_HALF,
  },
  statusCard: {
    padding: spacing.md,
    borderRadius: PaymentUIConstants.TOTAL_CARD_BORDER_RADIUS,
    borderWidth: PaymentUIConstants.CARD_BORDER_WIDTH,
    borderColor: 'transparent',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  descriptionSection: {
    // gap: spacing.sm,
  },
  descriptionText: {},
  totalCard: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colorPalette.paymentTotalCardBg,
    padding: spacing.md,
    borderRadius: PaymentUIConstants.TOTAL_CARD_BORDER_RADIUS,
  },
  transactionDetails: {
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: PaymentUIConstants.CARD_BORDER_WIDTH,
    borderTopColor: colorPalette.paymentCardBorder,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
