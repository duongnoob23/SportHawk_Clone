# 🔴 ACTION REQUIRED: Alex - Implement RPC Functions for PAY-004

## Quick Context

Sarah (PO) has approved PAY-004 for development. There's ONE blocking task assigned to you that must be completed before the team can start implementation.

## Your Task

**Implement 3 PostgreSQL RPC functions for atomic payment processing**

- Time: 2-3 hours
- Complexity: Medium
- Blocking: Yes - team cannot start without this

## Why This Is Critical

Without these RPC functions:

- ❌ Payment updates could partially fail
- ❌ Database could have inconsistent state
- ❌ Users could be charged but not marked as paid
- ❌ We risk financial data integrity issues

## What You Need to Do

### Step 1: Create the migrations

```bash
cd /Users/adimac/Documents/Andrew/Dev/SportHawk_MVP_v4
supabase migration new process_payment_success
supabase migration new process_payment_failure
```

### Step 2: Copy the SQL from this file

Full implementation with exact SQL code:
`/docs/stories/PAY-004-alex-rpc-implementation.md`

The file contains:

- Complete SQL for all 3 functions
- Proper error handling
- Permission grants
- Test queries

### Step 3: Apply to database

```bash
supabase db push
```

### Step 4: Verify it worked

Run the test queries provided in the implementation file to confirm the functions exist and have correct permissions.

## Definition of Done

✅ 3 RPC functions created:

- `process_payment_success`
- `process_payment_failure`
- `process_payment_canceled`

✅ All use transaction semantics (automatic rollback on error)
✅ Service role has execute permissions
✅ Migrations applied successfully

## Timeline

**Needed by**: Before team starts PAY-004 (ASAP)
**Estimated effort**: 2-3 hours
**Actual effort**: **\_** (please fill in)

## Questions?

- Technical details: See `/docs/stories/PAY-004-api-contracts.md` lines 538-629
- Why RPC?: Ensures all payment operations are atomic - they either all succeed or all fail
- Slack: Message Sarah or Quinn if blocked

## Quick Copy-Paste Start

```bash
# Run these commands right now to get started:
cd /Users/adimac/Documents/Andrew/Dev/SportHawk_MVP_v4
supabase migration new process_payment_success
# Then open /docs/stories/PAY-004-alex-rpc-implementation.md
# Copy the SQL into the migration file
# Run: supabase db push
```

---

**This is blocking the team. Please complete ASAP or let Sarah know if you're blocked.**
