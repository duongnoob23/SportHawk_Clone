# PAY-004 Edge Functions Deployment Guide

## ✅ DEPLOYMENT COMPLETED - 2025-09-06

**Status:** Successfully deployed to production
**Functions Active:** stripe-create-payment, stripe-webhook
**Testing:** Completed with RPC fix applied

## Prerequisites

- Supabase CLI installed (`brew install supabase/tap/supabase`)
- Access to Supabase project dashboard
- Stripe account with webhook access

## Deployment Steps

### 1. Set Supabase Secrets

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref vwqfwehtjnjenzrhzgol

# Set the Stripe secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### 2. Deploy Edge Functions

```bash
# Deploy the create payment function
supabase functions deploy stripe-create-payment

# Deploy the webhook handler
supabase functions deploy stripe-webhook
```

### 3. Configure Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://vwqfwehtjnjenzrhzgol.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the signing secret (should match STRIPE_WEBHOOK_SECRET in .env)

### 4. Test the Functions

#### Test Payment Intent Creation

```bash
# Test locally
curl -X POST http://localhost:54321/functions/v1/stripe-create-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"payment_request_member_id": "MEMBER_UUID"}'

# Test in production
curl -X POST https://vwqfwehtjnjenzrhzgol.supabase.co/functions/v1/stripe-create-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"payment_request_member_id": "MEMBER_UUID"}'
```

#### Test Webhook with Stripe CLI

```bash
# Install Stripe CLI if not already installed
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local Edge Function
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger payment_intent.canceled
```

## Environment Variables

### Local Development (.env)

```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Supabase Secrets (Edge Functions)

- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-available in Edge Functions

## Monitoring

### Check Function Logs

```bash
# View logs for create payment function
supabase functions logs stripe-create-payment

# View logs for webhook handler
supabase functions logs stripe-webhook
```

## Deployment History

### 2025-09-06 Deployment

- **16:53:02 UTC** - stripe-create-payment deployed (v1)
- **16:53:26 UTC** - stripe-webhook deployed (v1)
- **18:45:00 UTC** - RPC function fix applied for payment_requests totals

### Test Results

- ✅ Payment member creation and tracking
- ✅ Payment transaction recording
- ✅ Payment status updates (unpaid → paid)
- ✅ Payment request totals calculation (after fix)
- ✅ Atomic database operations via RPC

### Production Endpoints

- Payment Creation: `https://vwqfwehtjnjenzrhzgol.supabase.co/functions/v1/stripe-create-payment`
- Webhook Handler: `https://vwqfwehtjnjenzrhzgol.supabase.co/functions/v1/stripe-webhook`

### Known Issues Resolved

- ✅ Fixed: Payment request totals not updating (RPC function updated)
- ✅ Fixed: Nested joins in Edge Function (simplified query approach)

### Verify Database Updates

```sql
-- Check payment_request_members for PaymentIntent IDs
SELECT id, user_id, payment_status, stripe_payment_intent_id
FROM payment_request_members
WHERE stripe_payment_intent_id IS NOT NULL;

-- Check payments table for attempts
SELECT id, status, stripe_payment_intent_id, created_at
FROM payments
ORDER BY created_at DESC;

-- Check payment_transactions for successful payments
SELECT * FROM payment_transactions;
```

## Troubleshooting

### Function Not Found

- Ensure functions are deployed: `supabase functions list`
- Check function names match exactly

### Webhook Signature Invalid

- Verify STRIPE_WEBHOOK_SECRET matches Stripe Dashboard
- Ensure raw body is passed to webhook verification

### Database Errors

- Check RLS policies aren't blocking SERVICE_ROLE_KEY
- Verify RPC functions exist: `process_payment_success`, `process_payment_failure`, `process_payment_canceled`

### Payment Intent Creation Fails

- Verify stripe_accounts table has valid account for team
- Check payment_request_members record exists
- Ensure user hasn't already paid (check payment_status)

## Production Checklist

- [ ] All Edge Functions deployed
- [ ] Secrets configured in Supabase
- [ ] Webhook URL configured in Stripe
- [ ] Test payment flow working
- [ ] Database updates correctly
- [ ] Error handling tested
- [ ] Monitoring in place
