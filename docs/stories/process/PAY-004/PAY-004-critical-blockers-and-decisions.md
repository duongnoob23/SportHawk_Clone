# PAY-004 Critical Blockers & Decision Points

_Generated: 2025-09-05 by Sarah (PO)_

## 🔴 ABSOLUTE BLOCKERS - Cannot Start Without These

### 1. ~~Database Migration Decision Required~~ RESOLVED

**DECISION MADE**: Notifications OUT OF SCOPE for Story 4

- Migration DEFERRED to future notifications story
- Story 4 focuses purely on payment processing
- No notification triggers will be fixed or tested
- See `/docs/stories/PAY-004-notification-migration-deferred.md`

**NO ACTION REQUIRED** for Story 4

### 2. Supabase CLI Not Configured

**THE PROBLEM**: Zero Supabase configuration exists

- No `supabase` directory
- No `.supabase` config
- No `config.toml`
- How will dev test Edge Functions locally?

**ACTION REQUIRED**:

```bash
# Dev needs to run these BEFORE starting
npx supabase init
npx supabase link --project-ref vwqfwehtjnjenzrhzgol
```

### 3. Webhook Secret Missing

**THE PROBLEM**: No `STRIPE_WEBHOOK_SECRET` exists

- Cannot verify webhook signatures
- Security vulnerability if we skip verification

**ACTION REQUIRED**:

1. Get from Stripe Dashboard → Webhooks → Signing secret
2. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`
3. Add to Supabase secrets before deployment

## 🟠 HIGH-RISK AMBIGUITIES - Will Cause Bugs

### 1. Fee Structure Implementation Unclear

**THE PROBLEM**: "SportHawk pays all fees" but HOW?

- Design doc says SportHawk absorbs fees (£25 paid = £25 received by team)
- But Stripe destination charges have multiple fee models

**CRITICAL QUESTION**: Which implementation?

```typescript
// Option A: No application fee
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2500, // £25.00
  transfer_data: {
    destination: 'acct_1S3IfWBLqK6d4VGk', // Team gets full £25
  },
  // SportHawk account charged Stripe fees (~£0.51)
});

// Option B: With application fee (WRONG per design)
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2500,
  application_fee_amount: 0, // Explicit zero?
  transfer_data: {
    destination: 'acct_1S3IfWBLqK6d4VGk',
  },
});
```

### 2. Error Recovery Not Defined

**THE PROBLEM**: What happens when things fail?

**UNDEFINED SCENARIOS**:

- Payment succeeds but database update fails
- Webhook received but Edge Function crashes
- Duplicate webhook delivery
- User refreshes during payment
- Network timeout during processing

**MISSING**: Idempotency strategy

```typescript
// Where's the idempotency key?
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2500,
  // idempotencyKey: ??? // Not specified!
});
```

### 3. Testing Infrastructure Missing

**THE PROBLEM**: No test framework configured

- No Jest/Vitest in package.json
- No test files exist
- No CI/CD pipeline
- No staging environment

**QUESTION**: How does dev verify their code works?

## 🟡 TECHNICAL SPECIFICATIONS MISSING

### 1. Exact API Contract Not Defined

```typescript
// What EXACTLY should dev implement?

// Option A: Simple
initiatePayment(paymentRequestMemberId: string): Promise<{clientSecret: string}>

// Option B: With validation
initiatePayment({
  paymentRequestMemberId: string,
  amount?: number, // Client-side validation?
  currency?: string, // Multi-currency support?
}): Promise<{
  clientSecret: string,
  amount: number,
  currency: string,
  paymentIntentId: string,
}>

// Option C: With metadata
initiatePayment({
  paymentRequestMemberId: string,
  metadata?: Record<string, any>, // For tracking?
}): Promise<{
  clientSecret: string,
  ephemeralKey?: string, // For mobile SDK?
}>
```

### 2. Status State Machine Undefined

**QUESTION**: When exactly do statuses change?

```
payment_request_members.payment_status:
  'unpaid' → ??? → 'paid'

