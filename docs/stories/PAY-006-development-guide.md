# PAY-006 Development Guide

**Story:** PAY-006 - Payment History (Member)  
**Sprint:** 16  
**Estimated Hours:** 8-12  
**Dependencies:** PAY-005 must be completed first

## Quick Start Checklist

- [ ] Read the main story document: `/docs/stories/PAY-006-payment-history.md`
- [ ] Review Figma designs: 559:7147 (list), 559:7357 (detail)
- [ ] Check Figma translation: `/docs/stories/PAY-006-figma-translation-layer.md`
- [ ] Ensure PAY-005 is complete and tested
- [ ] Set up local environment with test data
- [ ] Create feature branch: `feature/PAY-006-payment-history`

## File Structure

```
/app/
  user/
    payment-history.tsx     # List screen (NEW)
    payment/
      [id].tsx             # Detail screen (NEW)

/lib/
  api/
    payments.ts            # Update with new methods

/stores/
  paymentHistoryStore.ts   # State management (NEW)

/components/
  PaymentHistoryCard/      # Reusable card component (NEW)
    index.tsx
```

## Step-by-Step Implementation

### Step 1: Create Payment History API Methods

Update `/lib/api/payments.ts`:

```typescript
import { PaymentStatus, PaymentUIConstants } from '@/config/payments';
import { logger } from '@/lib/utils/logger';

// Add to existing paymentsApi object (note: it's paymentsApi not paymentApi)
export const paymentsApi = {
  // ... existing methods ...

  // Get user's payment history (limited to PAYMENT_HISTORY_LIMIT items)
  async getUserPaymentHistory(userId: string): Promise<PaymentHistoryItem[]> {
    const { data, error } = await supabase
      .from('payment_request_members')
      .select(
        `
        id,
        payment_request_id,
        amount_pence,
        payment_status,
        paid_at,
        stripe_payment_intent_id,
        payment_requests!inner (
          title,
          description,
          created_by,
          teams!inner (
            name
          )
        )
      `
      )
      .eq('user_id', userId)
      .eq('payment_status', PaymentStatus.PAID)
      .order('paid_at', { ascending: false })
      .limit(PaymentUIConstants.PAYMENT_HISTORY_LIMIT); // Use config constant - no pagination at MVP

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      title: item.payment_requests.title,
      team_name: item.payment_requests.teams.name,
      amount_pence: item.amount_pence,
      payment_date: item.paid_at,
      status: PaymentStatus.PAID,
      stripe_payment_intent_id: item.stripe_payment_intent_id,
    }));
  },

  // Get payment detail with transaction info
  async getPaymentHistoryDetail(paymentId: string): Promise<PaymentDetail> {
    const { data, error } = await supabase
      .from('payment_request_members')
      .select(
        `
        *,
        payment_requests!inner (
          title,
          description,
          created_by,
          teams!inner (
            name
          ),
          users!payment_requests_created_by_fkey (
            full_name,
            avatar_url
          )
        ),
        payment_transactions (
          amount_pence,
          platform_fee_pence,
          net_amount_pence,
          stripe_charge_id
        )
      `
      )
      .eq('id', paymentId)
      .single();

    if (error) {
      logger.error('[PAY-006] Failed to load payment detail:', error);
      throw error;
    }

    logger.log('[PAY-006] Payment detail loaded for:', paymentId);

    return {
      id: data.id,
      title: data.payment_requests.title,
      team_name: data.payment_requests.teams.name,
      amount_pence: data.amount_pence,
      payment_date: data.paid_at,
      status: data.payment_status,
      description: data.payment_requests.description,
      requested_by: {
        name: data.payment_requests.users.full_name,
        avatar_url: data.payment_requests.users.avatar_url,
      },
      created_at: data.created_at,
      transaction_fee_pence: data.payment_transactions?.[0]?.platform_fee_pence,
      net_amount_pence: data.payment_transactions?.[0]?.net_amount_pence,
      stripe_payment_intent_id: data.stripe_payment_intent_id,
    };
  },
};
```

### Step 2: Create Payment History Store

Create `/stores/paymentHistoryStore.ts`:

