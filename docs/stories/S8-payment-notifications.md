# Story S8: Payment Notifications

## Status

**Draft**

## Story

**As a** User  
**I want** to receive notifications about payments  
**So that** I stay informed about payment events

## Acceptance Criteria

1. Notification on payment request created
2. Reminder notifications
3. Payment success/failure notifications
4. Cancellation notifications
5. Push notifications via Expo

## Tasks / Subtasks

- [ ] **Task 1: Implement notification triggers for payment request creation** (AC: 1)
  - [ ] Create Supabase Edge Function for payment request notification
  - [ ] Add database trigger on payment_requests insert
  - [ ] Format notification with payment details (title, amount, due date)
  - [ ] Store notification in notifications table
  - [ ] Test notification creation on new payment requests

- [ ] **Task 2: Implement payment reminder notifications** (AC: 2)
  - [ ] Create Edge Function for payment reminders
  - [ ] Implement manual reminder trigger from admin screen
  - [ ] Add automatic reminder logic (e.g., day before due date)
  - [ ] Track reminders in payment_reminders table
  - [ ] Test both manual and automatic reminder scenarios

- [ ] **Task 3: Implement payment success/failure notifications** (AC: 3)
  - [ ] Add webhook handler for Stripe payment events
  - [ ] Create success notification on payment.succeeded
  - [ ] Create failure notification on payment.failed
  - [ ] Update payment_request_members status
  - [ ] Test with Stripe test mode transactions

- [ ] **Task 4: Implement cancellation notifications** (AC: 4)
  - [ ] Add trigger for payment request cancellation
  - [ ] Notify all affected members
  - [ ] Include reason for cancellation if provided
  - [ ] Update payment_request_members status to cancelled
  - [ ] Test cancellation flow end-to-end

- [ ] **Task 5: Integrate Expo Push Notifications** (AC: 5)
  - [ ] Configure Expo push notification service
  - [ ] Implement push token registration on app launch
  - [ ] Store push tokens in database
  - [ ] Send push notifications from Edge Functions
  - [ ] Handle notification permissions and settings
  - [ ] Test on both iOS and Android devices

- [ ] **Task 6: Testing and validation**
  - [ ] Test all notification types
  - [ ] Verify notification delivery
  - [ ] Check notification content formatting
  - [ ] Test push notifications on real devices
  - [ ] Validate database consistency

## Dev Notes

### Database Tables (Already Exist)

- **notifications** table structure:
  - `id` (UUID)
  - `user_id` (UUID, FK to users)
  - `title` (TEXT)
  - `body` (TEXT)
  - `notification_type` (TEXT)
  - `priority` (TEXT)
  - `delivery_method` (TEXT)
  - `delivered_at` (TIMESTAMP)
  - `read_at` (TIMESTAMP)
  - `created_at` (TIMESTAMP)
  - `metadata` (JSONB)

- **payment_reminders** table structure:
  - `id` (UUID)
  - `payment_request_id` (UUID, FK)
  - `user_id` (UUID, FK)
  - `reminder_type` (TEXT) - 'automatic' or 'manual'
  - `sent_at` (TIMESTAMP)
  - `delivery_status` (TEXT)
  - `created_at` (TIMESTAMP)

### Notification Types

Define the following notification types:

- `payment_request_created` - When a new payment request is created
- `payment_reminder` - Reminder to pay
- `payment_success` - Payment completed successfully
- `payment_failed` - Payment failed
- `payment_request_cancelled` - Payment request was cancelled

### Edge Functions Required

Location: `/supabase/functions/`

- `send-payment-notification` - Main notification handler
- Update existing `stripe-webhook` to trigger notifications

### Expo Push Configuration

- Use `expo-notifications` package
- Request permissions on app startup
- Store push tokens in user profile
- Handle both foreground and background notifications

### Notification Service Pattern

```typescript
// /lib/services/notificationService.ts
export const notificationService = {
  async sendPaymentRequestCreated(requestId: string, userIds: string[])
  async sendPaymentReminder(requestId: string, userIds: string[])
  async sendPaymentSuccess(paymentId: string, userId: string)
  async sendPaymentFailed(paymentId: string, userId: string)
  async sendPaymentCancelled(requestId: string, userIds: string[])
}
```

### Implementation References

- Existing notification pattern: Check `/app/notifications/` if exists
- Push token management: Check user profile/settings screens
- Edge Function pattern: Reference Story 4 Stripe Edge Functions

### Testing Standards

- **Test notifications in development environment first**
- **Use Expo push notification tool for testing**
- **Verify both iOS and Android behavior**
- **Test with app in foreground, background, and killed states**
- **Ensure notifications are properly formatted and actionable**

### Security Considerations

- Only send notifications to authorized users
- Don't expose sensitive payment details in push notifications
- Use RLS policies on notifications table
- Validate all user IDs before sending notifications

### Known Dependencies

- Stories 1-7 must be completed first
- Stripe webhook (Story 4) needs to be operational
- Push token registration should be added to app initialization
- Notification permissions must be requested from users

## Change Log

| Date       | Version | Description                      | Author     |
| ---------- | ------- | -------------------------------- | ---------- |
| 2025-01-09 | 1.0     | Initial story creation from EPIC | Sarah (PO) |

## Dev Agent Record

### Agent Model Used

_To be populated by development agent_

### Debug Log References

_To be populated by development agent_

### Completion Notes List

_To be populated by development agent_

### File List

_To be populated by development agent_

## QA Results

_To be populated by QA agent_
