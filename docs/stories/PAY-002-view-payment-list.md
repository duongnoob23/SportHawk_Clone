# User Story: PAY-002 - View Payment List with Filter (Member)

**Epic:** Payments Core - Stripe Integration  
**Sprint:** 15  
**Status:** ✅ COMPLETED  
**Story Points:** 3  
**Developer Assigned:** COMPLETED  
**Reference Implementation:** `/app/(app)/teams.tsx` - events tab pattern

## Story Overview

**As a** Team Member  
**I want to** view my payment requests with filters  
**So that** I can see what payments I need to make and track my payment obligations

## Figma Design References

| Screen            | Figma Node ID | Design Doc               | Reference Implementation                                 |
| ----------------- | ------------- | ------------------------ | -------------------------------------------------------- |
| Payment List View | 559-3087      | /docs/design-payments.md | /app/(app)/teams.tsx (events tab pattern)                |
| Empty State       | 559-3087      | /docs/design-payments.md | /app/(app)/teams.tsx lines 607-630 (current empty state) |
| Filter Pills      | 559-3087      | /docs/design-payments.md | New implementation required                              |

## 🆕 NEW COMPONENTS TO CREATE

### 1. ShPaymentSummaryCard

**Location:** `/components/ShPaymentSummaryCard/ShPaymentSummaryCard.tsx`  
**Figma Node:** 559-3091  
**Purpose:** Yellow "Action Required" banner showing count of required payments

### 2. ShPaymentCard

**Location:** `/components/ShPaymentCard/ShPaymentCard.tsx`  
**Figma Node:** 559-3098  
**Purpose:** Individual payment card showing title, amount, date, and Pay Now button

## 🎯 Figma-to-Component Mapping

### Integration Point: Teams Tab View (Node: 559-3087)

**Location:** `/app/(app)/teams.tsx` lines 607-630 (replace empty state)  
**Reference Pattern:** Events tab implementation in same file  
**Copy Pattern From:** Lines 535-605 (events tab structure)  
**New Components:** Import and use ShPaymentSummaryCard and ShPaymentCard

#### Component Mapping Table - Filter Pills

| Figma Element          | SportHawk Component           | Props to Use                                   | Common Mistakes to Avoid                                           |
| ---------------------- | ----------------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| "All" filter pill      | `TouchableOpacity` + `ShText` | `onPress`, `style` with conditional background | ❌ Using ShButton for filter pills<br>❌ Not managing active state |
| "Upcoming" filter pill | `TouchableOpacity` + `ShText` | `onPress`, `style` with conditional background | ❌ Hard-coding colors instead of colorPalette                      |
| "Required" filter pill | `TouchableOpacity` + `ShText` | `onPress`, `style` with conditional background | ❌ Not using ShTextVariant.Label for text                          |

#### Component Mapping Table - Payment Summary (NEW COMPONENT)

| Figma Element  | Implementation           | Props                           | Node Reference |
| -------------- | ------------------------ | ------------------------------- | -------------- |
| Summary Card   | `<ShPaymentSummaryCard>` | `count`, `message`, `onPress`   | 559-3091       |
| Alert Icon     | Built into component     | Uses `IconName.Alert`           | Included       |
| Yellow styling | Built into component     | rgba(234,189,34,0.1) background | Included       |

#### Component Mapping Table - Payment Card (NEW COMPONENT)

| Figma Element     | Implementation       | Props                               | Node Reference |
| ----------------- | -------------------- | ----------------------------------- | -------------- |
| Payment Card      | `<ShPaymentCard>`    | See interface below                 | 559-3098       |
| All card elements | Built into component | Handles title, amount, date, button | Included       |

```typescript
// ShPaymentCard props
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

#### State Management Requirements

```typescript
// REQUIRED state for payments tab
const [paymentFilter, setPaymentFilter] = useState<
  'all' | 'upcoming' | 'required'
>('all');
const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
const [loadingPayments, setLoadingPayments] = useState(true);

