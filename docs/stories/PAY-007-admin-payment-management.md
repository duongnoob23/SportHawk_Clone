# Story PAY-007: Admin Payment Management

**Version:** 1.5  
**Date:** 2025-09-08  
**Status:** Ready for Development  
**Parent Epic:** `/docs/prd/epic-payments-stripe-integration.md`  
**Epic Reference:** Story 7 of Payments & Stripe Integration Epic

## Status

Ready for Development

## Story

**As a** Team Admin/Treasurer,  
**I want** to manage payment requests,  
**So that** I can track collections and send reminders

## Acceptance Criteria

1. Admin view of payment requests (Figma 559-2776)
2. Payment request details (Figma 559-2792)
3. Edit request capability (Figma 559-2709)
4. Send reminders to non-payers
5. Cancel request with notifications
6. See who has/hasn't paid

## Tasks / Subtasks

### Task 1: Implement Admin Payment List View (AC: 1, 6)

- [ ] Update `/app/teams/[id]/admin/payments.tsx` to show list
- [ ] Create payment request list component
- [ ] Implement payment status indicators (paid/unpaid counts)
- [ ] Add collection progress display
- [ ] Implement dot menu for actions per request
- [ ] Connect to Supabase payment_requests table with admin filters

### Task 2: Implement Payment Request Details View (AC: 2, 6)

- [ ] Create `/app/payments/[id]/admin-detail.tsx` screen
- [ ] Display full payment request information
- [ ] Show list of team members with payment status
- [ ] Add payment status badges (Paid/Pending/Overdue)
- [ ] Implement navigation from list to details

### Task 3: Implement Edit Payment Request (AC: 3)

- [ ] Create `/app/payments/[id]/edit.tsx` screen
- [ ] Implement form with existing payment data
- [ ] Add validation: Amount/Members locked if Due Date is past
- [ ] Show warning dialogs when editing with existing payments
- [ ] Update payment_requests table via Supabase
- [ ] Send appropriate notifications based on changes
- [ ] Add success/error handling

### Task 4: Implement Send Reminders (AC: 4)

- [ ] Add reminder button to payment detail view
- [ ] Create reminder Edge Function endpoint (see Edge Function Spec below)
- [ ] Track reminder history in database
- [ ] Show last reminder sent timestamp
- [ ] Implement bulk reminder for all non-payers
- [ ] Add confirmation dialog before sending

#### Edge Function Specification: send-payment-reminders

```typescript
// Endpoint: /functions/v1/send-payment-reminders
// Method: POST
// Auth: Required (user must be team admin)
// Headers: { 'Authorization': 'Bearer {access_token}', 'Content-Type': 'application/json' }
// Implementation: /supabase/functions/send-payment-reminders/index.ts

interface ReminderRequest {
  payment_request_id: string;
  recipient_ids: string[]; // User IDs to remind (or 'all' for bulk)
  reminder_type: 'individual' | 'bulk';
}

interface ReminderResponse {
  success: boolean;
  reminders_sent: number;
  failed_recipients?: string[];
  last_reminder_timestamp: string;
}

// Database Tables Used:
// - payment_request_members (to find unpaid members)
// - payment_requests (to update last_reminder_sent)
// - payment_reminders (to log reminder history)
// - profiles (to get push tokens)

// Notification payload sent via Expo Push
interface ReminderNotification {
  title: 'Payment Reminder'; // Use constant from PaymentUIConstants.reminderTitle
  body: string; // Built dynamically, no template literals in interface
  data: {
    type: 'payment_reminder';
    payment_request_id: string;
    deep_link: string; // Built as `/payments/${payment_request_id}`
  };
}

// Rate Limiting: Check payment_reminders table for last reminder per user
// Max frequency: 1 reminder per user per 24 hours
```

### Task 5: Implement Cancel Payment Request (AC: 5)

- [ ] Add cancel option to dot menu
- [ ] Create confirmation dialog with reason input
- [ ] Update payment request status to PaymentStatus.CANCELLED (from config)
- [ ] Trigger cancellation notifications
- [ ] Prevent cancellation if payments exist
- [ ] Add cancellation reason to database

### Task 6: Testing & Polish

- [ ] Test all CRUD operations
- [ ] Verify RLS policies for admin-only access
- [ ] Test notification triggers
- [ ] Verify UI matches Figma designs
- [ ] Test error states and edge cases
- [ ] Add loading states for all async operations

