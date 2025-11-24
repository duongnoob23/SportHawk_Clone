import {
  ShAdminPaymentCard,
  ShIcon,
  ShLoadingSpinner,
  ShScreenHeader,
  ShSpacer,
  ShTeamHeader,
  ShText,
} from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { logger } from '@lib/utils/logger';
import { useAdminPaymentStore } from '@sto/adminPaymentStore';
import {
  formatPaymentDate,
  formatPaymentTime,
} from '@top/features/payments/constants';
import { usePaymentRequestTeams } from '@top/features/payments/hooks/usePaymentRequestTeams';
import { useTeams } from '@top/features/teams/hooks/useTeam';
import { TimeFilterType } from '@top/features/teams/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isPaymentDueWithinDays = (dueDate: string, days: number): boolean => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
};

export default function TeamAdminPaymentsScreen() {
  const { id: teamId } = useLocalSearchParams<{ id: string }>();
  const { isLoadingList, listError } = useAdminPaymentStore();
  const [eventFilter, setEventFilter] =
    useState<TimeFilterType>('next_30_days');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const getFilterLabel = (filter: TimeFilterType) => {
    switch (filter) {
      case 'next_week':
        return 'Next Week';
      case 'next_30_days':
        return 'Next 30 days';
      case 'all':
        return 'All';
    }
  };

  const { data: teamResponseData, isLoading: teamResponseLoading } =
    useTeams(teamId);

  const {
    data: requestPaymentTeamsData,
    isLoading: requestPaymentTeamsLoading,
    refetch: refetchRequestPaymentTeams,
  } = usePaymentRequestTeams(teamId);

  const teamData = useMemo(() => {
    if (teamResponseData) {
      return {
        name: teamResponseData.clubs.name,
        team_type: teamResponseData.name,
        logo_url: teamResponseData.clubs.clubBadgeUrl,
      };
    }
  }, [teamResponseData]);

  const filteredPaymentRequests = useMemo(() => {
    if (!requestPaymentTeamsData) return [];

    switch (eventFilter) {
      case 'next_week':
        return requestPaymentTeamsData.filter(payment =>
          isPaymentDueWithinDays(payment.due_date, 7)
        );
      case 'next_30_days':
        return requestPaymentTeamsData.filter(payment =>
          isPaymentDueWithinDays(payment.due_date, 30)
        );
      case 'all':
      default:
        return requestPaymentTeamsData;
    }
  }, [requestPaymentTeamsData, eventFilter]);

  const paymentRequests = useMemo(() => {
    if (requestPaymentTeamsData) {
      return requestPaymentTeamsData;
    }
  }, [requestPaymentTeamsData]);

  const checkAdminPermission = useCallback(async () => {
    try {
      setIsAdmin(true);
    } catch (error) {
      logger.error('[PAY-007] Permission check failed:', error);
      Alert.alert('Error', 'Failed to verify permissions');
      router.back();
    } finally {
      setCheckingPermission(false);
    }
  }, [router]);

  useEffect(() => {
    logger.log('[PAY-007] Admin payment screen mounted');
    checkAdminPermission();
    return () => {
      logger.log('[PAY-007] Admin payment screen unmounted');
    };
  }, [checkAdminPermission]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchRequestPaymentTeams();
    setIsRefreshing(false);
  };

  const handleManagePayment = (paymentId: string) => {
    router.push(`/payments/${paymentId}/admin-detail`);
  };

  if (
    checkingPermission ||
    isLoadingList ||
    teamResponseLoading ||
    requestPaymentTeamsLoading
  ) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colorPalette.baseDark,
          marginBottom: insets.bottom,
        }}
      >
        <ShScreenHeader
          title="Manage Payments"
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft,
            onPress: () => router.back(),
          }}
        />
        <ShLoadingSpinner text="Loading payment requests..." />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colorPalette.baseDark,
        paddingBottom: insets.bottom,
      }}
    >
      <ShScreenHeader
        title="Manage Payments"
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft,
          onPress: () => router.back(),
        }}
      />

      <View
        style={{
          paddingHorizontal: spacing.xl,
        }}
      >
        <ShTeamHeader
          teamName={teamData?.name || 'Team'}
          teamType={teamData?.team_type ?? undefined}
          logoUrl={teamData?.logo_url}
        />
      </View>

      <ShSpacer size={'xml'}></ShSpacer>

      <View
        style={{
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ShText
          variant={ShTextVariant.Subheading}
          style={{ color: colorPalette.white, fontSize: spacing.xl }}
        >
          {'All Payments'}
        </ShText>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterDropdownOpen(!filterDropdownOpen)}
        >
          <ShText variant={ShTextVariant.Body} style={styles.filterText}>
            {getFilterLabel(eventFilter)}
          </ShText>
          <ShIcon
            name={IconName.ChevronDown}
            size={spacing.iconSizeSmall}
            color={colorPalette.stoneGrey}
          />
        </TouchableOpacity>
        {filterDropdownOpen && (
          <View style={styles.filterDropdown}>
            {(['next_week', 'next_30_days', 'all'] as TimeFilterType[]).map(
              filter => (
                <TouchableOpacity
                  key={filter}
                  style={styles.filterDropdownItem}
                  onPress={() => {
                    setEventFilter(filter);
                    setFilterDropdownOpen(false);
                  }}
                >
                  <ShText
                    variant={ShTextVariant.Body}
                    style={[
                      styles.filterDropdownItemText,
                      eventFilter === filter &&
                        styles.filterDropdownItemTextActive,
                    ]}
                  >
                    {getFilterLabel(filter)}
                  </ShText>
                  {eventFilter === filter && (
                    <ShIcon
                      name={IconName.Checkmark}
                      size={spacing.iconSizeSmall}
                      color={colorPalette.primaryGold}
                    />
                  )}
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      </View>

      <ShSpacer size={'xml'}></ShSpacer>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colorPalette.primaryGold}
          />
        }
      >
        {paymentRequests && paymentRequests?.length === 0 ? (
          <View
            style={{
              paddingVertical: spacing.xxl * 2,
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
              No payment requests yet.{'\n'}
              Create your first request to start collecting payments.
            </ShText>
          </View>
        ) : (
          filteredPaymentRequests &&
          filteredPaymentRequests?.map(payment => (
            <ShAdminPaymentCard
              key={payment.id}
              id={payment.id}
              title={payment.title}
              amount={payment.amount_pence}
              dueDate={formatPaymentDate(payment.due_date)}
              dueTime={formatPaymentTime(payment.due_date)}
              paidCount={payment.paid_count}
              totalCount={payment.total_count}
              teamType={payment.teams?.name}
              onManage={() => handleManagePayment(payment.id)}
              testID={`payment-card-${payment.id}`}
            />
          ))
        )}

        <ShSpacer size={spacing.xl} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterDropdownItemText: {
    color: colorPalette.textLight,
  },
  filterDropdown: {
    position: 'absolute',
    top: spacing.xxxl,
    right: 0,
    backgroundColor: colorPalette.baseDark,
    borderRadius: spacing.borderRadiusMedium,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    zIndex: spacing.zIndexDropdown,
    minWidth: 150,
  },
  filterDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderSubtle,
  },
  filterDropdownItemTextActive: {
    color: colorPalette.primaryGold,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterText: {
    color: colorPalette.stoneGrey,
    fontSize: spacing.lg,
    fontWeight: '400',
  },
});
