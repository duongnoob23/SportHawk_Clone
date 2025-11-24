-- Migration to fix notification triggers for Story PAY-004
-- Issue: Triggers use payment_request_users (empty) instead of payment_request_members (active)
-- Created: 2025-09-05

-- Step 1: Update notify_payment_requested function to use correct table
CREATE OR REPLACE FUNCTION public.notify_payment_requested()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  requester_name TEXT;
BEGIN
  -- Get requester name
  SELECT first_name || ' ' || last_name INTO requester_name
  FROM profiles
  WHERE id = NEW.created_by;
  
  -- Queue notifications for all payment members (FIXED: was payment_request_users)
  INSERT INTO notification_queue (user_id, template_id, variables, scheduled_for, priority)
  SELECT 
    prm.user_id,
    'payment.requested',
    jsonb_build_object(
      'amount', (prm.amount_pence::DECIMAL / 100)::TEXT,
      'requesterName', requester_name,
      'description', NEW.title,
      'paymentId', NEW.id,
      'dueDate', TO_CHAR(NEW.due_date, 'DD/MM/YYYY')
    ),
    NOW(),
    1
  FROM payment_request_members prm  -- FIXED: was payment_request_users
  WHERE prm.payment_request_id = NEW.id
  AND prm.payment_status = 'unpaid';  -- FIXED: was 'status = pending'
  
  -- Schedule 3-day reminder
  INSERT INTO notification_queue (user_id, template_id, variables, scheduled_for, priority)
  SELECT 
    prm.user_id,
    'payment.reminder',
    jsonb_build_object(
      'amount', (prm.amount_pence::DECIMAL / 100)::TEXT,
      'description', NEW.title,
      'daysUntilDue', 3,
      'daysPlural', 's',
      'paymentId', NEW.id
    ),
    NEW.due_date - INTERVAL '3 days',
    2
  FROM payment_request_members prm  -- FIXED: was payment_request_users
  WHERE prm.payment_request_id = NEW.id
  AND prm.payment_status = 'unpaid'  -- FIXED: was 'status = pending'
  AND NEW.due_date - INTERVAL '3 days' > NOW();
  
  -- Schedule 1-day reminder
  INSERT INTO notification_queue (user_id, template_id, variables, scheduled_for, priority)
  SELECT 
    prm.user_id,
    'payment.reminder',
    jsonb_build_object(
      'amount', (prm.amount_pence::DECIMAL / 100)::TEXT,
      'description', NEW.title,
      'daysUntilDue', 1,
      'daysPlural', '',
      'paymentId', NEW.id
    ),
    NEW.due_date - INTERVAL '1 day',
    2
  FROM payment_request_members prm  -- FIXED: was payment_request_users
  WHERE prm.payment_request_id = NEW.id
  AND prm.payment_status = 'unpaid'  -- FIXED: was 'status = pending'
  AND NEW.due_date - INTERVAL '1 day' > NOW();
  
  RETURN NEW;
END;
$function$;

-- Step 2: Verify the trigger is attached to the correct table
-- (This should already be correct, but let's verify)
DO $$
BEGIN
  -- Check if trigger exists on payment_requests table
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_payment_requested' 
    AND tgrelid = 'payment_requests'::regclass
  ) THEN
    CREATE TRIGGER trigger_payment_requested
    AFTER INSERT ON payment_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_payment_requested();
  END IF;
END $$;

-- Step 3: The notify_payment_success function is already correct
-- It triggers on the payments table which is what we want
-- No changes needed there

-- Step 4: Add comment to document the fix
COMMENT ON FUNCTION public.notify_payment_requested() IS 
'Sends payment request notifications. Fixed 2025-09-05 to use payment_request_members instead of payment_request_users table.';

-- Step 5: Optional - Clean up the unused table (only if confirmed safe)
-- WARNING: Only uncomment if absolutely certain payment_request_users is not needed
-- DROP TABLE IF EXISTS payment_request_users CASCADE;

-- Verification Query (run after migration):
-- SELECT 
--   'payment_request_members' as table_name,
--   COUNT(*) as row_count,
--   'Should have data' as expected
-- FROM payment_request_members
-- UNION ALL
-- SELECT 
--   'payment_request_users' as table_name,
--   COUNT(*) as row_count,
--   'Should be empty or dropped' as expected
-- FROM payment_request_users;