## Dev Notes

### Component Architecture

- Uses existing SportHawk component library from `@cmp/index`
- Follow established patterns from payment history implementation
- Maintain consistent styling with colorPalette and spacing configs
- **Reference Implementation Pattern:** `/app/events/create-event.tsx` (as per epic requirement)
- **UI Component Requirements:** Use TouchableOpacity for all interactive elements
- **Required Props:** Always use onChangeText (not onChange) for text inputs per component interfaces

### Figma Translation Layer

#### Screen 1: Admin Payment List (Figma 559-2776)

**Figma → SportHawk Component Mapping:**

- Team dropdown → Existing team navigation pattern
- Tab buttons (Events/Payments/Members/Admins) → `ShButton` with variant styles
- "Upcoming Payments" heading → `ShText` with `ShTextVariant.Heading`
- "This Week" filter → `ShFormFieldSelect`
- Payment cards → **NEW:** `AdminPaymentCard`
- Date/time display → `ShIcon` (Calendar/Clock) + `ShText`
- "Manage Request" button → `ShButton` with primary variant
- Bottom navigation → Existing bottom nav pattern

#### Screen 2: Payment Details Admin (Figma 559-2792)

**Figma → SportHawk Component Mapping:**

- Back button → `ShHeaderButton` with back arrow
- Edit button (dots) → **NEW:** `ShDotMenu`
- Payment title → `ShText` with `ShTextVariant.Heading`
- "Requested by" + avatar → `ShAvatar` + `ShText`
- Due date banner → `ShDueDateBanner`
- Description section → `ShSectionContent`
- Total amount box → `ShAmountDisplay` with container styling
- "Responses" heading + sort → `ShText` + `ShFormFieldSelect`
- Paid/Unpaid count badges → **NEW:** `ShPaymentStatusBadge`
- Member list with status → **NEW:** `AdminPaymentMemberItem`

#### Screen 3: Edit Payment Request (Figma 559-2709)

**Figma → SportHawk Component Mapping:**

- Back button → `ShHeaderButton`
- "Save" text button → `ShButton` with text variant
- Title field → `ShFormFieldText` with required indicator
- Description field → `ShFormFieldTextArea`
- Due by date/time → `ShFormFieldDateTime`
- Type dropdown → `ShFormFieldSelect`
- Members dropdown → `ShFormFieldSelect` with arrow indicator
- Stripe ID (read-only) → `ShFormFieldReadOnly`
- Base Price input → `ShPaymentAmountInput`
- Fee calculator box → `ShFeeCalculator`
- Toggle switch → `ShToggleField`
- Help icons → `ShIcon` with `IconName.Help`
- "Cancel Payment Request" → `ShButton` with error variant

### Component Implementation Plan

#### New Components Required (4 total - SAFE APPROACH)

1. **AdminPaymentCard** (`/components/AdminPaymentCard/`)
   - Purpose: Display payment request cards in admin list
   - Pattern: Based on `PaymentHistoryCard`
   - Features: Title, team, amount badge, due date/time, "Manage Request" button
   - Special: Shows collection progress (e.g., "5 of 12 paid")

2. **ShPaymentStatusBadge** (`/components/ShPaymentStatusBadge/`)
   - Purpose: Show payment status visually
   - Variants: Paid (green/success), Unpaid (red/error), Pending (yellow/warning)
   - Uses: `colorPalette.success`, `colorPalette.error`, `colorPalette.warning`

3. **ShDotMenu** (`/components/ShDotMenu/`)
   - Purpose: Three-dot menu for actions
   - Icon: `IconName.MoreVertical`
   - Behavior: Opens action sheet with options
   - Reusable: Across all admin screens

4. **AdminPaymentMemberItem** (`/components/AdminPaymentMemberItem/`)
   - Purpose: Display member with payment status (SAFER than modifying ShMemberListItem)
   - Features: Avatar, name, payment status badge
   - Props: name, photoUri, paymentStatus, amount, onPress
   - Note: Leaves existing `ShMemberListItem` untouched for member selection

#### Reusable Components (90% of UI)

- All existing Sh components remain unchanged
- `ShMemberListItem` continues to work for member selection
- No modifications to existing components = zero risk

