# Figma-to-Code Translation Layer: PAY-002 Payment List (Enhanced)

**Story:** PAY-002 - View Payment List with Filter  
**Primary Figma Node:** 559-3087  
**Component Nodes:** 559-3091 (Summary Card), 559-3098 (Payment Card)  
**Target File:** `/app/(app)/teams.tsx` lines 607-630

## 🆕 NEW COMPONENTS TO CREATE

### 1. ShPaymentSummaryCard Component

**Location:** `/components/ShPaymentSummaryCard/ShPaymentSummaryCard.tsx`  
**Figma Node:** 559-3091

### 2. ShPaymentCard Component

**Location:** `/components/ShPaymentCard/ShPaymentCard.tsx`  
**Figma Node:** 559-3098

---

## 📦 Component 1: ShPaymentSummaryCard

### Figma Design (Node 559-3091)

- Yellow background with border
- Alert icon + "Action Required" title
- Payment count on right
- Description text below

### Component Interface

```typescript
interface ShPaymentSummaryCardProps {
  count: number;
  message?: string;
  onPress?: () => void;
}
```

### Implementation

```typescript
// /components/ShPaymentSummaryCard/ShPaymentSummaryCard.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ShText, ShTextVariant } from '../ShText/ShText';
import { ShIcon, IconName } from '../ShIcon/ShIcon';
import { colorPalette } from '../../config/colors';
import { spacing } from '../../config/spacing';
import { fontSizes, fontWeights } from '../../config/typography';

interface ShPaymentSummaryCardProps {
  count: number;
  message?: string;
  onPress?: () => void;
}

export const ShPaymentSummaryCard: React.FC<ShPaymentSummaryCardProps> = ({
  count,
  message = 'Please ensure all required payments are met. Contact team admins if you need support',
  onPress
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShIcon
            name={IconName.Alert}
            size={16}
            color={colorPalette.primaryGold}
          />
          <ShText
            variant={ShTextVariant.Body}
            style={styles.title}
          >
            Action Required
          </ShText>
        </View>
        <ShText
          variant={ShTextVariant.Small}
          style={styles.count}
        >
          {count} payment{count !== 1 ? 's' : ''}
        </ShText>
      </View>

      {/* Message */}
      <ShText
        variant={ShTextVariant.Small}
        style={styles.message}
      >
        {message}
      </ShText>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(234, 189, 34, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234, 189, 34, 0.2)',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.body,
  },
  count: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.small,
  },
  message: {
    color: 'rgba(234, 189, 34, 0.8)',
    fontSize: fontSizes.small,
    lineHeight: 18,
  },
});
```

### Index Export

```typescript
// /components/ShPaymentSummaryCard/index.tsx
export { ShPaymentSummaryCard } from './ShPaymentSummaryCard';
export type { ShPaymentSummaryCardProps } from './ShPaymentSummaryCard';
```

---

## 📦 Component 2: ShPaymentCard

### Figma Design (Node 559-3098)

- Dark card with border
- Payment title and team name
- Amount badge on right
- Date/time row with icons
- Pay Now button at bottom

### Component Interface

```typescript
interface ShPaymentCardProps {
  id: string;
  title: string;
  teamName: string;
  amountPence: number;
  dueDate: string | null;
  paymentType: 'required' | 'optional';
  paymentStatus: 'pending' | 'paid' | 'overdue';
  onPress?: () => void;
  onPayPress?: () => void;
}
```

### Implementation

