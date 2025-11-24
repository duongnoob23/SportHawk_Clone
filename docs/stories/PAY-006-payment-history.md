# User Story: PAY-006 - Payment History (Member)

**Epic:** Payments Core - Stripe Integration  
**Sprint:** 16  
**Status:** Ready for Development  
**Story Points:** 5  
**Developer Assigned:** TBD  
**Story Type:** Frontend - Read-only Views  
**Dependencies:** PAY-005 (must be COMPLETED)  
**Development Guide:** `/docs/stories/PAY-006-development-guide.md`  
**Figma Translation:** `/docs/stories/PAY-006-figma-translation-layer.md`

## Story

**As a** Team Member  
**I want to** view my payment history  
**So that** I can track my past payments and access receipts

## Critical Prerequisites

### ✅ Completed Dependencies

1. **PAY-005**: Payment flow is complete and payments are being recorded with `payment_status = PaymentStatus.PAID`
2. **Database**: payment_request_members table has paid records
3. **Database**: payment_transactions table has transaction details
4. **Test Data**: At least 2-3 test payments marked as paid (see Test Data Setup section)

### 🔑 Navigation Access

- Profile tab → "Payment History" button
- Must be authenticated user
- Only shows user's own payment history

## Acceptance Criteria

### Core Functionality

- [ ] View list of all completed payments
- [ ] Filter/sort payment history (Most Recent, Oldest, Amount)
- [ ] View detailed payment information
- [ ] Show payment status (Paid, Failed, Cancelled)
- [ ] Display transaction reference numbers
- [ ] Show team name and payment title

### User Experience

- [ ] List shows payment cards with key information
- [ ] Tapping card navigates to payment detail
- [ ] Pull-to-refresh updates payment list
- [ ] Empty state when no payment history
- [ ] Loading state while fetching data
- [ ] Sort dropdown with options

### Data Display

- [ ] Payment title and team name
- [ ] Amount in pounds (converted from pence)
- [ ] Payment date and time
- [ ] Status indicator with appropriate color
- [ ] Transaction details in detail view
- [ ] Description when available

## Implementation Details

### Files to Create

**New Screens:**

- `/app/user/payment-history.tsx` - Payment history list
- `/app/user/payment/[id].tsx` - Payment detail view

**New Components:**

- `/components/PaymentHistoryCard/index.tsx` - Reusable payment card

**Store:**

- `/stores/paymentHistoryStore.ts` - State management for history

**API Updates:**

- `/lib/api/payments.ts` - Add getUserPaymentHistory and getPaymentHistoryDetail

### Database Queries

```typescript
// Use constants from config
import { PaymentStatus, PaymentUIConstants } from '@/config/payments';

// Query implementation (limit to 50 items, no pagination at MVP)
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
  .eq('payment_status', PaymentStatus.PAID) // Use constant, not hardcoded string
  .order('paid_at', { ascending: false })
  .limit(PaymentUIConstants.PAYMENT_HISTORY_LIMIT); // Use config constant
```

### Data Structure

```typescript
import { PaymentHistoryStatusType } from '@/config/payments';

interface PaymentHistoryItem {
  id: string;
  title: string;
  team_name: string;
  amount_pence: number;
  payment_date: string;
  status: PaymentHistoryStatusType;
  stripe_payment_intent_id?: string;
}

interface PaymentDetail extends PaymentHistoryItem {
  description: string;
  requested_by: {
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  transaction_fee_pence?: number;
  net_amount_pence?: number;
}
```

## Figma Design References

| Component            | Figma Node ID | Description                  |
| -------------------- | ------------- | ---------------------------- |
| Payment History List | 559:7147      | List view with payment cards |
| Payment Detail       | 559:7357      | Detailed payment information |
| Empty State          | TBD           | No payment history message   |
| Loading State        | TBD           | Loading indicator            |

## Figma Style Requirements

### List Screen

- **Screen Title:** ShTextVariant.SubHeading "Payment History"
- **Sort Button:** ShTextVariant.Body with colorPalette.textSecondary
- **Card Background:** colorPalette.paymentCardBackground with border
- **Payment Title:** ShTextVariant.Body
- **Team Name:** ShTextVariant.Small with colorPalette.textSecondary
- **Amount Badge:** colorPalette.paymentAmountBadge background
- **Date/Time:** ShTextVariant.Body with colorPalette.textSecondary
- **View Button:** colorPalette.primary background with colorPalette.baseDark text

### Detail Screen

- **Payment Title:** ShTextVariant.SubHeading
- **Requested By:** ShTextVariant.Small with colorPalette.textSecondary
- **Status Card:** PaymentStatusConfig[status].backgroundColor
- **Description Title:** ShTextVariant.SubHeading
- **Description Text:** ShTextVariant.Body with colorPalette.textSecondary
- **Total Card:** colorPalette.paymentTotalCardBg background
- **Amount:** ShTextVariant.SubHeading

### Status Colors

Status colors are managed via PaymentStatusConfig from `/config/payments.ts`:

