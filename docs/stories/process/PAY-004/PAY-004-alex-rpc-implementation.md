# Alex - RPC Function Implementation for PAY-004

## Priority: 🔴 Critical - Blocking Development

**To**: Alex (Dev Lead)  
**From**: Quinn (QA) via Sarah (PO)  
**Date**: 2025-09-06  
**Estimated Time**: 2-3 hours  
**Story**: PAY-004 - Stripe Backend Integration

---

## Summary

You need to implement PostgreSQL RPC functions to ensure atomic database operations for payment processing. This prevents partial updates if any operation fails during webhook processing.

## Why This Matters

Without atomic transactions, we risk:

- Partial database updates (payment marked complete but member not updated)
- Data inconsistency between tables
- Orphaned records that break reporting
- User trust issues if payment state is incorrect

## Implementation Required

### 1. Create Migration File

Create a new migration file in Supabase:

```bash
supabase migration new process_payment_success
```

### 2. Add This Exact Function

Copy this **EXACTLY** into the migration file:

```sql
-- Migration: process_payment_success.sql
-- Purpose: Atomic payment success processing to prevent partial updates

CREATE OR REPLACE FUNCTION process_payment_success(
  p_payment_intent_id TEXT,
  p_charge_id TEXT,
  p_member_id UUID,
  p_amount_pence INTEGER
) RETURNS void AS $$
BEGIN
  -- All operations in single transaction

  -- 1. Update payments table
  UPDATE payments
  SET
    status = 'completed',
    stripe_charge_id = p_charge_id,
    completed_at = NOW()
  WHERE stripe_payment_intent_id = p_payment_intent_id;

  -- 2. Insert payment transaction
  INSERT INTO payment_transactions (
    payment_request_member_id,
    stripe_payment_intent_id,
    stripe_charge_id,
    amount_pence,
    currency,
    status,
    platform_fee_pence,
    net_amount_pence,
    created_at
  ) VALUES (
    p_member_id,
    p_payment_intent_id,
    p_charge_id,
    p_amount_pence,
    'GBP',
    'completed',
    0, -- SportHawk pays fees
    p_amount_pence,
    NOW()
  );

  -- 3. Update payment_request_members
  UPDATE payment_request_members
  SET
    payment_status = 'paid',
    paid_at = NOW()
  WHERE id = p_member_id;

  -- If any operation fails, all rollback automatically
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role (used by Edge Functions)
GRANT EXECUTE ON FUNCTION process_payment_success TO service_role;
```

### 3. Create Similar Functions for Failed/Canceled

Create another migration for payment failures:

```bash
supabase migration new process_payment_failure
```

```sql
-- Migration: process_payment_failure.sql
CREATE OR REPLACE FUNCTION process_payment_failure(
  p_payment_intent_id TEXT,
  p_member_id UUID,
  p_failure_reason TEXT
) RETURNS void AS $$
BEGIN
  -- Update payments table
  UPDATE payments
  SET
    status = 'failed',
    failure_reason = p_failure_reason,
    updated_at = NOW()
  WHERE stripe_payment_intent_id = p_payment_intent_id;

  -- Update payment_request_members
  UPDATE payment_request_members
  SET
    payment_status = 'failed',
    failure_reason = p_failure_reason,
    updated_at = NOW()
  WHERE id = p_member_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION process_payment_failure TO service_role;

-- Also create for canceled payments
CREATE OR REPLACE FUNCTION process_payment_canceled(
  p_payment_intent_id TEXT,
  p_member_id UUID
) RETURNS void AS $$
BEGIN
  UPDATE payments
  SET
    status = 'canceled',
    canceled_at = NOW()
  WHERE stripe_payment_intent_id = p_payment_intent_id;

  UPDATE payment_request_members
  SET
    payment_status = 'canceled',
    updated_at = NOW()
  WHERE id = p_member_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION process_payment_canceled TO service_role;
```

### 4. Apply Migrations

Run the migrations:

```bash
supabase db push
```

### 5. Update Webhook Handler

The webhook handler will use these RPC functions like this:

```typescript
// In stripe-webhook Edge Function
case 'payment_intent.succeeded': {
  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const member_id = paymentIntent.metadata.payment_request_member_id

  // Use atomic transaction via RPC
  const { error } = await supabase.rpc('process_payment_success', {
    p_payment_intent_id: paymentIntent.id,
    p_charge_id: paymentIntent.latest_charge as string,
    p_member_id: member_id,
    p_amount_pence: paymentIntent.amount
  })

  if (error) {
    console.error('Failed to process payment success:', error)
    throw error // Webhook will be retried by Stripe
  }
  break
}
```

## Testing Your Implementation

1. **Test the function directly in Supabase SQL Editor:**

```sql
-- Test with dummy data (will fail with fake IDs but tests syntax)
SELECT process_payment_success(
  'pi_test123',
  'ch_test456',
  '00000000-0000-0000-0000-000000000000',
  2500
);
```

2. **Verify permissions:**

```sql
-- Check function exists and has correct permissions
SELECT has_function_privilege('service_role', 'process_payment_success(text,text,uuid,integer)', 'execute');
```

3. **Test rollback behavior:**

```sql
-- Try with non-existent member_id to trigger rollback
-- Should fail and rollback all changes
```

## Success Criteria

✅ All three RPC functions created (success, failure, canceled)  
✅ Functions use proper transaction semantics  
✅ Service role has execute permissions  
✅ Migrations applied to Supabase  
✅ Error handling triggers proper rollback

## Questions?

If you have any questions:

1. Check `/docs/stories/PAY-004-api-contracts.md` lines 538-629 for full context
2. The key requirement is atomicity - all operations succeed or all fail
3. This pattern will be reused for other payment operations

## Deadline

Please complete by end of day so development can proceed with PAY-004 implementation.

---

**Note**: This is a critical blocker for PAY-004. The Edge Functions are already specified to use these RPC functions, so they must exist before development begins.