```typescript
// /components/ShPaymentCard/ShPaymentCard.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ShText, ShTextVariant } from '../ShText/ShText';
import { ShIcon, IconName } from '../ShIcon/ShIcon';
import { colorPalette } from '../../config/colors';
import { spacing } from '../../config/spacing';
import { fontSizes, fontWeights } from '../../config/typography';

interface ShPaymentCardProps {
  id: string;
  title: string;
  teamName: string;
  amountPence: number;
  dueDate: string | null;
  paymentType: 'required' | 'optional';
  paymentStatus: 'pending' | 'paid' | 'overdue';
  onPress?: () => void;
  onPayPress?: () => void;
}

export const ShPaymentCard: React.FC<ShPaymentCardProps> = ({
  id,
  title,
  teamName,
  amountPence,
  dueDate,
  paymentType,
  paymentStatus,
  onPress,
  onPayPress
}) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  const handlePayPress = (e: any) => {
    e.stopPropagation();
    onPayPress?.();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShText
            variant={ShTextVariant.Body}
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </ShText>
          <ShText
            variant={ShTextVariant.Small}
            style={styles.teamName}
          >
            {teamName}
          </ShText>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.amountBadge}>
            <ShText
              variant={ShTextVariant.Body}
              style={styles.amount}
            >
              {formatAmount(amountPence)}
            </ShText>
          </View>
          {paymentType === 'required' && paymentStatus !== 'paid' && (
            <ShIcon
              name={IconName.Alert}
              size={16}
              color={colorPalette.primaryGold}
            />
          )}
        </View>
      </View>

      {/* Date/Time Row */}
      {dueDate && (
        <View style={styles.dateRow}>
          <ShIcon
            name={IconName.CalendarOutline}
            size={14}
            color={colorPalette.stoneGrey}
          />
          <ShText
            variant={ShTextVariant.Body}
            style={styles.dateText}
          >
            {formatDate(dueDate)}
          </ShText>

          <ShIcon
            name={IconName.Clock}
            size={14}
            color={colorPalette.stoneGrey}
            style={styles.clockIcon}
          />
          <ShText
            variant={ShTextVariant.Body}
            style={styles.timeText}
          >
            {formatTime(dueDate)}
          </ShText>
        </View>
      )}

      {/* Pay Button */}
      {paymentStatus !== 'paid' && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayPress}
          activeOpacity={0.8}
        >
          <ShText
            variant={ShTextVariant.Button}
            style={styles.payButtonText}
          >
            Pay Now
          </ShText>
        </TouchableOpacity>
      )}

      {/* Paid Badge */}
      {paymentStatus === 'paid' && (
        <View style={styles.paidBadge}>
          <ShText
            variant={ShTextVariant.Small}
            style={styles.paidText}
          >
            Paid
          </ShText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(158, 155, 151, 0.2)',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: colorPalette.lightText,
    fontSize: 18,
    lineHeight: 21,
  },
  teamName: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.small,
    lineHeight: 17,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountBadge: {
    backgroundColor: 'rgba(158, 155, 151, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  amount: {
    color: colorPalette.lightText,
    fontSize: fontSizes.small,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.body,
    flex: 1,
  },
  clockIcon: {
    marginLeft: 8,
  },
  timeText: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.body,
  },
  payButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.8)',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  payButtonText: {
    color: 'white',
    fontSize: fontSizes.body,
  },
  paidBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  paidText: {
    color: colorPalette.success,
    fontSize: fontSizes.small,
  },
});
```

### Index Export

```typescript
// /components/ShPaymentCard/index.tsx
export { ShPaymentCard } from './ShPaymentCard';
export type { ShPaymentCardProps } from './ShPaymentCard';
```

---

## 📱 Updated Implementation in teams.tsx

### Import the New Components

```typescript
// Add to imports at top of /app/(app)/teams.tsx
import { ShPaymentSummaryCard } from '../../components/ShPaymentSummaryCard';
import { ShPaymentCard } from '../../components/ShPaymentCard';
```

### Replace Lines 607-630 with:

```typescript
{activeTab === 'payments' && (
  <>
    {/* Loading State */}
    {loadingPayments && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorPalette.primaryGold} />
      </View>
    )}

    {/* Loaded State */}
    {!loadingPayments && (
      <View style={styles.paymentsContainer}>
        {/* Action Required Summary Card */}
        {requiredUnpaidCount > 0 && (
          <View style={styles.summaryCardWrapper}>
            <ShPaymentSummaryCard
              count={requiredUnpaidCount}
              onPress={() => setPaymentFilter('required')}
            />
          </View>
        )}

        {/* Section Header */}
        <View style={styles.paymentSectionHeader}>
          <ShText variant={ShTextVariant.SubHeading} style={styles.paymentSectionTitle}>
            Upcoming Payments
          </ShText>

          <TouchableOpacity
            style={styles.weekFilter}
            onPress={() => setTimeFilter(timeFilter === 'week' ? 'all' : 'week')}
          >
            <ShText variant={ShTextVariant.Body} style={styles.weekFilterText}>
              {timeFilter === 'week' ? 'This Week' : 'All Time'}
            </ShText>
            <ShIcon
              name={IconName.ChevronDown}
              size={14}
              color={colorPalette.stoneGrey}
            />
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {filteredPayments.length === 0 ? (
          <View style={styles.emptyTabContent}>
            <ShIcon
              name={IconName.CardWhite}
              size={spacing.iconSizeXLarge}
              color={colorPalette.primaryGold}
            />
            <ShSpacer size={spacing.lg} />
            <ShText variant={ShTextVariant.Heading} style={styles.centerText}>
              No payment requests
            </ShText>
            <ShSpacer size={spacing.md} />
            <ShText variant={ShTextVariant.EmptyState} style={styles.centerText}>
              You don't have any pending payment requests
            </ShText>
          </View>
        ) : (
          /* Payment List */
          <ScrollView
            style={styles.paymentList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.paymentListContent}
          >
            {filteredPayments.map((payment) => (
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
  </>
)}
```