- **Paid:** colorPalette.paymentStatusPaidBg background, colorPalette.paymentStatusPaid text
- **Failed:** colorPalette.paymentStatusFailedBg background, colorPalette.paymentStatusFailed text
- **Cancelled:** colorPalette.paymentStatusCancelledBg background, colorPalette.paymentStatusCancelled text

## Technical Implementation Notes

### Navigation Flow

1. User navigates to Profile tab
2. Taps "Payment History" button
3. List screen loads with payment history
4. User can sort/filter payments
5. Tapping payment card opens detail view
6. Back navigation returns to list

### Sort Options

Use PaymentSortLabels from `/config/payments.ts`:

- PaymentSortLabels[PaymentSortOptions.RECENT] (default)
- PaymentSortLabels[PaymentSortOptions.OLDEST]
- PaymentSortLabels[PaymentSortOptions.AMOUNT_HIGH]
- PaymentSortLabels[PaymentSortOptions.AMOUNT_LOW]

### Performance Considerations

- Display maximum PaymentUIConstants.PAYMENT_HISTORY_LIMIT payments (no pagination needed at MVP stage)
- Use FlatList for efficient rendering
- Lazy load avatar images
- Always-online app - no offline caching required

### Error Handling

- **Failed to Load:** Display error message with retry button
- **Empty History:** Show friendly empty state
- **Invalid Payment ID:** Show "Payment not found" message
- **Logging:** Use logger utility for all errors:
  ```typescript
  import { logger } from '@/lib/utils/logger';
  logger.error('[PAY-006] Failed to load payments:', error);
  ```

## Testing Checklist

### Functional Tests

- [ ] Payment history loads correctly
- [ ] Sort functionality works for all options
- [ ] Pull-to-refresh updates list
- [ ] Navigation to detail view works
- [ ] Back navigation returns to list
- [ ] Empty state displays when no payments
- [ ] Loading state shows while fetching

### Data Validation

- [ ] Amounts display correctly (pence to pounds)
- [ ] Dates format properly
- [ ] Status colors match design
- [ ] All payment fields display
- [ ] Transaction details show in detail view

### Platform Testing

- [ ] iOS: Test on iPhone 12+
- [ ] Android: Test on Pixel 5+
- [ ] Tablet: Ensure responsive layout
- [ ] Different screen sizes handled

## Definition of Done

- [ ] All screens implemented per Figma designs
- [ ] Payment history loads from database
- [ ] Sort/filter functionality working
- [ ] Navigation flow complete
- [ ] Error states handled
- [ ] Empty state implemented
- [ ] All Figma styles applied correctly
- [ ] Tested on both iOS and Android
- [ ] No console errors or warnings
- [ ] Code follows existing patterns
- [ ] PR reviewed and approved
- [ ] Merged to main branch

## Notes for Developer

1. **DO NOT** create payments - only read existing data
2. **USE** existing ShComponents - don't create custom UI
3. **FOLLOW** the pattern from other list screens (e.g., teams/[id]/members.tsx)
4. **FORMAT** amounts properly using `formatCurrency` from `/config/payments.ts`
5. **USE** logger utility from `/lib/utils/logger` for all logging (not console.log)
6. **USE** PaymentStatus constants from `/config/payments.ts` (never hardcode status strings)
7. **LIMIT** to PaymentUIConstants.PAYMENT_HISTORY_LIMIT payments maximum (no pagination implementation needed)
8. **NO OFFLINE** support needed - app is always online
9. **TEST** with test data created via Test Data Setup section

## Related Documentation

- [PAY-005 Payment Integration](./PAY-005-pay-payment-request.md)
- [Database Schema](../architecture/database-schema.md)
- [Figma Translation Guide](./PAY-006-figma-translation-layer.md)
- [Component Library](../architecture/component-library.md)

## Potential Issues & Solutions

### Issue: Payments not showing

**Solution:** Ensure PAY-005 correctly updates payment_status to 'paid'

### Issue: Sort not working on Android

**Solution:** Use react-native-action-sheet or custom modal

### Issue: Slow loading with many payments

**Solution:** Already limited to PaymentUIConstants.PAYMENT_HISTORY_LIMIT items maximum - no pagination needed

### Issue: Avatar images not loading

**Solution:** Check Supabase storage permissions and CORS settings

## Future Enhancements (Phase 2)

- Export payment history to CSV/PDF
- Search payments by title or date
- Filter by date range
- Bulk receipt download
- Email receipt functionality
- Payment statistics/analytics

## QA Testing Scenarios

1. **New User Flow**
   - Sign in as user with no payments
   - Verify empty state displays
   - Make a payment (PAY-005)
   - Return to history and verify it appears

2. **Existing User Flow**
   - Sign in as user with payment history
   - Verify all payments load
   - Test each sort option
   - View payment details
   - Test pull-to-refresh

3. **Edge Cases**
   - User with 100+ payments (pagination)
   - Payment with very long title
   - Payment with no description
   - Failed payment status
   - Cancelled payment status

## Test Data Setup

### Creating Test Payment Data

Run this SQL in Supabase dashboard to create test paid payments:

