# Complete Payment Infrastructure Audit for Story PAY-004

## Executive Summary

Comprehensive audit of existing payment infrastructure in Supabase project (vwqfwehtjnjenzrhzgol) conducted 2025-09-05.

## 🔴 CRITICAL FINDINGS

### 1. TWO Parallel Payment Tracking Systems Exist!

- **`payment_request_users`** table (0 rows) - Appears unused
- **`payment_request_members`** table (4 rows) - Currently being used
- Both have similar structure but `payment_request_members` is the active one
- Design document references "payments" table for member assignments (line 101)

### 2. Automated Notification System Already Built!

- **TRIGGER**: `trigger_payment_requested` on `payment_requests` INSERT
- **FUNCTION**: `notify_payment_requested()` queues notifications
- **TRIGGER**: `trigger_payment_success` on `payments` UPDATE
- **FUNCTION**: `notify_payment_success()` sends success notifications
- Uses `notification_queue` table with templates

### 3. Payment Flow Clarified

```
payment_requests (master)
  └→ payment_request_members (assignments)
       └→ payments (Stripe payment attempts)
            └→ payment_transactions (completed records)
```

## Database Tables Structure

### Core Payment Tables

#### `payment_requests` (3 rows)

- Primary request record
- Links to `teams` and `profiles` (created_by)
- Has `payment_type` field (required/optional)
- Tracks: total_members, paid_members, total_collected_pence

#### `payment_request_members` (4 rows) - ACTIVE

- Individual member assignments
- Has `stripe_payment_intent_id` field
- Status: unpaid/paid/refunded/failed
- Links to `payment_requests` and `users`

#### `payment_request_users` (0 rows) - UNUSED/DUPLICATE?

- Similar structure to payment_request_members
- Has both `amount` (numeric) AND `amount_pence` (integer)
- Unique constraint on payment_request_id + user_id

#### `payments` (0 rows)

- Tracks actual Stripe payment attempts
- Links to `payment_requests` (nullable)
- Has stripe_payment_intent_id and stripe_charge_id
- Status: pending/completed/failed/refunded

#### `payment_transactions` (0 rows)

- Final transaction records
- Links to `payment_request_members` (NOT payments!)
- Unique constraint on stripe_payment_intent_id
- Tracks platform_fee_pence and net_amount_pence

#### `payment_reminders` (0 rows)

- Manual/automatic reminder tracking
- Links to payment_requests and users

#### `stripe_accounts` (1 row)

- Team Stripe Connect accounts
- Unique constraint on team_id
- Account: acct_1S3IfWBLqK6d4VGk

## Database Functions & Triggers

### Functions

1. **`user_can_manage_payment_request(payment_request_uuid)`**
   - Returns boolean
   - Checks if user is creator OR team admin

2. **`notify_payment_requested()`**
   - Trigger function
   - Creates notifications in `notification_queue`
   - Schedules 3-day and 1-day reminders

3. **`notify_payment_success()`**
   - Trigger function
   - Sends success notification
   - Cancels pending reminders

### Triggers

- `trigger_payment_requested` - After INSERT on payment_requests
- `trigger_payment_success` - After UPDATE on payments
- Multiple `update_*_updated_at` triggers for timestamp maintenance

## RLS Policies (Already Verified)

- Team admins can create/update payment_requests
- Users can view their own payment obligations
- Super admin override functions exist
- Service role key bypasses all RLS

## Foreign Key Relationships

```
payment_requests.team_id → teams.id
payment_requests.created_by → profiles.id
payment_request_members.payment_request_id → payment_requests.id
payment_request_members.user_id → auth.users.id
payment_request_users.payment_request_id → payment_requests.id
payment_request_users.user_id → auth.users.id
payments.payment_request_id → payment_requests.id
payments.user_id → auth.users.id
payment_transactions.payment_request_member_id → payment_request_members.id
payment_reminders.payment_request_id → payment_requests.id
stripe_accounts.team_id → teams.id
```

## Edge Functions Status

- **NONE EXIST** - Story 4 creates the first ones

## Environment Variables

- ✅ STRIPE_SECRET_KEY (test mode) in .env
- ✅ STRIPE_PUBLISHABLE_KEY (test mode) in .env
- ✅ SUPABASE_SERVICE_ROLE_KEY in .env
- ❌ STRIPE_WEBHOOK_SECRET missing

## Key Insights for Story 4 Implementation

### MUST ADDRESS:

1. **Clarify payment_request_users vs payment_request_members**
   - Why do both exist?
   - Should Story 4 use payment_request_members (has data)?

2. **Notification System Already Built**
   - Triggers fire automatically
   - Uses notification_queue table
   - Story 4 shouldn't duplicate this

3. **Payment Flow Confirmation**
   - payment_transactions links to payment_request_members
   - NOT to payments table
   - Is this intentional?

4. **Design Document Discrepancy**
   - Design says "payments" table for assignments (line 101)
   - But we use "payment_request_members"
   - Design predates current implementation?

### Story 4 Edge Functions Must:

1. Create payment intent for payment_request_member record
2. Update stripe_payment_intent_id in payment_request_members
3. Create payments record for tracking
4. Handle webhook to update payment_transactions
5. Let existing triggers handle notifications

## Recommendation

Before implementing Story 4, clarify:

1. Which table for member assignments (payment_request_users vs payment_request_members)?
2. Should Edge Functions respect existing notification triggers?
3. Correct relationship: payment_transactions → payment_request_members or payments?