#### Implementation Order for New Components

1. **First:** `ShPaymentStatusBadge` - Needed by other components
2. **Second:** `ShDotMenu` - Independent, reusable menu
3. **Third:** `AdminPaymentMemberItem` - Uses StatusBadge
4. **Fourth:** `AdminPaymentCard` - Uses StatusBadge for progress

### Key Files & Patterns

- **Admin List:** `/app/teams/[id]/admin/payments.tsx` (update placeholder)
- **Admin Detail:** `/app/payments/[id]/admin-detail.tsx` (new)
- **Edit Screen:** `/app/payments/[id]/edit.tsx` (new)
- **Store:** Create `adminPaymentStore.ts` similar to `paymentHistoryStore.ts`

### Database Access

#### Tables Used

- **`payment_requests`** - Main payment request data (already exists)
- **`payment_request_members`** - Individual member payment status (already exists)
- **`payment_reminders`** - Audit trail for reminders and payment actions (already exists)
- **`user_team_roles`** - For admin permission checks (already exists)
- **`profiles`** - For user display names and avatars (already exists)
- **`teams`** - For team names and info (already exists)

#### API Functions Available

Use existing functions from `/lib/api/payments.ts`:

```typescript
// Get all payment requests for a team
getTeamPaymentRequests(teamId: string)

// Get single payment request with member details
getPaymentRequestDetails(paymentId: string)

// Update payment request (for edits)
updatePaymentRequest(paymentId: string, updates: PaymentRequestUpdate)

// Cancel payment request
cancelPaymentRequest(paymentId: string)

// Get payment member status
getPaymentMemberStatus(paymentId: string)
```

**Note:** Some functions may need extending for admin-specific needs (e.g., filtering by status)

### Critical Clarifications

#### Payment Status Definitions

- **Paid:** Payment completed successfully via Stripe
- **Unpaid:** Payment request sent but not yet paid
- **Pending:** REMOVED - Only use Paid/Unpaid as per Figma (no third state)
- **Overdue:** Display variant of Unpaid when past due date (visual indicator only)

#### Member Selection Behavior (Edit Screen)

- **Type:** Multi-select with checkboxes
- **Default:** All team members selected
- **Navigation:** Tapping opens `/app/payments/edit-members.tsx` (existing pattern)
- **Display:** Shows count "X members selected"
- **Restriction:** Cannot deselect members who have already paid

#### Edit Restrictions (from Design Document)

**Always Editable:**

- Title, Description, Type - can be freely edited at any time

**Special Rules for Amount & Members:**

- Cannot edit Amount or Members if Due Date has already passed
- Must adjust Due Date to future first, then can edit Amount/Members
- When editing Members who have paid: Show warning in confirmation dialog
- When changing Amount after payments: Show warning in confirmation dialog

**Notifications on Edit:**

- Members who haven't paid: Notified of changed payment details
- Members who have paid: Notified if removed or amount changed

**Cancel Restrictions:**

- Can cancel even if members have paid (with warning dialog)
- All members notified of cancellation

#### Filter Options Clarification

"This Week" filter includes:

- Payments due within next 7 days from today
- Other options: "Today", "This Month", "All", "Overdue"

### Answers to Critical Questions

#### Q1: Reminder Scope - Individual or bulk only?

**Answer:** Both supported. Admin can:

- Send bulk reminders to all unpaid members (primary action)
- Send individual reminders by tapping member row → Send Reminder
- Bulk is default in dot menu, individual via member interaction

#### Q2: Edit Restrictions - What fields can't be edited after payments?

**Answer:** Title, Description, Type always editable. Amount/Members require Due Date to be in future. See "Edit Restrictions" section above for full rules including warning dialogs.

#### Q3: Cancel Permissions - Can non-creators cancel requests?

**Answer:** Any team admin can cancel, not just the creator. All admins have equal permissions for team payment management.

#### Q4: Filter Options - What does "This Week" include?

**Answer:** Payments due from today through next 7 days (inclusive). See "Filter Options Clarification" above for full list.

### Figma Style Requirements (from PRD)

