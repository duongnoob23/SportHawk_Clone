# PAY-004: Product Owner Action Required

## To: Sarah (Product Owner)

## From: Quinn (QA Test Architect)

## Date: 2025-09-06

## Priority: 🔴 URGENT - Blocking Development

---

## Executive Summary

Story PAY-004 (Stripe Backend Integration) has passed most of the QA review but has **2 remaining blockers** and **2 recommendations** that require your immediate decisions. Development cannot safely proceed without resolving the blockers.

**Good news**: The STRIPE_WEBHOOK_SECRET has been confirmed in the .env file, so that blocker is resolved.

**Time Required**: 15-30 minutes to make decisions and update documentation.

---

## 🔴 BLOCKERS - Must Resolve Before Development

### 1. Idempotency Strategy Definition

**The Problem**: Without idempotency, if a user clicks "Pay" multiple times or network issues cause retries, they could be charged multiple times for the same payment.

**What You Need to Decide**:

Choose one of these idempotency key strategies:

**Option A: Member ID + Timestamp** (Recommended)

```typescript
// In stripe-create-payment Edge Function
const idempotencyKey = `${payment_request_member_id}_${Date.now()}`;
const paymentIntent = await stripe.paymentIntents.create(
  {
    amount: member.amount_pence,
    // ... other fields
  },
  {
    idempotencyKey: idempotencyKey,
  }
);
```

**Pros**: Simple, allows legitimate retries after time window
**Cons**: User could still create multiple payments if clicking rapidly

**Option B: Member ID + Version/Attempt Counter**

```typescript
// Track attempt number in payment_request_members table
const attemptNumber = member.payment_attempt_count + 1;
const idempotencyKey = `${payment_request_member_id}_attempt_${attemptNumber}`;
```

**Pros**: More controlled, can track payment attempts
**Cons**: Requires database schema change to add attempt counter

**Option C: One Payment Intent Per Member** (Most Conservative)

```typescript
// Reuse existing payment intent if one exists
if (member.stripe_payment_intent_id) {
  // Retrieve and return existing intent
  const existingIntent = await stripe.paymentIntents.retrieve(member.stripe_payment_intent_id);
  if (existingIntent.status === 'requires_payment_method') {
    return { client_secret: existingIntent.client_secret, ... };
  }
}
// Only create new if none exists or previous failed
```

**Pros**: Absolutely prevents duplicates
**Cons**: More complex state management

**YOUR ACTION**:

- [ ] Choose Option A, B, or C
- [ ] Add your choice to `/docs/stories/PAY-004-api-contracts.md` at line 47 (before PaymentIntent creation)

---

### 2. Error Recovery Strategy for Database Failures

**The Problem**: If we create a Stripe PaymentIntent successfully but then the database insert fails, we have a "orphaned" payment intent that could result in payment without tracking.

**What You Need to Decide**:

**Recommended Approach**: Cancel PaymentIntent on Database Failure

```typescript
try {
  // Create PaymentIntent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({...});

  try {
    // Insert into payments table
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({...});

    if (paymentError) {
      // ROLLBACK: Cancel the PaymentIntent
      await stripe.paymentIntents.cancel(paymentIntent.id);
      throw new Error('Failed to record payment attempt');
    }

    // Continue with success flow...

  } catch (dbError) {
    // Ensure PaymentIntent is cancelled
    await stripe.paymentIntents.cancel(paymentIntent.id);
    throw dbError;
  }

} catch (error) {
  // Return error to client
}
```

**Alternative Approach**: Log and Monitor (Less Safe)

- Create PaymentIntent
- If DB fails, log error but return success
- Have daily reconciliation to find orphaned intents
- **Risk**: Payments could process without our system knowing

**YOUR ACTION**:

- [ ] Approve the recommended "Cancel on Failure" approach
- [ ] OR specify alternative approach
- [ ] Add decision to `/docs/stories/PAY-004-api-contracts.md` at line 146 (after payment insert)

---

