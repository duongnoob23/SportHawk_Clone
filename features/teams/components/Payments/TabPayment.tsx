import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { TimeFilterType, useTimeFilter } from '@hks/useTimeFilter';
import { ShFilterDropdown, ShIcon, ShSpacer, ShText } from '@top/components';
import { ShPaymentCard } from '@top/components/ShPaymentCard';
import { ShPaymentSummaryCard } from '@top/components/ShPaymentSummaryCard';
import {
  countRequiredUnpaid,
  filterPaymentRequests,
} from '@top/features/payments/utils';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PaymentFilter, PaymentRequest, UserTeam } from '../../types';
import { useUser } from '@top/hooks/useUser';
import { useTeamPaymentRequests } from '../../hooks/useTeamPaymentRequests';

type TabPaymentProps = {
  selectedTeam: UserTeam;
  handlePaymentPress: (paymentId: string) => void;
  handlePayNow: (paymentId: string) => void;
};

const TabPayment = ({
  selectedTeam,
  handlePaymentPress,
  handlePayNow,
}: TabPaymentProps) => {
  const {
    currentFilter,
    handleFilterChange,
    toggleDropdown,
    isDropdownOpen,
    filterOptions,
  } = useTimeFilter({
    initialFilter: 'next_30_days',
    visibleOptions: ['next_30_days', 'next_7_days', 'all'],
  });
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const { data: paymentRequestsData, isLoading: loadingPayments } =
    useTeamPaymentRequests(selectedTeam?.id, user?.id, currentFilter);

  const requiredUnpaidCount = useMemo(
    () => countRequiredUnpaid(paymentRequestsData ?? []),
    [paymentRequestsData]
  );

  const filteredPayments = useMemo(
    () => filterPaymentRequests(paymentRequestsData ?? [], paymentFilter),
    [paymentRequestsData, paymentFilter]
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ marginBottom: insets.bottom }}>
        {loadingPayments && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colorPalette.primaryGold} />
          </View>
        )}
        {!loadingPayments && (
          <View style={styles.paymentsContainer}>
            {requiredUnpaidCount > 0 && (
              <View style={styles.summaryCardWrapper}>
                <ShPaymentSummaryCard
                  count={requiredUnpaidCount}
                  onPress={() => setPaymentFilter('required')}
                />
              </View>
            )}

            <View style={styles.paymentSectionHeader}>
              <ShText
                variant={ShTextVariant.Subheading}
                style={styles.paymentSectionTitle}
              >
                Upcoming Payments
              </ShText>

              <ShFilterDropdown
                currentFilter={currentFilter}
                options={filterOptions}
                onFilterChange={handleFilterChange}
                isOpen={isDropdownOpen}
                onToggle={toggleDropdown}
                testID="time-filter-dropdown"
              />
            </View>

            {filteredPayments?.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View style={styles.emptyTabContent}>
                  <ShIcon
                    name={IconName.Card}
                    size={spacing.iconSizeXLarge}
                    color={colorPalette.primaryGold}
                  />
                  <ShSpacer size={spacing.lg} />
                  <ShText
                    variant={ShTextVariant.Subheading}
                    style={styles.centerText}
                  >
                    You don’t have any payments
                  </ShText>
                  <ShSpacer size={spacing.md} />
                  <ShText
                    variant={ShTextVariant.Body}
                    style={styles.centerText}
                  >
                    There aren’t any upcoming
                  </ShText>
                  <ShText
                    variant={ShTextVariant.Body}
                    style={styles.centerText}
                  >
                    payments at the moment
                  </ShText>
                </View>
              </View>
            ) : (
              <ScrollView
                style={styles.paymentList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.paymentListContent}
              >
                {filteredPayments?.map(payment => (
                  <ShPaymentCard
                    key={payment.id}
                    id={payment.id}
                    title={payment.title}
                    teamName={payment.teamName}
                    amountPence={payment.amountPence}
                    dueDate={payment.dueDate}
                    paymentType={payment.paymentType}
                    paymentStatus={payment.paymentStatus}
                    onPress={() => handlePaymentPress(payment.id)}
                    onPayPress={() => handlePayNow(payment.id)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: spacing.emptyStateVerticalPadding,
    alignItems: 'center',
  },
  loadingText: {
    color: colorPalette.stoneGrey,
  },
  membersButton: {
    backgroundColor: colorPalette.primaryGold,
    height: spacing.buttonHeightMedium,
    borderRadius: spacing.eventButtonBorderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  membersButtonText: {
    color: colorPalette.baseDark,
  },
  membersButtonSecondary: {
    backgroundColor: `rgba(158, 155, 151, 0.2)`,
    height: spacing.buttonHeightMedium,
    borderRadius: spacing.eventButtonBorderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  membersButtonTextSecondary: {
    color: colorPalette.textLight,
  },
  rsvpStatusText: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  // Payment styles
  paymentsContainer: {
    marginTop: spacing.xxl,
    flex: 1,
  },
  summaryCardWrapper: {
    marginBottom: spacing.xxl,
  },
  paymentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentSectionTitle: {
    color: colorPalette.lightText,
    letterSpacing: -0.04,
  },
  paymentList: {
    flex: 1,
  },
  paymentListContent: {
    paddingBottom: 20,
    gap: 12,
  },
  emptyTabContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.emptyStateVerticalPadding,
  },
  centerText: {
    textAlign: 'center',
  },
});

export default TabPayment;
