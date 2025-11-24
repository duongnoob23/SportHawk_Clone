-- Migration: PAY-004 RPC Functions for Atomic Payment Processing
-- Purpose: Ensure atomic database operations for payment processing to prevent partial updates
-- Author: Alex (Dev Lead)
-- Date: 2025-09-06
-- Tested: Yes - All functions tested with rollback verification

-- ============================================
-- FUNCTION 1: process_payment_success
-- ============================================
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
    paid_at = NOW(),  -- Fixed: was completed_at (column doesn't exist)
    updated_at = NOW()
  WHERE stripe_payment_intent_id = p_payment_intent_id;
  
  -- 2. Insert payment transaction
  INSERT INTO payment_transactions (
    id,  -- Added: id field required
    payment_request_member_id,
    stripe_payment_intent_id,
    stripe_charge_id,
    amount_pence,
    currency,
    transaction_status,  -- Fixed: was 'status' (column doesn't exist)
    platform_fee_pence,
    net_amount_pence,
    created_at
  ) VALUES (
    gen_random_uuid(),
    p_member_id,
    p_payment_intent_id,
    p_charge_id,
    p_amount_pence,
    'GBP',
    'succeeded',  -- Fixed: was 'completed' (not valid per constraint)
    0, -- SportHawk pays fees
    p_amount_pence,
    NOW()
  );
  
  -- 3. Update payment_request_members
  UPDATE payment_request_members 
  SET 
    payment_status = 'paid',
    paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_member_id;
  
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
  
  -- If any operation fails, all rollback automatically
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role (used by Edge Functions)
GRANT EXECUTE ON FUNCTION process_payment_success TO service_role;

-- ============================================
-- FUNCTION 2: process_payment_failure
-- ============================================
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
    error_message = p_failure_reason,  -- Fixed: was failure_reason (column doesn't exist)
    updated_at = NOW()
  WHERE stripe_payment_intent_id = p_payment_intent_id;
  
  -- Update payment_request_members
  UPDATE payment_request_members 
  SET 
    payment_status = 'failed',
    failure_reason = p_failure_reason,
    paid_at = NULL,  -- Fixed: Must be NULL for failed status (constraint)
    updated_at = NOW()
  WHERE id = p_member_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION process_payment_failure TO service_role;

-- ============================================
-- FUNCTION 3: process_payment_canceled
-- ============================================
CREATE OR REPLACE FUNCTION process_payment_canceled(
  p_payment_intent_id TEXT,
  p_member_id UUID
) RETURNS void AS $$
BEGIN
  -- Update payments table
  UPDATE payments 
  SET 
    status = 'failed',  -- Fixed: was 'canceled' (not valid per constraint)
    error_message = 'Payment canceled by user',
    updated_at = NOW()
  WHERE stripe_payment_intent_id = p_payment_intent_id;
  
  -- Update payment_request_members
  UPDATE payment_request_members 
  SET 
    payment_status = 'unpaid',  -- Fixed: reset to unpaid when canceled
    paid_at = NULL,  -- Fixed: Must be NULL for unpaid status (constraint)
    failure_reason = NULL,
    updated_at = NOW()
  WHERE id = p_member_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION process_payment_canceled TO service_role;

-- ============================================
-- NOTES ON FIXES MADE DURING TESTING:
-- ============================================
-- 1. payments.completed_at → payments.paid_at (column name fix)
-- 2. payments.failure_reason → payments.error_message (column name fix)
-- 3. payment_transactions.status → payment_transactions.transaction_status (column name fix)
-- 4. transaction_status: 'completed' → 'succeeded' (constraint compliance)
-- 5. payments.status: 'canceled' → 'failed' (constraint compliance)
-- 6. Added id field to payment_transactions INSERT (required field)
-- 7. Fixed paid_at constraints (must be NULL for non-paid statuses)
-- 8. process_payment_canceled resets to 'unpaid' not 'canceled'
--
-- All functions tested with:
-- - Success scenarios
-- - Failure scenarios
-- - Rollback behavior (atomic transactions verified)
-- ============================================