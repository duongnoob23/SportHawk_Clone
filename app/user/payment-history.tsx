import {
  ShFilterDropdown,
  ShIcon,
  ShLoadingSpinner,
  ShScreenContainer,
  ShScreenHeader,
  ShSpacer,
  ShText,
} from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShPaymentHistoryCard } from '@top/components/ShPaymentHistoryCard';
import { PaymentUIConstants } from '@top/features/payments/constants';
import { usePaymentHistoryStore } from '@top/stores/paymentHistoryStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useUser } from '@hks/useUser';
import { logger } from '@lib/utils/logger';
import { useTimeFilter } from '@top/hooks/useTimeFilter';

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { payments, isLoading, error, sortBy, fetchPaymentHistory, setSortBy } =
    usePaymentHistoryStore();
  const {
    currentFilter,
    handleFilterChange,
    toggleDropdown,
    isDropdownOpen,
    filterOptions,
  } = useTimeFilter({
    initialFilter: 'recent',
    visibleOptions: ['recent', 'oldest', 'amount_high', 'amount_low'],
  });

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setSortBy(currentFilter);
  }, [currentFilter, setSortBy]);

  useEffect(() => {
    logger.log('[USR-003] Payment history screen mounted', {
      userId: user?.id,
      userEmail: user?.email,
    });
    if (user?.id) {
      logger.log('[USR-003] Fetching payment history for user:', user.id);
      fetchPaymentHistory(user.id);
    } else {
      logger.warn(
        '[USR-003] No user ID available, cannot fetch payment history'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleRefresh = async () => {
    logger.log('[USR-003] User initiated pull-to-refresh');
    setRefreshing(true);
    if (user?.id) {
      logger.debug('[USR-003] Refreshing payment history for user:', user.id);
      await fetchPaymentHistory(user.id);
      logger.log(
        '[USR-003] Payment history refreshed, count:',
        payments.length
      );
    }
    setRefreshing(false);
  };

  const handlePaymentPress = (paymentId: string) => {
    logger.log(
      '[USR-003] User tapped payment card, navigating to detail:',
      paymentId
    );
    router.push(`/user/payment/${paymentId}`);
  };

  if (isLoading && !refreshing) {
    logger.debug('[USR-003] Showing loading state');
    return (
      <>
        <ShScreenContainer>
          <View style={styles.loadingContainer}>
            <ShLoadingSpinner size="large" />
            <ShText
              variant={ShTextVariant.Small}
              color={colorPalette.textSecondary}
            >
              Loading payment history...
            </ShText>
          </View>
        </ShScreenContainer>
      </>
    );
  }

  logger.debug(
    '[USR-003] Rendering payment list with',
    payments.length,
    'items'
  );

  return (
    <>
      <ShScreenHeader
        title="Payment History"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: () => router.back(),
        }}
      />
      <ShScreenContainer>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colorPalette.primary}
            />
          }
        >
          <ShSpacer size={spacing.xxl} />
          <View style={styles.header}>
            <ShText variant={ShTextVariant.Subheading}>Payment History</ShText>

            <ShFilterDropdown
              currentFilter={currentFilter}
              options={filterOptions}
              onFilterChange={handleFilterChange}
              isOpen={isDropdownOpen}
              onToggle={toggleDropdown}
              testID="time-filter-dropdown"
            />
          </View>

          <ShSpacer size={spacing.xxl} />

          {error && (
            <View style={styles.errorContainer}>
              <ShText variant={ShTextVariant.Body} color={colorPalette.error}>
                {error}
              </ShText>
              <TouchableOpacity
                onPress={() => user?.id && fetchPaymentHistory(user.id)}
                style={styles.retryButton}
              >
                <ShText
                  variant={ShTextVariant.Body}
                  color={colorPalette.primary}
                >
                  Retry
                </ShText>
              </TouchableOpacity>
            </View>
          )}

          {payments.length === 0 ? (
            <View style={styles.emptyState}>
              <ShIcon
                name={IconName.Receipt}
                size={PaymentUIConstants.ICON_SIZE_LARGE}
                color={colorPalette.textSecondary}
              />
              <ShText
                variant={ShTextVariant.Body}
                color={colorPalette.textSecondary}
              >
                No payment history yet
              </ShText>
              <ShText
                variant={ShTextVariant.Small}
                color={colorPalette.textSecondary}
              >
                Your completed payments will appear here
              </ShText>
            </View>
          ) : (
            <View style={styles.paymentList}>
              {payments.map(payment => (
                <View key={payment.id}>
                  <ShPaymentHistoryCard
                    payment={payment}
                    onPress={() => handlePaymentPress(payment.id)}
                  />
                  <ShSpacer size={spacing.md} />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </ShScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: colorPalette.paymentErrorContainerBg,
    borderRadius: PaymentUIConstants.ERROR_CONTAINER_BORDER_RADIUS,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical:
      spacing.xxl * PaymentUIConstants.EMPTY_STATE_PADDING_MULTIPLIER,
    gap: spacing.md,
  },
  paymentList: {
    gap: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colorPalette.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colorPalette.cardBackground,
    borderTopLeftRadius: PaymentUIConstants.CARD_BORDER_RADIUS * 2,
    borderTopRightRadius: PaymentUIConstants.CARD_BORDER_RADIUS * 2,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    padding: spacing.lg,
    borderBottomWidth: PaymentUIConstants.CARD_BORDER_WIDTH,
    borderBottomColor: colorPalette.paymentCardBorder,
    alignItems: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  modalOptionActive: {
    backgroundColor: colorPalette.paymentOptionActiveBg,
  },
  modalCancel: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderTopWidth: PaymentUIConstants.CARD_BORDER_WIDTH,
    borderTopColor: colorPalette.paymentCardBorder,
  },
});