## 🟡 RECOMMENDATIONS - Should Address

### 3. Additional Webhook Events

**Current Setup**: Only handling 2 events:

- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`

**Consider Adding for Better UX**:

**Option A: Minimal Addition** (Recommended for MVP)
Add just one more:

- `payment_intent.canceled` - User explicitly cancels

**Option B: Comprehensive Coverage**
Add these for complete flow:

- `payment_intent.canceled` - User cancels
- `payment_intent.processing` - Payment processing (for loader states)
- `payment_intent.requires_action` - 3D Secure needed

**Implementation for Unhandled Events**:

```typescript
// In webhook handler
switch (event.type) {
  case 'payment_intent.succeeded':
    // existing code
    break;
  case 'payment_intent.payment_failed':
    // existing code
    break;
  default:
    // Log unhandled event for monitoring
    console.log(`Unhandled webhook event: ${event.type}`);
    break;
}
```

**YOUR ACTION**:

- [ ] Stick with current 2 events + default logging (Quickest)
- [ ] Add `payment_intent.canceled` only
- [ ] Add all recommended events
- [ ] Update Stripe Dashboard webhook settings if adding events

---

### 4. Transaction Atomicity for Database Operations

**The Issue**: Multiple database updates aren't wrapped in a transaction, risking partial updates.

**Critical Operations Needing Atomicity**:

1. **Payment Creation** (2 tables updated):
   - Insert into `payments`
   - Update `payment_request_members`

2. **Webhook Success** (3 tables updated):
   - Update `payments`
   - Insert into `payment_transactions`
   - Update `payment_request_members`

**Option A: Supabase RPC Function** (Recommended)

```sql
-- Create PostgreSQL function
CREATE OR REPLACE FUNCTION process_payment_success(
  p_payment_intent_id TEXT,
  p_charge_id TEXT,
  p_member_id UUID
) RETURNS void AS $$
BEGIN
  -- All updates in single transaction
  UPDATE payments SET status = 'completed' WHERE stripe_payment_intent_id = p_payment_intent_id;
  INSERT INTO payment_transactions (...) VALUES (...);
  UPDATE payment_request_members SET payment_status = 'paid' WHERE id = p_member_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql;
```

**Option B: Accept Risk for MVP**

- Document that partial updates are possible
- Add manual reconciliation process
- Fix in next sprint

**YOUR ACTION**:

- [ ] Approve RPC function approach (adds 2-3 hours)
- [ ] Accept risk for MVP and add to tech debt
- [ ] Assign to Alex (Dev Lead) to implement

---

## 📋 Quick Decision Form

Copy and paste your decisions:

```markdown
## PAY-004 Decisions - Sarah - 2025-09-06

### Blocker Resolutions

1. **Idempotency Strategy**: Option [A/B/C] - [Brief reason]
2. **Error Recovery**: [Approved Cancel on Failure / Alternative: specify]

### Recommendations

3. **Webhook Events**: [Keep current 2 / Add canceled / Add all]
4. **Transaction Atomicity**: [RPC function / Accept risk for MVP]

### Sign-off

- Sarah (PO): ✅ Approved for development with above decisions
- Date: 2025-09-06
- Next Review: After implementation
```

---

## 🎯 Next Steps

1. **You**: Make decisions above (15-30 mins)
2. **You/Alex**: Update `/docs/stories/PAY-004-api-contracts.md` with decisions
3. **Quinn**: Update QA gate to PASS once decisions documented
4. **Dev**: Begin implementation with clear specifications

---

## 📞 If You Need Clarification

- **For Idempotency**: Ask Alex (Dev Lead) for technical preference
- **For Error Recovery**: Ask Morgan (Solutions Architect) for system design input
- **For Webhooks**: Current 2 events are sufficient for MVP if time constrained
- **For Atomicity**: Can be added post-MVP if needed

---

**Bottom Line**: Story is 90% ready. Just need your decisions on idempotency strategy and error recovery to proceed safely with payment processing.
