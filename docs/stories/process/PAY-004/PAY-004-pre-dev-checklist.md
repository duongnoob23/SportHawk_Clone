# Pre-Development Checklist for Story PAY-004

## \ud83d\udd34 CRITICAL BLOCKERS (Must resolve before dev starts)

### 1. ~~Stripe Account Settings~~ ✅ NOT A BLOCKER AT ALL!

**Clarification - SportHawk's Responsibility**:

- SportHawk gets money INTO team's Stripe Connect account
- Teams use Stripe's own dashboard/app for payouts
- SportHawk doesn't handle withdrawals or bank transfers
- `charges_enabled: false` ✅ Irrelevant
- `payouts_enabled: false` ✅ Also irrelevant

**No Action Required** - The Connect account is fine as-is!

### 2. Webhook Secret Missing

**Issue**: `STRIPE_WEBHOOK_SECRET` not in .env

**Action Required**:

- [ ] Get webhook signing secret from Stripe Dashboard
- [ ] Add to local .env for testing
- [ ] Plan to add to Supabase secrets

## \u2705 READY TO GO (Already verified)

### Environment Variables

- \u2705 `STRIPE_SECRET_KEY` (test mode) - in .env
- \u2705 `STRIPE_PUBLISHABLE_KEY` (test mode) - in .env
- \u2705 `SUPABASE_SERVICE_ROLE_KEY` - in .env
- \u2705 Supabase project ID: vwqfwehtjnjenzrhzgol

### Database Infrastructure

- \u2705 All payment tables exist with correct schema
- \u2705 RLS policies configured
- \u2705 Helper functions (`user_can_manage_payment_request`, `is_super_admin`)
- \u2705 3 payment requests already created (test data available)
- \u2705 4 payment member assignments (test data available)

### Client Code

- \u2705 `/lib/api/payments.ts` exists with basic structure
- \u2705 TypeScript types from Database available
- \u2705 Logger utility available

## \u26a0\ufe0f IMPORTANT NOTES FOR DEVELOPER

### First Edge Functions in Project

You are creating the FIRST Edge Functions in this project. Your patterns will be followed by others:

- Establish clear error handling patterns
- Set up proper TypeScript types structure
- Create reusable utilities in `_shared/` directory
- Document deployment process clearly

### Existing Data - DO NOT BREAK

- 3 payment requests exist - test with these
- 4 member assignments exist - don't corrupt
- 1 Stripe account configured - verify before using

### Missing Dependencies (for Story 5, not this story)

- `@stripe/stripe-react-native` NOT installed
- This is needed for Story 5, not Story 4

### Testing Requirements

1. Test with existing payment_request_member records
2. Use Stripe test mode (keys already configured)
3. Test webhook with Stripe CLI
4. Verify RLS bypass with service role key
5. Don't break existing data

## \ud83d\udcdd DEPLOYMENT NOTES

### Supabase Secrets to Configure

```bash
# Run these in Supabase Dashboard or CLI
supabase secrets set STRIPE_SECRET_KEY=sk_test_... # Use value from .env
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... # Get from Stripe Dashboard
```

### Edge Function Deployment

```bash
supabase functions deploy stripe-create-payment
supabase functions deploy stripe-webhook
```

### Webhook URL for Stripe Dashboard

```
https://vwqfwehtjnjenzrhzgol.supabase.co/functions/v1/stripe-webhook
```

## \ud83c\udfaf SUCCESS CRITERIA

Before marking Story 4 complete:

- [ ] Edge Functions deployed to Supabase
- [ ] Webhook configured in Stripe Dashboard
- [ ] Test payment intent created successfully
- [ ] Webhook processes test events
- [ ] Database updated correctly
- [ ] Existing data still intact
- [ ] Client can call Edge Functions
- [ ] Documentation updated with deployment steps

## \ud83d\udd17 REFERENCES

- Stripe Test Cards: https://stripe.com/docs/testing
- Destination Charges: https://stripe.com/docs/connect/destination-charges
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Stripe CLI: https://stripe.com/docs/stripe-cli
