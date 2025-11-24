# Supabase Edge Functions Setup Guide for Story PAY-004

## Prerequisites

- Node.js 18+ installed
- Access to SportHawk Supabase project (vwqfwehtjnjenzrhzgol)
- Stripe test account access
- Local .env file with keys

## Step 1: Install Supabase CLI

### macOS

```bash
brew install supabase/tap/supabase
```

### Windows/Linux or via NPM

```bash
npm install -g supabase
```

### Verify Installation

```bash
supabase --version
# Should output: 1.x.x
```

## Step 2: Initialize Supabase Project

```bash
# From project root (/SportHawk_MVP_v4)
supabase init

# This creates:
# - supabase/config.toml
# - supabase/functions/
# - .supabase/
```

## Step 3: Link to Remote Project

```bash
# Login to Supabase
supabase login

# Link to SportHawk project
supabase link --project-ref vwqfwehtjnjenzrhzgol

# Verify link
supabase status
```

## Step 4: Pull Remote Configuration

```bash
# Get remote database schema (optional but recommended)
supabase db pull

# Get existing secrets list
supabase secrets list
```

## Step 5: Create Edge Functions Structure

```bash
# Create the Edge Functions
mkdir -p supabase/functions/stripe-create-payment
mkdir -p supabase/functions/stripe-webhook
mkdir -p supabase/functions/_shared

# Create import map for shared dependencies
cat > supabase/functions/import_map.json << 'EOF'
{
  "imports": {
    "stripe": "https://esm.sh/stripe@13.6.0?target=deno",
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2.39.0",
    "std/": "https://deno.land/std@0.168.0/"
  }
}
EOF
```

## Step 6: Set Local Environment Variables

```bash
# Create .env.local for Edge Functions (different from main .env)
cat > supabase/.env.local << 'EOF'
STRIPE_SECRET_KEY=sk_test_... # Copy from main .env
STRIPE_WEBHOOK_SECRET=whsec_... # Get from Stripe Dashboard
EOF

# IMPORTANT: Add to .gitignore
echo "supabase/.env.local" >> .gitignore
```

## Step 7: Create Function Files

### stripe-create-payment/index.ts

```bash
touch supabase/functions/stripe-create-payment/index.ts
# Copy implementation from PAY-004-api-contracts.md
```

### stripe-webhook/index.ts

```bash
touch supabase/functions/stripe-webhook/index.ts
# Copy implementation from PAY-004-api-contracts.md
```

## Step 8: Test Edge Functions Locally

### Start Supabase Local Development

```bash
# Start all services (database, auth, storage, functions)
supabase start

# Your local URLs:
# API URL: http://localhost:54321
# GraphQL URL: http://localhost:54321/graphql/v1
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Functions URL: http://localhost:54321/functions/v1/
```

### Test Individual Function

```bash
# Serve specific function for development
supabase functions serve stripe-create-payment --env-file supabase/.env.local

# In another terminal, test the function
curl -i --location --request POST 'http://localhost:54321/functions/v1/stripe-create-payment' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"payment_request_member_id":"test-uuid"}'
```

## Step 9: Test Webhooks with Stripe CLI

```bash
# Install Stripe CLI if not already installed
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local function
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Copy the webhook signing secret shown
# Update supabase/.env.local with this secret

# In another terminal, trigger test webhook
stripe trigger payment_intent.succeeded
```

## Step 10: Deploy to Supabase

### Deploy Functions

```bash
# Deploy individual function
supabase functions deploy stripe-create-payment

# Deploy webhook function
supabase functions deploy stripe-webhook

# Or deploy all functions
supabase functions deploy
```

### Set Production Secrets

```bash
# Set secrets in production
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Verify secrets are set
supabase secrets list
```

### Verify Deployment

```bash
# Check function status
supabase functions list

# Test production function
curl -i --location --request POST \
  'https://vwqfwehtjnjenzrhzgol.supabase.co/functions/v1/stripe-create-payment' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"payment_request_member_id":"test-uuid"}'
```

## Step 11: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://vwqfwehtjnjenzrhzgol.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy signing secret
6. Update production secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx`

## Step 12: Apply Database Migration

```bash
# Apply the notification trigger fix
supabase db push < docs/stories/PAY-004-notification-trigger-migration.sql

# Or use Supabase Studio SQL editor:
# 1. Go to https://app.supabase.com/project/vwqfwehtjnjenzrhzgol/sql
# 2. Paste migration SQL
# 3. Run
```

## Troubleshooting

### Common Issues

#### 1. "Function not found"

```bash
# Check function is deployed
supabase functions list

# Redeploy if needed
supabase functions deploy function-name
```

#### 2. "Invalid signature" webhook error

```bash
# Verify webhook secret matches
supabase secrets list
# Update if needed
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_new_secret
```

#### 3. "Database connection failed"

```bash
# Check Supabase is running
supabase status

# Restart if needed
supabase stop
supabase start
```

#### 4. CORS errors from client

```typescript
// Edge Functions handle CORS automatically
// But ensure you're using supabase.functions.invoke()
// Not direct fetch() calls
```

## Monitoring & Logs

### Local Logs

```bash
# View function logs
supabase functions logs stripe-create-payment

# Follow logs
supabase functions logs stripe-webhook --follow
```

### Production Logs

```bash
# View production logs (requires CLI auth)
supabase functions logs stripe-create-payment --project-ref vwqfwehtjnjenzrhzgol

# Or use Supabase Dashboard:
# https://app.supabase.com/project/vwqfwehtjnjenzrhzgol/functions
```

## Development Workflow

1. Make changes to function code
2. Test locally: `supabase functions serve function-name`
3. Test with Stripe CLI for webhooks
4. Deploy to production: `supabase functions deploy function-name`
5. Verify in production
6. Monitor logs for errors

## Clean Up (After Development)

```bash
# Stop local Supabase
supabase stop

# Stop Stripe webhook forwarding
# Ctrl+C in stripe listen terminal
```

## Quick Reference Commands

```bash
# Start local dev
supabase start

# Serve function locally
supabase functions serve stripe-create-payment --env-file supabase/.env.local

# Deploy to production
supabase functions deploy stripe-create-payment

# View logs
supabase functions logs stripe-create-payment --project-ref vwqfwehtjnjenzrhzgol

# Set secret
supabase secrets set KEY_NAME=value

# Stop local dev
supabase stop
```

## Files Created

After setup, your structure should be:

```
SportHawk_MVP_v4/
├── supabase/
│   ├── config.toml
│   ├── .env.local (git ignored)
│   ├── functions/
│   │   ├── import_map.json
│   │   ├── _shared/
│   │   ├── stripe-create-payment/
│   │   │   └── index.ts
│   │   └── stripe-webhook/
│   │       └── index.ts
│   └── migrations/ (optional, from db pull)
└── .supabase/ (git ignored)
```

---

**IMPORTANT**: Complete ALL steps before starting implementation. Missing any step will cause deployment failures.