- Request Title: ShTextVariant.Body
- Collection Progress: ShTextVariant.Small ("5 of 12 paid")
- Total Amount: ShTextVariant.Body with colorPalette.primary
- Member Name: ShTextVariant.Body
- Payment Status: ShTextVariant.Caption
- Send Reminder Button: ShTextVariant.Button with colorPalette.warning
- Cancel Button: ShTextVariant.Button with colorPalette.error
- Dot Menu: IconName.MoreVertical with colorPalette.textSecondary

### Figma Style Compliance (Epic Section 5 Requirements)

- **NO Hardcoded Values:** All colors from colorPalette, spacing from spacing config
- **Text Variants:** Must use ShTextVariant enum values only
- **Icon Usage:** Must use IconName enum values only
- **Component Props:** Follow exact prop names from component interfaces
- **No Magic Numbers:** All numeric values from configuration
- **Status Values:** Use PaymentStatus enum from payments config

### Navigation Flow

1. Teams Tab → Team Detail → Admin Section → Manage Payments
2. Admin Payment List → Payment Details (tap card)
3. Payment Details → Edit (dot menu)
4. Edit Screen → Member Selection (tap members field)
5. Any screen → Back navigation via header

#### Route Definitions

```typescript
// List view (existing placeholder)
/app/aemst /
  [id] /
  admin /
  payments.tsx /
  // Detail view (new)
  app /
  payments /
  [id] /
  admin -
  detail.tsx /
    // Edit view (new)
    app /
    payments /
    [id] /
    edit.tsx /
    // Member selection (reuse existing)
    app /
    payments /
    edit -
  members.tsx;
```

#### Navigation Parameters

```typescript
// To detail screen
router.push(`/payments/${paymentId}/admin-detail`);

// To edit screen
router.push(`/payments/${paymentId}/edit`);

// To member selection
router.push({
  pathname: '/payments/edit-members',
  params: {
    teamId: teamId,
    paymentId: paymentId,
    returnRoute: '/payments/[id]/edit',
  },
});
```

### State Management

- Create dedicated Zustand store for admin payment management
- Handle sorting, filtering, and refresh operations
- Cache payment requests to minimize API calls
- Sync with payment updates from other screens

### Constants & Configuration

#### Import Required Constants

```typescript
// Colors - NEVER hardcode
import { colorPalette } from '@cfg/colors';

// Spacing - NEVER hardcode
import { spacing } from '@cfg/spacing';

// Typography - NEVER hardcode font sizes
import { ShTextVariant, fontWeights, fontSizes } from '@cfg/typography';

// Icons - use enum values only
import { IconName } from '@cfg/icons';

// Payment specific constants
import { PaymentStatus, PaymentUIConstants } from '@cfg/payments';
```

#### Error Messages (use constants)

```typescript
// Define in PaymentUIConstants
export const PaymentErrorMessages = {
  loadFailed: 'Failed to load payment requests',
  updateFailed: 'Failed to update payment request',
  cancelFailed: 'Failed to cancel payment request',
  reminderFailed: 'Failed to send reminders',
  memberLoadFailed: 'Failed to load member details',
  permissionDenied: 'You do not have permission to manage payments',
  dueDatePassed: 'Cannot edit amount or members - due date has passed',
  networkError: 'Network error. Please check your connection',
} as const;
```

### UI States & User Feedback

#### Loading States

```typescript
// Use ShLoadingSpinner for all async operations
if (isLoading) return <ShLoadingSpinner message="Loading payment requests..." />;
```

#### Empty States

```typescript
// Admin Payment List
'No payment requests yet. Create your first request to start collecting payments.';

// Member List (All Paid)
'✅ All members have paid! Payment complete.';

// Member List (No Members)
'No members added to this payment request.';

// Filter Results Empty
'No payments due this week.';
```

#### Success Feedback (User Notifications)

```typescript
// Use Alert.alert for immediate feedback (existing pattern in app)
import { Alert } from 'react-native';

Alert.alert('Success', 'Reminder sent to 5 members');
Alert.alert('Success', 'Payment request updated');
Alert.alert('Success', 'Request cancelled successfully');
Alert.alert('Error', 'Cannot cancel - payments already received');

// Note: If toast-style notifications are preferred, implement using
// react-native-toast-message or similar library (not currently in project)
```

### Error Handling

- Permission denied: "Only team admins can manage payment requests"
- Network errors: Show retry option
- Validation errors: Inline form validation
- Cancellation prevented: "Cannot cancel - payments already received"

### Security Considerations

