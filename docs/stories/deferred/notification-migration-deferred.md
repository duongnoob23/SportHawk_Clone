# PAY-004 - Notification Migration DEFERRED

## Status: DEFERRED to Future Story

### Why This Migration is Deferred

Notifications are **OUT OF SCOPE** for Story PAY-004. This migration file (`PAY-004-notification-trigger-migration.sql`) should be:

- **NOT applied** during Story 4 implementation
- **Saved** for the future notifications story
- **Referenced** when implementing notification features

### What Story 4 DOES Include

Story 4 focuses purely on Stripe payment processing:

- ✅ Creating PaymentIntents via Edge Functions
- ✅ Processing webhook events
- ✅ Updating database tables (`payments`, `payment_transactions`, `payment_request_members`)

### What Story 4 DOES NOT Include

- ❌ Sending any notifications (email, push, or in-app)
- ❌ Fixing notification triggers
- ❌ Notification queue management
- ❌ Any interaction with the `notification_queue` table

### The Notification Issue (For Future Reference)

The current notification triggers have a bug where they reference:

- **WRONG**: `payment_request_users` table (empty, 0 rows)
- **CORRECT**: `payment_request_members` table (active, 4 rows)

This means notifications won't fire correctly, but since notifications are out of scope for Story 4, this doesn't impact the current implementation.

### When to Apply the Migration

Apply `PAY-004-notification-trigger-migration.sql` when:

1. Implementing the notifications story
2. Adding email/push notification features
3. Integrating with notification services

### Developer Action for Story 4

**DO NOTHING** regarding notifications:

- Don't apply the migration
- Don't test notification triggers
- Don't add any notification logic to Edge Functions
- Focus purely on payment processing

### Files to Ignore for Story 4

- `/docs/stories/PAY-004-notification-trigger-migration.sql` - Save for future
- Any notification-related code or triggers
- The `notification_queue` table

### What Happens Without Notifications?

The payment system will work correctly:

- Payments will process successfully
- Database records will update
- Users can make payments
- Payment status will be tracked

The only missing piece is automated notifications, which will be added in a future story.