```typescript
import { create } from 'zustand';
import { paymentsApi } from '@/lib/api/payments'; // Note: paymentsApi not paymentApi

interface PaymentHistoryStore {
  payments: PaymentHistoryItem[];
  isLoading: boolean;
  error: string | null;
  sortBy: 'recent' | 'oldest' | 'amount_high' | 'amount_low';

  fetchPaymentHistory: (userId: string) => Promise<void>;
  setSortBy: (sort: PaymentHistoryStore['sortBy']) => void;
  clearHistory: () => void;
}

export const usePaymentHistoryStore = create<PaymentHistoryStore>(
  (set, get) => ({
    payments: [],
    isLoading: false,
    error: null,
    sortBy: 'recent',

    fetchPaymentHistory: async (userId: string) => {
      set({ isLoading: true, error: null });
      try {
        const data = await paymentsApi.getUserPaymentHistory(userId);
        set({ payments: data, isLoading: false });
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },

    setSortBy: sortBy => {
      set({ sortBy });
      const { payments } = get();

      const sorted = [...payments].sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return (
              new Date(b.payment_date).getTime() -
              new Date(a.payment_date).getTime()
            );
          case 'oldest':
            return (
              new Date(a.payment_date).getTime() -
              new Date(b.payment_date).getTime()
            );
          case 'amount_high':
            return b.amount_pence - a.amount_pence;
          case 'amount_low':
            return a.amount_pence - b.amount_pence;
          default:
            return 0;
        }
      });

      set({ payments: sorted });
    },

    clearHistory: () => set({ payments: [], error: null }),
  })
);
```

### Step 3: Create Payment History Card Component

Create `/components/PaymentHistoryCard/index.tsx`:

```typescript
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ShText, ShIcon, ShTextVariant, IconName } from '@/components';
import { colorPalette } from '@/config/colors';
import { spacing } from '@/config/spacing';
import { format } from 'date-fns';

interface PaymentHistoryCardProps {
  payment: PaymentHistoryItem;
  onPress: () => void;
}

export const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({
  payment,
  onPress
}) => {
  const formattedAmount = `£${(payment.amount_pence / 100).toFixed(2)}`;
  const formattedDate = format(new Date(payment.payment_date), 'EEEE, MMM d');
  const formattedTime = format(new Date(payment.payment_date), 'HH:mm');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.header}>
        <View style={styles.info}>
          <ShText variant={ShTextVariant.Body}>
            {payment.title}
          </ShText>
          <ShText
            variant={ShTextVariant.Small}
            color={colorPalette.textSecondary}
          >
            {payment.team_name}
          </ShText>
        </View>
        <View style={styles.amountBadge}>
          <ShText variant={ShTextVariant.Small}>
            {formattedAmount}
          </ShText>
        </View>
      </View>

      <View style={styles.dateRow}>
        <ShIcon
          name={IconName.Calendar}
          size={14}
          color={colorPalette.textSecondary}
        />
        <ShText
          variant={ShTextVariant.Body}
          color={colorPalette.textSecondary}
        >
          {formattedDate}
        </ShText>
        <ShIcon
          name={IconName.Clock}
          size={16}
          color={colorPalette.textSecondary}
        />
        <ShText
          variant={ShTextVariant.Body}
          color={colorPalette.textSecondary}
        >
          {formattedTime}
        </ShText>
      </View>

      <TouchableOpacity style={styles.viewButton} onPress={onPress}>
        <ShText
          variant={ShTextVariant.Button}
          color={colorPalette.background}
        >
          View Payment
        </ShText>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(158, 155, 151, 0.2)',
    gap: spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  info: {
    flex: 1,
    gap: spacing.xs
  },
  amountBadge: {
    backgroundColor: 'rgba(158, 155, 151, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PaymentUIConstants.ROW_GAP
  },
  viewButton: {
    backgroundColor: colorPalette.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs
  }
});
```

### Step 4: Implement Payment History List Screen