- Verify user is team admin before any operations via `user_team_roles` table
- RLS Policies Required:
  - `payment_requests`: SELECT/UPDATE/DELETE restricted to team admins
  - `payment_request_members`: SELECT restricted to team admins
  - `user_team_roles`: SELECT to verify admin status
- Sanitize all user inputs before database operations
- Audit Trail Requirements:
  - Log all edit operations with timestamp and user_id
  - Log all cancellation attempts with reason
  - Log reminder send events with recipient list
  - Store audit logs in `payment_reminders` table (already exists for reminder history)

### Logging Guidelines (Using `/lib/utils/logger`)

#### Log Pattern for PAY-007

```typescript
import { logger } from '@lib/utils/logger';

// Use story tag [PAY-007] for all logs
logger.log('[PAY-007] Admin payment screen mounted');
logger.debug('[PAY-007] Payment data loaded:', { count: payments.length });
logger.error('[PAY-007] Failed to update payment:', error);
logger.warn('[PAY-007] User not admin, redirecting');
```

#### Required Logging Points

1. **Screen Lifecycle**
   - `logger.log('[PAY-007] Screen mounted: {screenName}')`
   - `logger.log('[PAY-007] Screen unmounted: {screenName}')`

2. **Data Operations**
   - `logger.log('[PAY-007] Fetching payment requests')`
   - `logger.debug('[PAY-007] Payments loaded:', { count, teamId })`
   - `logger.error('[PAY-007] Fetch failed:', error)`

3. **User Actions**
   - `logger.log('[PAY-007] User action: {action}', { paymentId })`
   - `logger.log('[PAY-007] Edit initiated:', paymentId)`
   - `logger.log('[PAY-007] Reminder sent:', { recipients })`
   - `logger.log('[PAY-007] Cancel requested:', { paymentId, reason })`

4. **Navigation**
   - `logger.log('[PAY-007] Navigating to:', screenName)`
   - `logger.debug('[PAY-007] Navigation params:', params)`

5. **Errors & Warnings**
   - `logger.error('[PAY-007] Permission denied:', { userId, teamId })`
   - `logger.warn('[PAY-007] Validation failed:', validationErrors)`
   - `logger.error('[PAY-007] API error:', { endpoint, error })`

### Developer Verification Plan (Without Running App)

#### 1. Syntax & Type Checking

```bash
# Run TypeScript compiler to check for errors
npx tsc --noEmit

# Expected: No type errors in new files
# Check: All props match component interfaces
# Verify: No unused imports or variables
```

#### 2. Linting

```bash
# Run ESLint to check code quality
npm run lint

# Expected: No linting errors
# Check: Follows coding standards
# Verify: No console.log (use logger instead)
```

#### 3. Import Verification

```bash
# Check all imports resolve correctly
grep -r "from '@" app/payments/[id]/
grep -r "from '@" components/Admin*

# Expected: All @cfg, @lib, @top paths valid
# Check: No circular dependencies
# Verify: Components exported in index.ts
```

#### 4. Database Query Validation

```sql
-- Test RLS policies in Supabase dashboard
SELECT * FROM payment_requests WHERE team_id = 'test-team-id';
SELECT * FROM payment_request_members WHERE payment_request_id = 'test-id';
UPDATE payment_requests SET status = 'cancelled' WHERE id = 'test-id';
```

#### 5. Component Structure Check

```bash
# Verify component file structure
ls -la components/AdminPaymentCard/
# Expected: index.ts, AdminPaymentCard.tsx

# Check component exports
grep "export" components/AdminPaymentCard/AdminPaymentCard.tsx
```

### Manual Test Plan for Human Tester

#### Pre-Test Setup

1. **User Accounts Needed:**
   - Admin account (team treasurer role)
   - Regular member account (for permission testing)
   - Test team with 5+ members

2. **Test Data:**
   - At least 3 payment requests in different states
   - Mix of paid/unpaid members
   - One overdue payment request

#### Test Scenarios

##### Scenario 1: Admin Payment List View

```
1. Login as team admin
2. Navigate: Teams tab → Select team → Admin section → Payments
3. VERIFY:
   □ Payment cards display correctly
   □ Amount badges show correct values
   □ Due dates and times visible
   □ "Manage Request" buttons work
   □ Filter dropdown ("This Week") functional
   □ Pull-to-refresh works
   □ Console shows: "[PAY-007] Admin payment screen mounted"
```

