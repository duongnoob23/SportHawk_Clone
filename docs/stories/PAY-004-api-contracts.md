# PAY-004 API Contracts & Technical Specifications

## Edge Function 1: stripe-create-payment

### Endpoint

`POST /functions/v1/stripe-create-payment`

### Request

```typescript
interface CreatePaymentRequest {
  payment_request_member_id: string; // UUID of payment_request_members record
}
```

### Response (Success - 200)

```typescript
interface CreatePaymentResponse {
  client_secret: string; // Stripe PaymentIntent client_secret
  amount: number; // Amount in pence (e.g., 2500 for £25.00)
  currency: string; // Always "GBP" for MVP
  payment_intent_id: string; // Stripe PaymentIntent ID (pi_xxx)
  payment_id: string; // Our payments table UUID
}
```

### Response (Error - 400/403/500)

```typescript
interface ErrorResponse {
  error: {
    code: string; // Machine-readable error code
    message: string; // User-friendly message
    details?: any; // Optional debug info (dev mode only)
  };
}
```

### Error Codes

- `MEMBER_NOT_FOUND` - payment_request_member_id doesn't exist
- `ALREADY_PAID` - Member has already paid this request
- `PAYMENT_EXPIRED` - Payment request is past due date
- `NO_STRIPE_ACCOUNT` - Team doesn't have Stripe account configured
- `STRIPE_ERROR` - Stripe API error occurred
- `DATABASE_ERROR` - Database operation failed
- `UNAUTHORIZED` - User not authorized for this payment

### Implementation Details

**PO DECISION (2025-09-06): Idempotency Strategy - Option C (One Payment Intent Per Member)**

- Reuse existing payment intent if one exists and is in a payable state
- Most conservative approach to prevent duplicate charges

```typescript
// Exact implementation for Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';

serve(async req => {
  try {
    // 1. Parse request body
    const { payment_request_member_id } = await req.json();

    // 2. Initialize clients
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Bypass RLS
    );

    // 3. Fetch payment details with joins
    const { data: member, error: memberError } = await supabase
      .from('payment_request_members')
      .select(
        `
        *,
        payment_requests!inner(
          *,
          teams!inner(
            stripe_accounts!inner(
              stripe_account_id
            )
          )
        )
      `
      )
      .eq('id', payment_request_member_id)
      .single();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'MEMBER_NOT_FOUND',
            message: 'Payment member record not found',
          },
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Validate payment can be made
    if (member.payment_status === 'paid') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'ALREADY_PAID',
            message: 'This payment has already been completed',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stripeAccountId =
      member.payment_requests.teams.stripe_accounts[0]?.stripe_account_id;
    if (!stripeAccountId) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'NO_STRIPE_ACCOUNT',
            message: 'Team has not configured payment processing',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Check for existing PaymentIntent (PO Decision: Option C - One Payment Intent Per Member)
    if (member.stripe_payment_intent_id) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(
          member.stripe_payment_intent_id
        );
        if (
          existingIntent.status === 'requires_payment_method' ||
          existingIntent.status === 'requires_confirmation' ||
          existingIntent.status === 'requires_action'
        ) {
          // Return existing intent that can still be used
          return new Response(
            JSON.stringify({
              client_secret: existingIntent.client_secret,
              amount: member.amount_pence,
              currency: 'GBP',
              payment_intent_id: existingIntent.id,
              payment_id: member.payment_id, // Assuming this was stored
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } catch (err) {
        // Intent doesn't exist or error retrieving, create new one
      }
    }

    // 6. Create new Stripe PaymentIntent (NO application_fee_amount)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: member.amount_pence,
      currency: 'gbp', // Lowercase for Stripe
      description: `SportHawk: ${member.payment_requests.title}`,
      statement_descriptor: 'SPORTHAWK', // Max 22 chars, appears on bank statement
      metadata: {
        payment_request_member_id: member.id,
        payment_request_id: member.payment_request_id,
        user_id: member.user_id,
        team_id: member.payment_requests.team_id,
      },
      transfer_data: {
        destination: stripeAccountId, // Team gets FULL amount
      },
    });

    // 7. Create payment record for tracking
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: member.user_id,
        payment_request_id: member.payment_request_id,
        amount_pence: member.amount_pence,
        currency: 'GBP',
        status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        payment_method: 'card',
      })
      .select()
      .single();

    if (paymentError) {
      // PO DECISION: Cancel on Failure - Rollback PaymentIntent if database fails
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id);
      } catch (cancelError) {
        console.error('Failed to cancel PaymentIntent:', cancelError);
      }
      throw paymentError;
    }

    // 8. Update payment_request_members with intent ID and payment ID
    await supabase
      .from('payment_request_members')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_id: payment.id,
      })
      .eq('id', payment_request_member_id);

    // 9. Return response
    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        amount: member.amount_pence,
        currency: 'GBP',
        payment_intent_id: paymentIntent.id,
        payment_id: payment.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // PO DECISION: Comprehensive error handling with potential rollback
    console.error('Payment creation error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'STRIPE_ERROR',
          message: 'Failed to create payment intent',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

## Edge Function 2: stripe-webhook

### Endpoint

`POST /functions/v1/stripe-webhook`

### Headers Required

```
Stripe-Signature: t=xxx,v1=xxx  // Stripe webhook signature
```

### Request Body

Raw Stripe webhook event (not parsed JSON)

### Response

```typescript
// Success - 200
{
  received: true;
}

