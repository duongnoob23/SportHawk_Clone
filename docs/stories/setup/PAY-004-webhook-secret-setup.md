# PAY-004 STRIPE_WEBHOOK_SECRET Setup Guide

## What is the STRIPE_WEBHOOK_SECRET?

The `STRIPE_WEBHOOK_SECRET` is a signing secret that Stripe uses to cryptographically sign webhook payloads. This allows your Edge Function to verify that webhook requests are genuinely from Stripe and haven't been tampered with or spoofed by malicious actors.

## Why It's Critical

1. **Security**: Without signature verification, anyone could send fake webhook requests to your endpoint
2. **Data Integrity**: Ensures the webhook payload hasn't been modified in transit
3. **Compliance**: Required for PCI compliance and security best practices
4. **Idempotency**: Helps prevent replay attacks where old webhooks are resent

## When It's Used

The webhook secret is used in the `stripe-webhook` Edge Function during EVERY webhook request:

```typescript
// In /supabase/functions/stripe-webhook/index.ts
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  Deno.env.get('STRIPE_WEBHOOK_SECRET')! // Used here for verification
);
```

This verification happens BEFORE any payment processing to ensure the request is legitimate.

## How to Obtain the Webhook Secret

### For Development/Testing (Stripe CLI)

When using Stripe CLI for local testing, it generates a temporary webhook secret:

```bash
# Start listening (this will show you the webhook secret)
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Output will be like:
# > Ready! Your webhook signing secret is whsec_1234567890abcdef... (^C to quit)
```

Use this temporary secret in your local `.env.local` file.

### For Production (Stripe Dashboard)

#### Step 1: Access Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/webhooks (for test mode)
2. Or https://dashboard.stripe.com/webhooks (for live mode)

#### Step 2: Create Webhook Endpoint

1. Click "Add endpoint"
2. Enter endpoint URL: `https://vwqfwehtjnjenzrhzgol.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Click "Add endpoint"

#### Step 3: Get the Signing Secret

1. After creating the endpoint, you'll see it in the webhooks list
2. Click on the webhook endpoint you just created
3. In the webhook details page, look for "Signing secret"
4. Click "Reveal" or the eye icon
5. Copy the secret (starts with `whsec_`)

Example format: `whsec_A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6`

## Where to Configure the Secret

### Local Development

```bash
# In /supabase/.env.local
STRIPE_WEBHOOK_SECRET=whsec_from_stripe_cli_output
```

### Production Deployment

```bash
# Using Supabase CLI
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_from_stripe_dashboard

# Verify it's set
supabase secrets list
```

### In Your Edge Function

The secret is automatically available via `Deno.env.get()`:

```typescript
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET not configured');
}
```

## Important Security Notes

1. **Never commit the secret to Git** - Always use environment variables
2. **Different secrets for test/live** - Test mode and live mode have different secrets
3. **Rotate if compromised** - If exposed, immediately generate a new secret in Stripe Dashboard
4. **Keep it secret** - Never log or expose this value in error messages
5. **Required for production** - Webhook will fail without proper verification

## Troubleshooting

### "Webhook signature verification failed"

- Ensure you're using the correct secret for your environment (test vs live)
- Check that the entire raw request body is being used for verification
- Verify the signature header is being passed correctly

### "STRIPE_WEBHOOK_SECRET not found"

- For local: Check `/supabase/.env.local` file exists and contains the secret
- For production: Run `supabase secrets list` to verify it's set

### "Invalid signature"

- The secret might be truncated - ensure you copied the entire value
- Check you're not mixing test/live webhooks with wrong secret

## Testing the Webhook Secret

### Local Testing

```bash
# 1. Set up webhook forwarding (this shows the secret)
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# 2. Copy the whsec_ value to .env.local

# 3. Trigger a test event
stripe trigger payment_intent.succeeded

# 4. Check logs for successful verification
supabase functions serve stripe-webhook --env-file supabase/.env.local
```

### Production Testing

1. Configure webhook in Stripe Dashboard
2. Set secret via `supabase secrets set`
3. Use Stripe Dashboard's "Send test webhook" feature
4. Check Edge Function logs for verification success

## Summary Checklist

- [ ] Obtained webhook secret from Stripe Dashboard (production) or CLI (development)
- [ ] Added to local `.env.local` for development
- [ ] Set in Supabase secrets for production via CLI
- [ ] Verified Edge Function can access the secret
- [ ] Tested webhook signature verification works
- [ ] Confirmed different secrets for test/live environments
- [ ] Added to .gitignore to prevent accidental commits