##### Scenario 2: Payment Details (Admin View)

```
1. From list, tap "Manage Request" on any payment
2. VERIFY:
   □ Payment title and team name display
   □ Due date banner shows with warning color
   □ Total amount displays correctly
   □ Member list shows with payment status badges
   □ Paid count (green) and Unpaid count (red) accurate
   □ Three-dot menu appears in header
   □ Console shows: "[PAY-007] Navigating to: admin-detail"
```

##### Scenario 3: Edit Payment Request

```
1. From details, tap three-dot menu → Edit
2. VERIFY:
   □ All form fields populate with existing data
   □ Required fields marked with * in gold
   □ Stripe ID is read-only
   □ Date/time picker works
   □ Member selection navigates to member list
   □ Fee calculator updates when amount changes
   □ Toggle switch for transaction fee works
   □ Save button in header (gold color)
   □ Cancel Payment Request button at bottom (red)
3. Make changes and tap Save
4. VERIFY:
   □ Changes persist when returning to details
   □ Console shows: "[PAY-007] Payment updated: {id}"
```

##### Scenario 4: Send Reminders

```
1. From payment details, tap three-dot menu → Send Reminders
2. VERIFY:
   □ Confirmation dialog appears
   □ Shows count of members to notify
   □ Send button works
   □ Success message displays
   □ Console shows: "[PAY-007] Reminder sent: {recipients}"
```

##### Scenario 5: Cancel Payment Request

```
1. From edit screen, tap "Cancel Payment Request"
2. VERIFY:
   □ Confirmation dialog with reason input
   □ Cancel requires reason
   □ If payments exist, shows error
   □ If no payments, cancellation succeeds
   □ Status updates to "Cancelled"
   □ Console shows: "[PAY-007] Cancel requested: {id, reason}"
```

##### Scenario 6: Permission Testing

```
1. Login as regular member (not admin)
2. Try to access admin payments URL directly
3. VERIFY:
   □ Access denied message
   □ Redirect to team page
   □ Console shows: "[PAY-007] Permission denied: {userId}"
```

##### Scenario 7: Error Handling

```
1. Turn on Airplane mode
2. Try to refresh payment list
3. VERIFY:
   □ Error message displays
   □ Retry button appears
   □ Console shows: "[PAY-007] Fetch failed: Network error"
4. Turn off Airplane mode and retry
5. VERIFY:
   □ Data loads successfully
```

#### Performance Checklist

- [ ] List loads within 2 seconds
- [ ] Smooth scrolling (no jank)
- [ ] Touch responses < 100ms
- [ ] No memory leaks (check after 5 min use)
- [ ] Images load progressively

#### Edge Cases to Test

- [ ] Empty state (no payment requests)
- [ ] Very long payment titles (text truncation)
- [ ] 50+ members in payment list
- [ ] Rapid navigation between screens
- [ ] Background/foreground app transitions
- [ ] Deep linking to payment details

## Testing

### Testing Standards

- Manual testing via Expo Go app
- Test on both iOS and Android platforms
- Verify all acceptance criteria are met
- Test with different user roles (admin vs member)
- Test offline/online scenarios
- Validate against Figma designs

### Test Scenarios

1. Admin can view all team payment requests
2. Admin can see payment status for each member
3. Admin can edit unpaid requests
4. Admin cannot edit requests with payments
5. Reminders send successfully to non-payers
6. Cancellation works with proper notifications
7. Non-admins cannot access admin screens
8. Proper error messages for all failure cases

## Developer Quick Reference

### Common Questions Answered

1. **Q: Which existing components can I reuse?**
   - A: 90% are existing Sh components. Only create 4 new ones listed in Component Implementation Plan.

2. **Q: How do I check if user is admin?**
   - A: Query `user_team_roles` table with user_id and team_id, check role = 'admin'

3. **Q: What happens to members who already paid when editing?**
   - A: They stay in the list but show with "Paid" badge. Warning shown if removing them.

4. **Q: Can I hardcode the border color rgba(158,155,151,0.2)?**
   - A: NO. Create a constant in colorPalette or use existing `borderColor` value.

5. **Q: How do I format currency amounts?**
   - A: Use `ShAmountDisplay` component - it handles pence to pounds conversion.