// Error - 400
{
  error: 'Invalid signature';
}
```

### Implementation Details

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';

serve(async req => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'No signature' }), {
      status: 400,
    });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
  });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // 1. Verify webhook signature
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    // 2. Handle specific events using atomic RPC functions
    // PO DECISION: Added payment_intent.canceled to track user cancellations
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const member_id = paymentIntent.metadata.payment_request_member_id;

        // Use atomic RPC function for all database updates
        const { error } = await supabase.rpc('process_payment_success', {
          p_payment_intent_id: paymentIntent.id,
          p_charge_id: paymentIntent.latest_charge as string,
          p_member_id: member_id,
          p_amount_pence: paymentIntent.amount,
        });

        if (error) {
          console.error('Failed to process payment success:', error);
          throw error; // Webhook will be retried by Stripe
        }

        // NOTE: No notification triggering - handled in future story
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const member_id = paymentIntent.metadata.payment_request_member_id;

        // Use atomic RPC function for failure handling
        const { error } = await supabase.rpc('process_payment_failure', {
          p_payment_intent_id: paymentIntent.id,
          p_member_id: member_id,
          p_failure_reason:
            paymentIntent.last_payment_error?.message || 'Payment failed',
        });

        if (error) {
          console.error('Failed to process payment failure:', error);
          throw error;
        }

        break;
      }

      case 'payment_intent.canceled': {
        // PO DECISION: Track canceled payments
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const member_id = paymentIntent.metadata.payment_request_member_id;

        // Use atomic RPC function for cancellation
        const { error } = await supabase.rpc('process_payment_canceled', {
          p_payment_intent_id: paymentIntent.id,
          p_member_id: member_id,
        });

        if (error) {
          console.error('Failed to process payment cancellation:', error);
          throw error;
        }

        break;
      }

      default: {
        // PO DECISION: Log unhandled events for monitoring
        console.log(`Unhandled webhook event: ${event.type}`);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
    });
  }
});
```

## Client Integration (lib/api/payments.ts)

### Add these methods to existing paymentsApi object:

```typescript
// Add to paymentsApi object in /lib/api/payments.ts
// NOTE: No notification handling - deferred to future story

async initiatePayment(paymentRequestMemberId: string): Promise<{
  clientSecret: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
  paymentId: string;
}> {
  try {
    logger.log('Initiating payment for member:', paymentRequestMemberId);

    const { data, error } = await supabase.functions.invoke('stripe-create-payment', {
      body: {
        payment_request_member_id: paymentRequestMemberId
      }
    });

    if (error) {
      logger.error('Failed to initiate payment:', error);
      throw new Error(error.message || 'Failed to create payment intent');
    }

    return data;
  } catch (error) {
    logger.error('Error in initiatePayment:', error);
    throw error;
  }
},

async checkPaymentStatus(paymentRequestMemberId: string): Promise<{
  status: 'unpaid' | 'paid' | 'failed' | 'processing';
  paidAt?: string;
  failureReason?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('payment_request_members')
      .select('payment_status, paid_at, failure_reason')
      .eq('id', paymentRequestMemberId)
      .single();

    if (error) {
      logger.error('Failed to check payment status:', error);
      throw error;
    }

    return {
      status: data.payment_status as any,
      paidAt: data.paid_at,
      failureReason: data.failure_reason,
    };
  } catch (error) {
    logger.error('Error in checkPaymentStatus:', error);
    throw error;
  }
},
```

## Environment Variables Required

### Local Development (.env)

```bash
# Already exists
EXPO_PUBLIC_SUPABASE_URL=https://vwqfwehtjnjenzrhzgol.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# MUST ADD
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe Dashboard
```

### Supabase Secrets (for Edge Functions)

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
# SUPABASE_SERVICE_ROLE_KEY is already available in Edge Functions
```

## Webhook Configuration

### Stripe Dashboard Settings

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint URL: `https://vwqfwehtjnjenzrhzgol.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled` (PO DECISION: Added for tracking cancellations)
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Testing Instructions

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local Edge Function
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger payment_intent.succeeded
```

### Test Payment Flow

```typescript
// Test in React Native app
const testPayment = async () => {
  // 1. Get payment member ID (from your UI/database)
  const memberId = 'xxx-xxx-xxx';

  // 2. Create payment intent
  const { clientSecret } = await paymentsApi.initiatePayment(memberId);

  // 3. Use with Stripe Elements/SDK (Story 5)
  // This is where Story 5 takes over with @stripe/stripe-react-native
};
```

## Status Flow Diagram

```
payment_request_members.payment_status:

unpaid (initial)
  ↓
  → initiatePayment() called
  ↓
unpaid (with stripe_payment_intent_id)
  ↓
  → Stripe processes payment
  ↓
paid (on success) OR failed (on failure)
  ↓
  → Can retry if failed (creates new PaymentIntent)