// Filter logic (copy pattern from events filtering if exists)
const filteredPayments = useMemo(() => {
  if (paymentFilter === 'all') return paymentRequests;
  if (paymentFilter === 'upcoming') {
    return paymentRequests.filter(
      p =>
        p.dueDate &&
        new Date(p.dueDate) > new Date() &&
        p.paymentStatus !== 'paid'
    );
  }
  if (paymentFilter === 'required') {
    return paymentRequests.filter(p => p.paymentType === 'required');
  }
  return paymentRequests;
}, [paymentRequests, paymentFilter]);

// Data fetching in useEffect
useEffect(() => {
  if (activeTab === 'payments' && selectedTeamId) {
    fetchPaymentRequests();
  }
}, [activeTab, selectedTeamId]);
```

#### Navigation Requirements

```typescript
// Navigation to payment detail
const handlePaymentPress = (paymentId: string) => {
  router.push({
    pathname: '/payments/[id]',
    params: { id: paymentId },
  });
};
```

#### Empty State Requirements

```typescript
// When no payments exist (keep existing empty state but update text)
{filteredPayments.length === 0 && !loadingPayments && (
  <View style={styles.emptyTabContent}>
    <ShIcon
      name={IconName.CardWhite}
      size={spacing.iconSizeXLarge}
      color={colorPalette.primaryGold}
    />
    <ShSpacer size={spacing.lg} />
    <ShText variant={ShTextVariant.Heading} style={styles.centerText}>
      {paymentFilter === 'all'
        ? 'No payment requests'
        : paymentFilter === 'upcoming'
        ? 'No upcoming payments'
        : 'No required payments'}
    </ShText>
    <ShSpacer size={spacing.md} />
    <ShText variant={ShTextVariant.EmptyState} style={styles.centerText}>
      {paymentFilter === 'all'
        ? "You don't have any payment requests"
        : paymentFilter === 'upcoming'
        ? "No payments due soon"
        : "No required payments to make"}
    </ShText>
  </View>
)}
```

#### Loading State Pattern

```typescript
// Show loading indicator while fetching
{loadingPayments && (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colorPalette.primaryGold} />
  </View>
)}
```

### Full Implementation Structure (Using New Components)

```typescript
// Import new components at top of file
import { ShPaymentSummaryCard } from '../../components/ShPaymentSummaryCard';
import { ShPaymentCard } from '../../components/ShPaymentCard';