6. **Q: Which API functions already exist?**
   - A: Check `/lib/api/payments.ts` - most CRUD operations are already there.

7. **Q: How do I send the reminder notification?**
   - A: Call Edge Function `/functions/v1/send-payment-reminders` with auth token.

8. **Q: What's the difference between payment_status 'unpaid' and 'pending'?**
   - A: We only use 'paid' and 'unpaid'. No 'pending' status per Figma design.

### Files You'll Need to Modify

```
✅ Existing files to update:
- /app/teams/[id]/admin/payments.tsx (currently placeholder)
- /lib/api/payments.ts (may need admin-specific functions)
- /config/payments.ts (add PaymentErrorMessages)

🆕 New files to create:
- /app/payments/[id]/admin-detail.tsx
- /app/payments/[id]/edit.tsx
- /stores/adminPaymentStore.ts
- /components/AdminPaymentCard/
- /components/ShPaymentStatusBadge/
- /components/ShDotMenu/
- /components/AdminPaymentMemberItem/
```

## Change Log

| Date       | Version | Description                                                                                                              | Author     |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 2025-09-08 | 1.0     | Initial story creation from Epic                                                                                         | Sarah (PO) |
| 2025-09-08 | 1.1     | Fixed validation issues: Added epic reference, removed hardcoded strings, added mandatory epic requirements              | Sarah (PO) |
| 2025-09-08 | 1.2     | Addressed QA review: Added component order, Edge Function spec, clarified statuses, added UI states                      | Sarah (PO) |
| 2025-09-08 | 1.3     | Corrected edit restrictions to match design document - Due Date controls Amount/Members editing                          | Sarah (PO) |
| 2025-09-08 | 1.4     | Added developer clarity: Database tables, API functions, constants usage, navigation params, error messages              | Sarah (PO) |
| 2025-09-08 | 1.5     | Addressed QA observations: Fixed version number, clarified payment_reminders table for audit, updated to use Alert.alert | Sarah (PO) |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.1 (claude-opus-4-1-20250805)

### Debug Log References

- [PAY-007] Admin payment screen mounted/unmounted
- [PAY-007] Fetching payment requests for team
- [PAY-007] Payment detail loaded
- [PAY-007] User action tracking (filter_change, pull_to_refresh, etc.)
- [PAY-007] Permission checks and denials
- [PAY-007] Edit/Cancel/Reminder operations

### Completion Notes List

- ✅ Created 4 new components as specified (ShPaymentStatusBadge, ShDotMenu, AdminPaymentMemberItem, AdminPaymentCard)
- ✅ Updated admin payments list screen with filtering and permission checks
- ✅ Created admin payment detail screen with member management
- ✅ Created edit payment request screen with Due Date controls for Amount/Members
- ✅ Created adminPaymentStore for state management
- ✅ Created send-payment-reminders Edge Function with rate limiting
- ✅ Added PaymentErrorMessages to config as required
- ✅ All logging uses [PAY-007] tag
- ✅ Permission checks via user_team_roles table
- ✅ No hardcoded values - all from config
- ✅ Alert.alert() used for user feedback (not toast)

### File List

**New Files Created:**

- /components/ShPaymentStatusBadge/ShPaymentStatusBadge.tsx
- /components/ShPaymentStatusBadge/index.ts
- /components/ShDotMenu/ShDotMenu.tsx
- /components/ShDotMenu/index.ts
- /components/AdminPaymentMemberItem/AdminPaymentMemberItem.tsx
- /components/AdminPaymentMemberItem/index.ts
- /components/AdminPaymentCard/AdminPaymentCard.tsx
- /components/AdminPaymentCard/index.ts
- /stores/adminPaymentStore.ts
- /app/payments/[id]/admin-detail.tsx
- /app/payments/[id]/edit.tsx
- /supabase/functions/send-payment-reminders/index.ts

**Modified Files:**

- /app/teams/[id]/admin/payments.tsx (updated from placeholder)
- /components/index.ts (added new component exports)
- /config/payments.ts (added PaymentErrorMessages)
- /tsconfig.json (added @sto path alias)

## QA Results

### Review Date: 2025-09-09

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Overall implementation quality is **GOOD** with some notable concerns:

**Strengths:**