When does it become 'processing'?
What about 'failed'?
Can it go from 'paid' → 'refunded'?
```

### 3. Stripe Metadata Requirements

**NOT SPECIFIED**:

- What appears on customer's bank statement?
- What metadata to attach for reconciliation?
- How to link Stripe objects to our database?

```typescript
// What should dev put here?
const paymentIntent = await stripe.paymentIntents.create({
  description: ???, // "SportHawk Payment"? "Team XYZ - Match Fees"?
  statement_descriptor: ???, // "SPORTHAWK"? Max 22 chars
  metadata: {
    payment_request_member_id: ???,
    payment_request_id: ???,
    team_id: ???,
    user_id: ???,
    // What else?
  }
});
```

## 📝 MISSING DOCUMENTATION

### 1. Local Development Setup

**NOT DOCUMENTED**:

- How to run Edge Functions locally
- How to test webhooks with Stripe CLI
- How to connect to Supabase project
- Required environment variables

### 2. Deployment Process

**NOT DEFINED**:

- Who deploys to production?
- What's the deployment command?
- How to rollback if broken?
- How to monitor Edge Functions?

### 3. Error Handling Standards

**NOT SPECIFIED**:

- Error code format
- User-facing vs system errors
- Logging requirements
- PII considerations

## 🚨 DISCOVERED ISSUES

### 1. Existing Code Expects Different Edge Function

`/lib/api/payments.ts` line 114 calls non-existent Edge Function:

```typescript
await supabase.functions.invoke('send-payment-notifications', {
  body: { paymentRequestId, memberIds },
});
```

This doesn't match Story 4's Edge Functions!

### 2. Currency Hardcoded as GBP

`payment_request_members` inserts hardcode 'GBP' (line 88)

- What about EUR teams?
- What about USD payments?
- Stripe needs currency in PaymentIntent

### 3. No Monitoring/Observability

- How to debug production issues?
- Where are Edge Function logs?
- How to track payment success rate?
- No APM/error tracking configured

## ✅ DECISIONS NEEDED BEFORE DEV STARTS

1. **Migration Strategy**
   - [ ] Fix notification triggers in Story 4 or separate story?

2. **Fee Model**
   - [ ] Confirm no `application_fee_amount` field
   - [ ] Confirm SportHawk account pays Stripe fees

3. **API Contract**
   - [ ] Define exact request/response format
   - [ ] Define error response format

4. **Testing Approach**
   - [ ] Local testing with Supabase CLI?
   - [ ] Manual testing only?
   - [ ] Set up test framework first?

5. **Currency Support**
   - [ ] GBP only for MVP?
   - [ ] Multi-currency from start?

6. **Deployment Owner**
   - [ ] Who deploys Edge Functions?
   - [ ] What's the approval process?

## 🎯 MINIMUM VIABLE CLARIFICATIONS

If we're truly doing MVP, here are the ABSOLUTE MINIMUM decisions:

1. **Include trigger migration**: YES/NO
2. **Webhook secret**: Obtain and add to .env
3. **Test locally**: Install Supabase CLI first
4. **Fee structure**: No application_fee field
5. **Currency**: GBP only
6. **Error handling**: Log and return generic message

## 📊 RISK ASSESSMENT

**If we proceed without resolving blockers**:

- 🔴 HIGH: Notifications won't work (broken triggers)
- 🔴 HIGH: Can't verify webhooks (missing secret)
- 🔴 HIGH: Can't test locally (no Supabase CLI)
- 🟠 MEDIUM: Wrong fee calculations
- 🟠 MEDIUM: Duplicate payments possible
- 🟡 LOW: Poor error messages

## 🚀 RECOMMENDED NEXT STEPS

1. **IMMEDIATE** (Before dev starts):
   - [ ] Get webhook secret from Stripe
   - [ ] Install Supabase CLI
   - [ ] Decide on trigger migration
   - [ ] Define exact API contract

2. **DURING DEVELOPMENT**:
   - [ ] Create migration for triggers
   - [ ] Document local setup process
   - [ ] Test with existing data
   - [ ] Create deployment guide

3. **BEFORE DEPLOYMENT**:
   - [ ] Review error handling
   - [ ] Test webhook reliability
   - [ ] Verify RLS policies work
   - [ ] Document rollback process

---

**Bottom Line**: Story 4 has significant gaps that will block or confuse /dev. The most critical are the broken notification triggers and missing Supabase CLI setup. Without addressing these, development will be slow and buggy.