```sql
-- Update existing unpaid records to paid status for testing
-- Replace 'your-user-id' with actual test user ID
UPDATE payment_request_members
SET
  payment_status = 'paid',  -- This matches PaymentStatus.PAID constant
  paid_at = NOW() - INTERVAL '1 day' * (random() * 30),
  stripe_payment_intent_id = 'pi_test_' || substr(md5(random()::text), 1, 16)
WHERE user_id = 'your-user-id'
  AND payment_status = 'unpaid'
LIMIT 3;

-- Verify test data exists
SELECT COUNT(*) FROM payment_request_members
WHERE payment_status = 'paid' AND user_id = 'your-user-id';
```

### Alternative: Create Payments via PAY-005

1. Complete payment flow in PAY-005
2. Ensure payments are marked with `payment_status = 'paid'`
3. Verify in database before testing PAY-006

## Logging Strategy

Use the existing logger utility for all debugging:

```typescript
import { logger } from '@/lib/utils/logger';

// API layer logging
logger.log('[PAY-006] Fetching payment history for user:', userId);
logger.log('[PAY-006] Payment history loaded:', data.length, 'items');
logger.error('[PAY-006] Error loading payments:', error.message);

// Component layer logging
logger.log('[PAY-006] User selected payment:', paymentId);
logger.log('[PAY-006] Sort changed to:', sortOption);
logger.debug('[PAY-006] Rendering payment list with', payments.length, 'items');

// Store layer logging
logger.log('[PAY-006] Refreshing payment list');
logger.debug('[PAY-006] Store state updated:', { sortBy, itemCount });
```

## Success Metrics

- Page load time < 2 seconds
- Sort operation < 500ms
- Zero crashes in production
- 95% of users can find payment history
- Support tickets related to payment history < 1%
- All logger statements properly formatted with [PAY-006] prefix

## QA Results

### Review Date: 2025-01-08

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

The story documentation for PAY-006 has been comprehensively prepared by PO Sarah with recent critical updates. The documentation now properly addresses the previously identified issues with hardcoded values and implementation details. However, there remains a critical inconsistency in the development guide that must be fixed before development begins.

### Critical Issue Found

**BLOCKER - API Implementation Mismatch:**

- The development guide shows conflicting information about the API object name
- Line 48 incorrectly shows `export const paymentApi` (old version)
- Line 71 incorrectly uses `.eq('member_id', userId)` instead of `.eq('user_id', userId)`
- Line 73 missing `.limit(50)` in the first example
- Line 150 shows `import { paymentApi }` instead of `import { paymentsApi }`

These inconsistencies directly contradict the "Important Implementation Notes" section at line 866 which correctly states to use `paymentsApi` and `user_id`.

### Compliance Check

- Coding Standards: ✓ Documentation follows project conventions
- Project Structure: ✓ File locations properly defined
- Testing Strategy: ✓ Test data setup included
- All ACs Met: ✓ All acceptance criteria clearly defined

### Documentation Quality Assessment

**Strengths:**

1. Excellent recovery from initial hardcoded values issue
2. Clear test data setup instructions with SQL scripts
3. Proper use of logger utility with [PAY-006] prefix convention
4. Good simplification to 50-item limit (no pagination complexity)
5. Clear guidance on using PaymentStatus constants

**Areas Well Addressed:**

1. Logger usage examples throughout all layers
2. Test data creation with proper constants
3. Removal of offline/caching requirements
4. Clear API implementation patterns

### Risk Assessment

**Medium Risk:**

- Developer confusion from inconsistent examples in development guide
- Potential for using wrong API object name or field names
- Missing logger imports in some code examples

**Low Risk:**

- Implementation is read-only (no data mutation)
- Limited to 50 items reduces complexity
- Clear navigation patterns from existing screens

### Improvements Checklist

**Must Fix Before Development:**

- [ ] Update development guide line 48 to show `paymentsApi`
- [ ] Fix line 71 to use `user_id` not `member_id`
- [ ] Add `.limit(50)` to line 73
- [ ] Update line 150 import to use `paymentsApi`
- [ ] Add logger import to Step 1 code example

**Nice to Have:**

- [ ] Add error boundary example for payment detail screen
- [ ] Include example of handling network timeout
- [ ] Add performance monitoring points

### Security Review

No security concerns identified - read-only implementation with proper user isolation via `user_id` filter.

### Performance Considerations

- 50-item limit appropriately prevents performance issues
- FlatList usage for efficient rendering is correct
- No unnecessary re-renders with proper store implementation

### Test Coverage Assessment

**Well Covered:**

- Basic happy path flows
- Empty state handling
- Sort functionality
- Platform-specific testing

**Missing Test Scenarios:**

- Network failure during sort operation
- Concurrent refresh requests
- Deep linking to payment detail
- Back navigation during loading state

### Gate Status

Gate: **CONCERNS** → docs/qa/gates/PAY-006-payment-history.yml

- Critical implementation inconsistencies must be fixed
- Documentation is otherwise comprehensive and well-prepared

### Recommended Status

[✗ Changes Required - Fix API implementation examples in development guide]

The story cannot proceed to development until the API object naming and field naming inconsistencies are resolved. Once fixed, this story will be ready for development.