// In render method
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
          {/* Week filter... */}
        </View>

        {/* Payment List using ShPaymentCard */}
        <ScrollView style={styles.paymentList}>
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
      </View>
    )}
  </>
)}
```

### Required Styles to Add

```typescript
// Add to existing styles in teams.tsx
filterContainer: {
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: spacing.borderWidthThin,
  borderBottomColor: colorPalette.borderSubtle,
},
filterPill: {
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderRadius: spacing.borderRadiusLarge,
  backgroundColor: 'transparent',
  borderWidth: spacing.borderWidthThin,
  borderColor: colorPalette.borderSubtle,
  marginRight: spacing.sm,
},
filterPillActive: {
  backgroundColor: colorPalette.primaryGold,
  borderColor: colorPalette.primaryGold,
},
filterText: {
  color: colorPalette.textSecondary,
},
filterTextActive: {
  color: colorPalette.baseDark,
  fontWeight: fontWeights.medium,
},
paymentList: {
  flex: 1,
},
paymentCard: {
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
},
paymentHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing.xs,
},
amountText: {
  color: colorPalette.primaryGold,
  fontWeight: fontWeights.medium,
},
paymentMeta: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
dueDate: {
  color: colorPalette.textSecondary,
},
statusBadge: {
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: spacing.borderRadiusSmall,
  backgroundColor: colorPalette.successBackground,
},
paidText: {
  color: colorPalette.success,
},
divider: {
  marginTop: spacing.md,
  borderBottomWidth: spacing.borderWidthThin,
  borderBottomColor: colorPalette.borderSubtle,
},
```

## Acceptance Criteria

### Functional Requirements

- [x] Payment list displays within teams.tsx payments tab
- [x] Filter pills: All, Upcoming, Required
- [x] Each payment shows: Title, Amount (£), Due Date, Status
- [x] Tap payment card navigates to payment detail screen
- [x] Empty state shows when no payments match filter
- [x] Loading state while fetching data
- [x] Pull-to-refresh functionality

### UI/UX Requirements

- [x] Matches Figma design node 559-3087 exactly
- [x] Filter pills highlight when active (primaryGold background)
- [x] Amount displays in primaryGold color with £ symbol
- [x] Paid status shows success color badge
- [x] Overdue payments show error color indicator
- [x] Smooth transitions between filter states

### Technical Requirements

- [x] Integrate within existing teams.tsx structure
- [x] Use existing tab navigation pattern
- [x] Call `/lib/api/payments.ts` - getUserPaymentRequests()
- [x] Handle loading and error states gracefully
- [x] Memoize filtered results for performance
- [x] TypeScript interfaces for PaymentRequest data

## API Endpoints Required

| Action              | Endpoint              | Method | Payload               |
| ------------------- | --------------------- | ------ | --------------------- |
| Get user payments   | `/api/users/payments` | GET    | Query: teamId, userId |
| Get payment details | `/api/payments/:id`   | GET    | -                     |

## Error Scenarios

| Scenario        | User Message                | Handling                        |
| --------------- | --------------------------- | ------------------------------- |
| Network failure | "Unable to load payments"   | Show retry button               |
| No payments     | Filter-specific empty state | Show appropriate empty message  |
| API error       | "Something went wrong"      | Log error, show generic message |

## Implementation Checklist

### Pre-Development

- [ ] Review current teams.tsx implementation
- [ ] Understand events tab pattern for reference
- [ ] Review Figma design nodes: 559-3087 (main), 559-3091 (summary), 559-3098 (card)
- [ ] Check `/docs/architecture/component-interfaces.md`
- [ ] Create ShPaymentSummaryCard component
- [ ] Create ShPaymentCard component

### During Development

- [ ] Create `/components/ShPaymentSummaryCard/` folder and files
- [ ] Create `/components/ShPaymentCard/` folder and files
- [ ] Import new components in teams.tsx
- [ ] Replace lines 607-630 with component-based implementation
- [ ] Add filter state management
- [ ] Implement API call to fetch payments
- [ ] Add navigation to payment detail
- [ ] Test components render correctly
- [ ] Test all filter states

### Critical Checks

- [ ] Filter pills use TouchableOpacity, NOT buttons
- [ ] Amount formatted with £ symbol and 2 decimals
- [ ] Dates formatted consistently
- [ ] Status badges use conditional styling
- [ ] Navigation uses router.push pattern
- [ ] Loading state shows ActivityIndicator
- [ ] Empty states are filter-specific

## Notes for Developer

### ⚠️ CRITICAL: Integration Points

1. **Location**: This is NOT a new screen - integrate within `/app/(app)/teams.tsx`
2. **Lines to Replace**: 607-630 (current empty state)
3. **Reference Pattern**: Copy events tab structure from lines 535-605
4. **State Management**: Add to existing state in teams.tsx
5. **Navigation**: Use existing router instance

### Data Structure Expected

```typescript
interface PaymentRequest {
  id: string;
  title: string;
  amountPence: number;
  dueDate: string | null;
  paymentType: 'required' | 'optional';
  paymentStatus: 'pending' | 'paid' | 'overdue';
  teamName: string;
  createdAt: string;
}
```

### Testing Focus Areas

1. Filter state persistence when switching tabs
2. Correct filtering logic for each filter type
3. Navigation to detail screen with correct ID
4. Empty state messages match filter selection
5. Amount displays correctly (pence to pounds conversion)

---

**Story Prepared By:** Sarah (Product Owner)  
**Date:** 2025-09-04  
**Version:** 1.0

## Sign-off

- [ ] PO Review Complete
- [ ] Developer Acknowledges Requirements
- [ ] QA Test Cases Prepared
