# PAY-004 RPC Function Fix Documentation

## Issue Discovered

**Date:** 2025-09-06 18:30 UTC
**During:** Post-deployment testing
**Problem:** Payment request totals (paid_members, total_collected_pence) were not updating after successful payments

## Root Cause Analysis

The `process_payment_success` RPC function was missing the critical step to update the `payment_requests` table totals. The function was correctly updating:

1. ✅ payments table
2. ✅ payment_transactions table
3. ✅ payment_request_members table

But was NOT updating:

- ❌ payment_requests.paid_members
- ❌ payment_requests.total_collected_pence

## Fix Applied

### Location

- **File:** `/supabase/migrations/20250906152240_process_payment_success.sql`
- **Migration:** `fix_process_payment_success_totals`
- **Applied:** 2025-09-06 18:45 UTC

### Code Added

```sql
-- 4. Update payment_requests totals
UPDATE payment_requests pr
SET
  paid_members = (
    SELECT COUNT(*)
    FROM payment_request_members prm
    WHERE prm.payment_request_id = pr.id
    AND prm.payment_status = 'paid'
  ),
  total_collected_pence = (
    SELECT COALESCE(SUM(amount_pence), 0)
    FROM payment_request_members prm
    WHERE prm.payment_request_id = pr.id
    AND prm.payment_status = 'paid'
  ),
  updated_at = NOW()
WHERE pr.id = (
  SELECT payment_request_id
  FROM payment_request_members
  WHERE id = p_member_id
);
```

## Test Results

### Before Fix

```
payment_requests:
- paid_members: 0
- total_collected_pence: 0
(Despite successful payment processing)
```

### After Fix

```
payment_requests:
- paid_members: Correctly increments with each payment
- total_collected_pence: Accurately sums all paid amounts
```

### Test Scenario

- Created 3 payment members (£9.99 each)
- Processed payments sequentially
- Results:
  - After 1st payment: 1/3 paid, £9.99 collected ✅
  - After 2nd payment: 2/3 paid, £19.98 collected ✅
  - After 3rd payment: 3/3 paid, £29.97 collected ✅

## Impact

- **Severity:** Medium (data inconsistency, not payment failure)
- **Affected:** Payment request tracking and reporting
- **Resolution:** Complete - all new payments will update totals correctly

## Validation Query

```sql
-- Verify totals match actual counts
SELECT
  pr.paid_members,
  pr.total_collected_pence,
  COUNT(prm.id) FILTER (WHERE prm.payment_status = 'paid') as actual_paid,
  COALESCE(SUM(prm.amount_pence) FILTER (WHERE prm.payment_status = 'paid'), 0) as actual_collected
FROM payment_requests pr
LEFT JOIN payment_request_members prm ON pr.id = prm.payment_request_id
WHERE pr.id = 'YOUR_REQUEST_ID'
GROUP BY pr.id, pr.paid_members, pr.total_collected_pence;
```

## Prevention

- All RPC functions should be thoroughly tested with complete data verification
- Consider adding automated tests for critical database operations
- Document expected side effects of each RPC function

## Status

✅ **FIXED AND DEPLOYED** - The fix is live in production and verified working.
