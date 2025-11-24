# PAY-004 Developer Handoff Package

## Executive Summary

You're implementing Stripe backend integration via Supabase Edge Functions. This is the FIRST Edge Function implementation in the project, so you're establishing patterns. The existing payment UI (Stories 1-3) needs these backend functions to process actual payments.

## 🚨 CRITICAL - Read These First

### Absolute Blockers to Resolve

1. **Get Webhook Secret**: Obtain `STRIPE_WEBHOOK_SECRET` from Stripe Dashboard
2. **Install Supabase CLI**: Required for local development (see setup guide)
3. ~~Apply Database Migration~~ **SKIP** - Notifications deferred to future story

### Key Decisions Already Made

- ✅ Use `payment_request_members` table (NOT `payment_request_users`)
- ✅ SportHawk pays ALL Stripe fees (no `application_fee_amount`)
- ✅ Currency is GBP only for MVP
- ✅ Each payment attempt creates new PaymentIntent (no reuse)
- ✅ **NO NOTIFICATIONS** - Out of scope for Story 4

## 📁 Required Reading (In Order)

1. **Main Story**: `/docs/stories/PAY-004-stripe-backend-integration.md`
2. **Critical Blockers**: `/docs/stories/PAY-004-critical-blockers-and-decisions.md`
3. **API Contracts**: `/docs/stories/PAY-004-api-contracts.md` ⭐ EXACT implementation specs
4. **Setup Guide**: `/docs/stories/PAY-004-supabase-cli-setup.md` ⭐ Do this first
5. **Webhook Secret Guide**: `/docs/stories/PAY-004-webhook-secret-setup.md` ⭐ Detailed instructions
6. ~~Migration SQL~~ **SKIP** - Notifications deferred to future story

## 🎯 Your Implementation Checklist

### Pre-Development Setup (30 mins)

- [ ] Read all documents above
- [ ] Get `STRIPE_WEBHOOK_SECRET` from Stripe Dashboard
- [ ] Install Supabase CLI: `brew install supabase/tap/supabase`
- [ ] Initialize project: `supabase init`
- [ ] Link to project: `supabase link --project-ref vwqfwehtjnjenzrhzgol`
- [ ] Create `.env.local` with secrets
- [ ] ~~Apply database migration~~ **SKIP** - Not needed for Story 4

### Task 1: Setup Edge Functions Environment (1 hour)

- [ ] Create `/supabase/functions/` directory structure
- [ ] Create `import_map.json` for dependencies
- [ ] Add secrets to Supabase: `supabase secrets set STRIPE_SECRET_KEY=...`
- [ ] Test local setup: `supabase start`

### Task 2: Implement stripe-create-payment (2 hours)

- [ ] Copy exact implementation from API contracts doc
- [ ] Test locally with: `supabase functions serve stripe-create-payment`
- [ ] Verify database updates correctly
- [ ] Test with existing `payment_request_members` records

### Task 3: Implement stripe-webhook (2 hours)

- [ ] Copy exact implementation from API contracts doc
- [ ] Setup Stripe CLI forwarding
- [ ] Test with: `stripe trigger payment_intent.succeeded`
- [ ] Verify payment_transactions created
- [ ] ~~Verify notifications~~ **SKIP** - Not in scope

### Task 4: Update Client API (1 hour)

- [ ] Add methods to `/lib/api/payments.ts` (see API contracts)
- [ ] Test `initiatePayment()` method
- [ ] Test `checkPaymentStatus()` method
- [ ] ~~Remove notification calls~~ **SKIP** - Handle in future story

### Task 5: Deploy & Configure (1 hour)

- [ ] Deploy functions: `supabase functions deploy`
- [ ] Configure webhook in Stripe Dashboard
- [ ] Test production endpoints
- [ ] Document any issues found

## 🔧 Technical Details

### Database Tables You'll Use

- `payment_request_members` - Payment assignments (4 existing records)
- `payments` - Payment attempts tracking
- `payment_transactions` - Successful payment records
- `stripe_accounts` - Team Stripe accounts (1 existing)

### Environment Variables

```bash
# Already in .env
STRIPE_SECRET_KEY=sk_test_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# You need to add
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe Dashboard
```

### Stripe Configuration

- Test mode keys (already in .env)
- Destination charges pattern (team gets full amount)
- SportHawk absorbs all fees (~2% + £0.20)
- Statement descriptor: "SPORTHAWK"

## ⚠️ Common Pitfalls to Avoid

1. **DON'T** use `payment_request_users` table - it's empty/unused
2. **DON'T** add `application_fee_amount` to PaymentIntent
3. **DON'T** forget to use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
4. **DON'T** modify existing RLS policies
5. **DON'T** break existing payment request data (3 requests, 4 members)
6. **DON'T** implement any notification logic (deferred to future story)

## 🧪 Testing Strategy

### Local Testing

```bash
# 1. Start Supabase locally
supabase start

# 2. Serve Edge Function
supabase functions serve stripe-create-payment --env-file supabase/.env.local

# 3. Test with curl
curl -X POST http://localhost:54321/functions/v1/stripe-create-payment \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"payment_request_member_id":"REAL_UUID_FROM_DB"}'

# 4. Test webhooks
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
stripe trigger payment_intent.succeeded
```

### Production Testing

1. Use Stripe test cards: `4242 4242 4242 4242`
2. Check logs: `supabase functions logs stripe-create-payment --project-ref vwqfwehtjnjenzrhzgol`
3. Verify in Stripe Dashboard: https://dashboard.stripe.com/test/payments

## 📊 Success Criteria

Your implementation is complete when:

- ✅ Can create PaymentIntent via Edge Function
- ✅ Webhook processes successful payments
- ✅ Database tables update correctly (NO notification triggers)
- ✅ Client can call functions via `supabase.functions.invoke()`
- ✅ No regression in existing payment UI
- ✅ Deployed to production Supabase
- ✅ Webhook configured in Stripe Dashboard

## 🆘 Getting Help

### Resources

- Stripe Destination Charges: https://stripe.com/docs/connect/destination-charges
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Project Supabase Dashboard: https://app.supabase.com/project/vwqfwehtjnjenzrhzgol

### Known Issues

- ~~Notification triggers broken~~ Not relevant for Story 4 (notifications out of scope)
- No existing Edge Functions to reference (you're first!)
- `payment_request_users` table exists but unused (use `payment_request_members`)

### If Blocked

1. Check the API contracts document for exact specifications
2. Verify Supabase CLI is properly configured
3. Check Edge Function logs for errors
4. Verify Stripe webhook signature matches

## 📝 Documentation to Update

After implementation, update:

1. This story document with "Dev Agent Record" section
2. Any issues found or deviations from plan
3. Deployment instructions if different from guide
4. Any new patterns established for future Edge Functions

## 🎯 Quick Start Commands

```bash
# Setup (one time)
brew install supabase/tap/supabase
supabase init
supabase link --project-ref vwqfwehtjnjenzrhzgol

# Development
supabase start
supabase functions serve stripe-create-payment --env-file supabase/.env.local
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Deployment
supabase functions deploy
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Debugging
supabase functions logs stripe-create-payment
```

---

**Remember**: You're creating the FIRST Edge Functions in this project. Your patterns will be followed by others. Take time to do it right, document well, and test thoroughly.

**Most Important**: Follow the API contracts document EXACTLY. It contains the complete, tested implementation code.