### Required State Management

```typescript
// Add to component state
const [paymentFilter, setPaymentFilter] = useState<
  'all' | 'upcoming' | 'required'
>('all');
const [timeFilter, setTimeFilter] = useState<'week' | 'all'>('week');
const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
const [loadingPayments, setLoadingPayments] = useState(true);

// Computed values
const requiredUnpaidCount = useMemo(() => {
  return paymentRequests.filter(
    p => p.paymentType === 'required' && p.paymentStatus !== 'paid'
  ).length;
}, [paymentRequests]);

const filteredPayments = useMemo(() => {
  let filtered = paymentRequests;

  // Apply payment filter
  if (paymentFilter === 'required') {
    filtered = filtered.filter(p => p.paymentType === 'required');
  } else if (paymentFilter === 'upcoming') {
    filtered = filtered.filter(
      p =>
        p.dueDate &&
        new Date(p.dueDate) > new Date() &&
        p.paymentStatus !== 'paid'
    );
  }

  // Apply time filter
  if (timeFilter === 'week') {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    filtered = filtered.filter(
      p => p.dueDate && new Date(p.dueDate) <= oneWeekFromNow
    );
  }

  return filtered;
}, [paymentRequests, paymentFilter, timeFilter]);

// Navigation handlers
const handlePaymentPress = (paymentId: string) => {
  router.push({
    pathname: '/payments/[id]',
    params: { id: paymentId },
  });
};

const handlePayNow = (paymentId: string) => {
  router.push({
    pathname: '/payments/[id]/pay',
    params: { id: paymentId },
  });
};
```

### Required Styles

```typescript
// Add to StyleSheet.create in teams.tsx
paymentsContainer: {
  flex: 1,
},
summaryCardWrapper: {
  paddingHorizontal: 20,
  marginBottom: 24,
},
paymentSectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginBottom: 16,
},
paymentSectionTitle: {
  color: colorPalette.lightText,
  letterSpacing: -0.04,
},
weekFilter: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
weekFilterText: {
  color: colorPalette.stoneGrey,
},
paymentList: {
  flex: 1,
},
paymentListContent: {
  paddingHorizontal: 20,
  paddingBottom: 20,
  gap: 12,
},
```

---

## 📋 Implementation Checklist

### New Component Files to Create:

- [ ] `/components/ShPaymentSummaryCard/ShPaymentSummaryCard.tsx`
- [ ] `/components/ShPaymentSummaryCard/index.tsx`
- [ ] `/components/ShPaymentCard/ShPaymentCard.tsx`
- [ ] `/components/ShPaymentCard/index.tsx`

### Updates to teams.tsx:

- [ ] Import new components
- [ ] Add state management variables
- [ ] Replace lines 607-630 with new implementation
- [ ] Add new styles to StyleSheet

### Component Testing:

- [ ] ShPaymentSummaryCard shows correct count
- [ ] ShPaymentSummaryCard onPress filters to required
- [ ] ShPaymentCard displays all fields correctly
- [ ] ShPaymentCard formats amount as £XX.XX
- [ ] ShPaymentCard shows alert icon only for required unpaid
- [ ] ShPaymentCard Pay Now button works independently
- [ ] ShPaymentCard shows Paid badge when paid

---

## ⚠️ Critical Implementation Notes

### Component Creation Rules:

1. ✅ Use StyleSheet.create for styles
2. ✅ Import from config files (colors, spacing, typography)
3. ✅ Export both component and TypeScript interface
4. ✅ Use ShText with variants for ALL text
5. ✅ Use ShIcon with IconName enum for icons

### Integration Rules:

1. ✅ Components go in `/components/` folder
2. ✅ Follow existing component structure pattern
3. ✅ Create index.tsx for clean exports
4. ✅ Import in teams.tsx to use
5. ✅ Pass all required props

### Common Mistakes to Avoid:

1. ❌ Don't use inline styles - use StyleSheet
2. ❌ Don't hardcode colors - use colorPalette
3. ❌ Don't hardcode spacing - use spacing config
4. ❌ Don't use raw Text - use ShText
5. ❌ Don't forget TypeScript interfaces

---

## 🎯 Summary of Changes

### What's New:

1. **Two new reusable components** instead of inline code
2. **ShPaymentSummaryCard** - Yellow action required banner
3. **ShPaymentCard** - Individual payment card with all details
4. **Cleaner teams.tsx** - Uses components instead of complex inline JSX

### Benefits:

- ✅ Reusable across other screens
- ✅ Easier to test in isolation
- ✅ Consistent styling
- ✅ Type-safe with TypeScript
- ✅ Follows SportHawk component patterns