- All 6 acceptance criteria have been implemented successfully
- Clean component architecture following established patterns
- Proper state management using Zustand store
- Good separation of concerns between UI and business logic
- Comprehensive error handling with user feedback
- Security checks implemented for admin permissions
- Proper use of configuration constants (no hardcoded values)
- Logging implemented with story tags [PAY-007] throughout

**Critical Finding:**

- **NO TEST FILES EXIST** for this story - This is a significant gap for payment-related functionality

### Refactoring Performed

No refactoring performed as code structure is clean and follows established patterns. However, critical test coverage is missing.

### Compliance Check

- Coding Standards: ✓ Follows established patterns, uses config constants
- Project Structure: ✓ Components properly organized, store patterns followed
- Testing Strategy: ✗ **CRITICAL** - No test files found for payment admin functionality
- All ACs Met: ✓ All 6 acceptance criteria implemented

### Improvements Checklist

**Critical - Must Address:**

- [ ] **Add comprehensive test coverage** for admin payment management
  - Unit tests for adminPaymentStore
  - Component tests for AdminPaymentCard, ShPaymentStatusBadge, ShDotMenu
  - Integration tests for payment list/detail/edit screens
  - Edge Function tests for send-payment-reminders
- [ ] **Add RLS policy tests** to verify admin-only access restrictions
- [ ] **Add rate limiting tests** for reminder functionality (24-hour limit)

**Recommended Improvements:**

- [ ] Consider adding optimistic UI updates for better UX
- [ ] Add pagination for payment lists (currently loads all)
- [ ] Consider caching strategy for payment data
- [ ] Add batch operations for bulk actions

### Security Review

**Good Security Practices Found:**

- ✓ Admin permission checks implemented at screen level
- ✓ User authentication verified in Edge Function
- ✓ Rate limiting implemented for reminders (24-hour window)
- ✓ Input validation for payment amounts and required fields
- ✓ Confirmation dialogs for destructive actions

**Security Concerns:**

- No client-side validation of Stripe payment IDs format
- Consider adding audit logging for all admin actions
- No CSRF protection evident (may be handled at Supabase level)

### Performance Considerations

**Potential Issues:**

- Loading all payment requests without pagination could impact performance with large datasets
- No debouncing on filter changes could cause excessive re-renders
- Consider implementing virtual scrolling for member lists with many participants

**Recommendations:**

- Implement pagination or lazy loading for payment lists
- Add debouncing to filter operations
- Consider React.memo for expensive list components

### Files Modified During Review

No files modified - code quality is acceptable, but test coverage is critically missing.

### Gate Status

Gate: **CONCERNS** → docs/qa/gates/payments.PAY-007-admin-payment-management.yml
Risk Level: **HIGH** (payment functionality without tests)

### Requirements Traceability

**AC1: Admin view of payment requests** ✓

- Implemented in `/app/teams/[id]/admin/payments.tsx`
- Shows list with filters, amounts, and collection progress

**AC2: Payment request details** ✓

- Implemented in `/app/payments/[id]/admin-detail.tsx`
- Displays full details with member payment status

**AC3: Edit request capability** ✓

- Implemented in `/app/payments/[id]/edit.tsx`
- Due Date controls Amount/Members editing as specified

**AC4: Send reminders to non-payers** ✓

- Edge Function `/supabase/functions/send-payment-reminders/`
- Rate limiting implemented (24-hour window)

**AC5: Cancel request with notifications** ✓

- Cancel functionality with reason prompt
- Warnings for existing payments

**AC6: See who has/hasn't paid** ✓

- Member list with payment status badges
- Paid/unpaid counts displayed

### Test Coverage Assessment

**CRITICAL GAP - No test files found:**

Required test scenarios (Currently MISSING):

1. Admin permission verification
2. Payment list filtering and sorting
3. Edit restrictions based on due date
4. Reminder rate limiting (24-hour window)
5. Cancellation with existing payments
6. Member payment status updates
7. Edge Function authentication
8. Error handling scenarios
9. Network failure recovery
10. Input validation boundaries

### Recommended Status

[✗ Changes Required - See unchecked items above]

**Blocking Issue:** Payment-related functionality requires comprehensive test coverage before production deployment. While the implementation is solid, the lack of tests for financial operations presents an unacceptable risk.

(Story owner decides final status)