Create `/app/user/payment-history.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActionSheetIOS,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { usePaymentHistoryStore } from '@/stores/paymentHistoryStore';
import { PaymentHistoryCard } from '@/components/PaymentHistoryCard';
import { ShText, ShIcon, ShTextVariant, IconName, ShActivityIndicator } from '@/components';
import { colorPalette } from '@/config/colors';
import { spacing } from '@/config/spacing';

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { user } = useUser();
  const {
    payments,
    isLoading,
    error,
    sortBy,
    fetchPaymentHistory,
    setSortBy
  } = usePaymentHistoryStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPaymentHistory(user.id);
    }
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentHistory(user.id);
    setRefreshing(false);
  };

  const handleSort = () => {
    const options = ['Most Recent', 'Oldest First', 'Amount: High to Low', 'Amount: Low to High', 'Cancel'];
    const sortValues = ['recent', 'oldest', 'amount_high', 'amount_low'] as const;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 4
        },
        (buttonIndex) => {
          if (buttonIndex < 4) {
            setSortBy(sortValues[buttonIndex]);
          }
        }
      );
    } else {
      // Android: Use a modal or custom dropdown
      // Implementation depends on your UI library
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'recent': return 'Most Recent';
      case 'oldest': return 'Oldest First';
      case 'amount_high': return 'Amount: High to Low';
      case 'amount_low': return 'Amount: Low to High';
      default: return 'Most Recent';
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ShActivityIndicator size="large" />
        <ShText variant={ShTextVariant.Small} color={colorPalette.textSecondary}>
          Loading payment history...
        </ShText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <ShText variant={ShTextVariant.SubHeading}>
            Payment History
          </ShText>
          <TouchableOpacity style={styles.sortButton} onPress={handleSort}>
            <ShText variant={ShTextVariant.Body} color={colorPalette.textSecondary}>
              {getSortLabel()}
            </ShText>
            <ShIcon
              name={IconName.ChevronDown}
              size={14}
              color={colorPalette.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <ShText variant={ShTextVariant.Body} color={colorPalette.error}>
              {error}
            </ShText>
          </View>
        )}

        {payments.length === 0 ? (
          <View style={styles.emptyState}>
            <ShIcon
              name={IconName.Receipt}
              size={48}
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
            {payments.map((payment) => (
              <PaymentHistoryCard
                key={payment.id}
                payment={payment}
                onPress={() => router.push(`/user/payment/${payment.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPalette.background
  },
  scrollContent: {
    padding: spacing.lg
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: 'rgba(235, 87, 87, 0.1)',
    borderRadius: 8,
    marginBottom: spacing.md
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md
  },
  paymentList: {
    gap: spacing.md
  }
});
```

### Step 5: Implement Payment Detail Screen

Create `/app/user/payment/[id].tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { paymentApi } from '@/lib/api/payments';
import { ShText, ShIcon, ShTextVariant, IconName, ShActivityIndicator } from '@/components';
import { colorPalette } from '@/config/colors';
import { spacing } from '@/config/spacing';
import { format } from 'date-fns';

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentDetail();
  }, [id]);

  const fetchPaymentDetail = async () => {
    try {
      setIsLoading(true);
      const data = await paymentApi.getPaymentHistoryDetail(id);
      setPayment(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ShActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !payment) {
    return (
      <View style={styles.errorContainer}>
        <ShText variant={ShTextVariant.Body} color={colorPalette.error}>
          {error || 'Payment not found'}
        </ShText>
      </View>
    );
  }

  const formattedAmount = `£${(payment.amount_pence / 100).toFixed(2)}`;
  const formattedDate = format(new Date(payment.payment_date), "MMM d, yyyy '•' HH:mm");

  const getStatusStyle = () => {
    switch (payment.status) {
      case 'paid':
        return {
          backgroundColor: 'rgba(39, 174, 96, 0.2)',
          color: colorPalette.success,
          icon: IconName.CheckCircle,
          text: 'Paid'
        };
      case 'failed':
        return {
          backgroundColor: 'rgba(235, 87, 87, 0.2)',
          color: colorPalette.error,
          icon: IconName.XCircle,
          text: 'Failed'
        };
      default:
        return {
          backgroundColor: 'rgba(158, 155, 151, 0.2)',
          color: colorPalette.textSecondary,
          icon: IconName.Ban,
          text: 'Cancelled'
        };
    }
  };

  const status = getStatusStyle();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Payment Header */}
        <View style={styles.headerSection}>
          <ShText variant={ShTextVariant.SubHeading}>
            {payment.title}
          </ShText>
          <View style={styles.requestedBy}>
            <ShText variant={ShTextVariant.Small} color={colorPalette.textSecondary}>
              Requested by
            </ShText>
            <View style={styles.requesterInfo}>
              {payment.requested_by.avatar_url && (
                <Image
                  source={{ uri: payment.requested_by.avatar_url }}
                  style={styles.avatar}
                />
              )}
              <ShText variant={ShTextVariant.Small} color={colorPalette.textSecondary}>
                {payment.team_name}
              </ShText>
            </View>
          </View>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: status.backgroundColor }]}>
          <View style={styles.statusRow}>
            <ShIcon name={status.icon} size={16} color={status.color} />
            <ShText variant={ShTextVariant.Body} color={status.color}>
              {status.text}
            </ShText>
            <ShText variant={ShTextVariant.Body} color={status.color}>
              {formattedDate}
            </ShText>
          </View>
        </View>

        {/* Description Section */}
        {payment.description && (
          <View style={styles.descriptionSection}>
            <ShText variant={ShTextVariant.SubHeading}>
              Description
            </ShText>
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
          <ShText variant={ShTextVariant.Body}>
            Total
          </ShText>
          <ShText variant={ShTextVariant.SubHeading}>
            {formattedAmount}
          </ShText>
        </View>

        {/* Transaction Details (if available) */}
        {payment.transaction_fee_pence !== undefined && (
          <View style={styles.transactionDetails}>
            <ShText variant={ShTextVariant.Small} color={colorPalette.textSecondary}>
              Transaction Fee: {formatCurrency(payment.transaction_fee_pence)}
            </ShText>
            <ShText variant={ShTextVariant.Small} color={colorPalette.textSecondary}>
              Net Amount: {formatCurrency(payment.net_amount_pence)}
            </ShText>
            {payment.stripe_payment_intent_id && (
              <ShText variant={ShTextVariant.Small} color={colorPalette.textSecondary}>
                Reference: {payment.stripe_payment_intent_id}
              </ShText>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPalette.background
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  headerSection: {
    gap: spacing.md
  },
  requestedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  requesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  avatar: {
    width: PaymentUIConstants.AVATAR_SIZE,
    height: PaymentUIConstants.AVATAR_SIZE,
    borderRadius: PaymentUIConstants.AVATAR_SIZE / 2
  },
  statusCard: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  descriptionSection: {
    gap: spacing.sm
  },
  descriptionText: {
    marginLeft: spacing.sm
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(158, 155, 151, 0.2)',
    padding: spacing.md,
    borderRadius: 12
  },
  transactionDetails: {
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(158, 155, 151, 0.2)'
  }
});
```

## Test Data Setup

### Create Test Payment Records

Before testing, create test data in Supabase SQL editor:

```sql
-- Get your test user ID first
SELECT id, email FROM auth.users WHERE email = 'your-test-email@example.com';

-- Create test paid payments (replace 'your-user-id' with actual ID)
UPDATE payment_request_members
SET
  payment_status = 'paid',  -- Matches PaymentStatus.PAID
  paid_at = NOW() - INTERVAL '1 day' * (random() * 30),
  stripe_payment_intent_id = 'pi_test_' || substr(md5(random()::text), 1, 16)
WHERE user_id = 'your-user-id'
  AND payment_status = 'unpaid'
LIMIT 3;

-- Verify test data
SELECT
  prm.id,
  prm.payment_status,
  prm.paid_at,
  pr.title,
  t.name as team_name
FROM payment_request_members prm
JOIN payment_requests pr ON prm.payment_request_id = pr.id
JOIN teams t ON pr.team_id = t.id
WHERE prm.user_id = 'your-user-id'
  AND prm.payment_status = 'paid'
ORDER BY prm.paid_at DESC;
```

## Testing Scenarios

### 1. Payment History List

- [ ] Empty state displays when no payments
- [ ] List loads and displays payments (max PaymentUIConstants.PAYMENT_HISTORY_LIMIT)
- [ ] Pull to refresh works
- [ ] Sort options change order correctly
- [ ] Navigation to detail screen works
- [ ] Logger shows correct [PAY-006] prefixed messages

### 2. Payment Detail

- [ ] All payment information displays
- [ ] Status badge shows correct color/icon
- [ ] Amount formatting is correct
- [ ] Back navigation works

### 3. Edge Cases

- [ ] Handle network errors gracefully
- [ ] Large payment lists scroll smoothly
- [ ] Currency formatting handles edge cases
- [ ] Date/time displays correctly in all timezones

## Common Issues & Solutions

### Issue: Payment list not updating

**Solution:** Ensure `fetchPaymentHistory` is called after payment completion in PAY-005

### Issue: Sort dropdown not working on Android

**Solution:** Implement custom modal or use react-native-action-sheet

### Issue: Avatar images not loading

**Solution:** Check Supabase storage CORS settings and authentication

### Issue: No payments showing

**Solution:** Verify payment_status is set to 'paid' (not 'completed' or other values) - must match PaymentStatus.PAID constant

### Issue: Logger not working

**Solution:** Import from correct path: `import { logger } from '@/lib/utils/logger';`

## Performance Tips

1. **No Pagination Needed**: Limited to PaymentUIConstants.PAYMENT_HISTORY_LIMIT items maximum at MVP stage
2. **No Offline Caching**: App is always online - no AsyncStorage needed
3. **Images**: Lazy load avatar images
4. **List Optimization**: Use FlatList for smooth scrolling

## Accessibility

- Add `accessibilityLabel` to all interactive elements
- Ensure touch targets are at least 44x44
- Test with screen reader
- Add `accessibilityHint` for sort button

## Important Implementation Notes

1. **API Object Name**: Use `paymentsApi` (not `paymentApi`) - note the 's'
2. **User ID Field**: Use `user_id` in queries (not `member_id`)
3. **Limit**: Hard limit of PaymentUIConstants.PAYMENT_HISTORY_LIMIT items - no pagination implementation
4. **Logger Format**: Always use `[PAY-006]` prefix in logger statements
5. **Constants**: Always use `PaymentStatus.PAID` from config, never hardcode 'paid'
6. **No Offline**: Don't implement caching or offline support

## Next Steps

After completing this story:

1. Run lint and type checks
2. Verify logger output shows [PAY-006] prefixed messages
3. Test with created test data (at least 3 paid payments)
4. Test on both iOS and Android
5. Submit for QA review
6. Document any issues or improvements
7. Prepare for Story 7 (Admin Payment Management)