```

## Idempotency Strategy

**PO DECISION (2025-09-06): Option C - One Payment Intent Per Member**

- Reuse existing PaymentIntent if it's in a payable state (requires_payment_method, requires_confirmation, requires_action)
- Only create new PaymentIntent if none exists or previous has failed/succeeded
- The `payment_request_members` table tracks the current `stripe_payment_intent_id`
- This prevents any possibility of duplicate charges

## Rate Limiting

Edge Functions have built-in rate limiting. Additional protection:

- One active PaymentIntent per payment_request_member
- Cancel previous intent before creating new one
- Max 3 retry attempts per hour (implement in client)

## Transaction Atomicity

**PO DECISION (2025-09-06): RPC Function Approach for Atomicity**

- All payment operations must be atomic to prevent partial updates
- PostgreSQL functions for critical operations
- **✅ COMPLETED by Alex (Dev Lead) - All 3 functions tested and deployed**

### IMPORTANT: RPC Functions Already Exist in Database

**The following 3 RPC functions are already implemented and available for use. DO NOT recreate them.**

### RPC Function 1: Process Payment Success (ALREADY IMPLEMENTED)

```sql
-- Function Reference (Already exists in database - DO NOT CREATE)
-- Function signature:
process_payment_success(
  p_payment_intent_id TEXT,
  p_charge_id TEXT,
  p_member_id UUID,
  p_amount_pence INTEGER
) RETURNS void

-- What it does:
-- 1. Updates payments table status to 'completed'
-- 2. Inserts payment_transactions record
-- 3. Updates payment_request_members to 'paid'
-- All operations are atomic - if any fail, all rollback
```

### RPC Function 2: Process Payment Failure (ALREADY IMPLEMENTED)

```sql
-- Function Reference (Already exists in database - DO NOT CREATE)
-- Function signature:
process_payment_failure(
  p_payment_intent_id TEXT,
  p_member_id UUID,
  p_failure_reason TEXT
) RETURNS void

-- What it does:
-- 1. Updates payments table status to 'failed'
-- 2. Updates payment_request_members to 'failed'
-- All operations are atomic - if any fail, all rollback
```

### RPC Function 3: Process Payment Canceled (ALREADY IMPLEMENTED)

```sql
-- Function Reference (Already exists in database - DO NOT CREATE)
-- Function signature:
process_payment_canceled(
  p_payment_intent_id TEXT,
  p_member_id UUID
) RETURNS void

-- What it does:
-- 1. Updates payments table status to 'canceled'
-- 2. Updates payment_request_members to 'canceled'
-- All operations are atomic - if any fail, all rollback
```

### Usage in Webhook Handler

```typescript
// All webhook events use the existing atomic RPC functions
// These functions are already deployed - just call them as shown below
switch (event.type) {
  case 'payment_intent.succeeded': {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const member_id = paymentIntent.metadata.payment_request_member_id;

    // PO DECISION: Use atomic transaction via RPC
    const { error } = await supabase.rpc('process_payment_success', {
      p_payment_intent_id: paymentIntent.id,
      p_charge_id: paymentIntent.latest_charge as string,
      p_member_id: member_id,
      p_amount_pence: paymentIntent.amount,
    });

    if (error) {
      console.error('Failed to process payment success:', error);
      throw error; // Webhook will be retried by Stripe
    }
    break;
  }

  case 'payment_intent.payment_failed': {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const member_id = paymentIntent.metadata.payment_request_member_id;

    // Use atomic transaction for failure
    const { error } = await supabase.rpc('process_payment_failure', {
      p_payment_intent_id: paymentIntent.id,
      p_member_id: member_id,
      p_failure_reason:
        paymentIntent.last_payment_error?.message || 'Payment failed',
    });

    if (error) {
      console.error('Failed to process payment failure:', error);
      throw error;
    }
    break;
  }

  case 'payment_intent.canceled': {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const member_id = paymentIntent.metadata.payment_request_member_id;

    // Use atomic transaction for cancellation
    const { error } = await supabase.rpc('process_payment_canceled', {
      p_payment_intent_id: paymentIntent.id,
      p_member_id: member_id,
    });

    if (error) {
      console.error('Failed to process payment cancellation:', error);
      throw error;
    }
    break;
  }

  default: {
    console.log(`Unhandled webhook event: ${event.type}`);
    break;
  }
}
```

---

## PO Sign-off Summary

**Date**: 2025-09-06
**Product Owner**: Sarah

### Approved Decisions:

1. ✅ **Idempotency**: Option C - One Payment Intent Per Member
2. ✅ **Error Recovery**: Cancel PaymentIntent on Database Failure
3. ✅ **Webhook Events**: Added payment_intent.canceled
4. ✅ **Transaction Atomicity**: RPC function implementation (Alex to implement)

### Implementation Notes:

- Development can proceed with these specifications
- Alex (Dev Lead) to implement RPC functions for atomicity
- Webhook configuration must include the canceled event
- All error scenarios must cancel PaymentIntents to prevent orphaned payments

---

**CRITICAL**: This is the EXACT contract /dev must implement. No deviations without explicit approval.
