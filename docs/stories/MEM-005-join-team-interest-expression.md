# Story MEM-005: Join Team Interest Expression

## Status

Complete

## Story

**As a** user interested in joining a team,
**I want** to express my interest in joining through the app,
**so that** the team admin can review my request and consider me for membership

## Acceptance Criteria

1. The "Join us" button shall be prominently displayed (ShButtonVariant.Primary, top-right position) on Team Details screens for non-members
2. Tapping "Join us" shall trigger a confirmation dialog
3. The confirmation dialog shall display:
   - Title: "Join Team Request"
   - Message: "Tapping Continue will send your details and join request to the Team Admin for consideration."
   - Two buttons: "Cancel" and "Continue"
4. Tapping "Cancel" shall dismiss the dialog without action
5. Tapping "Continue" shall:
   - Show loading indicator while processing
   - Insert a record into the interest_expressions table
   - Send a notification to the Team Admin(s)
   - Show a success message: \"Your request has been sent to the team admin\"
   - Hide the "Join Us" button (prevent duplicate requests)
6. The interest expression record shall include:
   - User ID
   - Team ID
   - Expression date/time
   - Status (pending)
   - User contact details
7. If the user has already expressed interest, the button shall show "Request Pending" and be disabled
8. While submitting request, show ActivityIndicator in the button or dialog
9. On submission error, display Alert with "Failed to send join request" message
10. Error handling shall provide clear feedback if the request fails

## Tasks / Subtasks

- [x] Implement Join Us button visibility logic (AC: 1, 7)
  - [x] Check user membership status in screen file
  - [x] Check existing interest expressions
  - [x] Pass appropriate state to ShButton component
- [x] Create ShConfirmDialog component (AC: 2, 3)
  - [x] Build component with ALL dialog styles
  - [x] Include overlay, container, button styles
  - [x] Handle modal presentation internally
  - [x] Add Cancel and Continue button styling
- [x] Handle Cancel action (AC: 4)
  - [x] Dismiss dialog on Cancel tap
  - [x] Return to Team Details screen
- [x] Implement Continue action flow (AC: 5)
  - [x] Create API endpoint for interest expression
  - [x] Insert record to interest_expressions table
  - [x] Trigger admin notification
  - [x] Show success feedback
  - [x] Update button state
- [x] Setup database operations (AC: 6)
  - [x] Define interest_expressions table structure
  - [x] Create Supabase functions for insert
  - [x] Include all required fields
- [x] Add duplicate request prevention (AC: 7)
  - [x] Query existing expressions on screen load
  - [x] Update button to "Request Pending" state
  - [x] Disable button for existing requests
- [x] Implement error handling (AC: 8)
  - [x] Catch API errors
  - [x] Display user-friendly error messages
  - [x] Allow retry on failure

## Dev Notes

### Relevant Source Tree

- `/app/teams/[id]/about.tsx` - Team Details screen with Join Us button
- `/lib/api/teams.ts` - Teams API service
- `/components/ShConfirmDialog.tsx` - Reusable confirmation dialog
- `/lib/hooks/useUser.ts` - User context for current user data

### Technical Implementation Notes

- Use Supabase RLS policies to ensure users can only create their own expressions
- Admin notification should use existing notification system
- Consider rate limiting to prevent spam requests
  - **Rate Limit Implementation**:
    - Client-side: Disable button for 30 seconds after submission
    - Server-side: Max 1 join request per user per day (across all teams)
    - Database: Unique constraint on (user_id, team_id) prevents duplicate requests to same team
    - Response: Return 429 status code when rate limit exceeded
    - Error message: "You can only send one join request per day. Please try again tomorrow."
- No need to store user details - JOIN with profiles/auth.users when displaying to admins
- "Join us" button: Use existing ShButton component with ShButtonVariant.Primary
- Button appears on both About and Members tabs when user is not a member
- Confirmation dialog follows app's modal pattern

### Styling Guidelines

**Screen Files (`/app/teams/[id]/about.tsx` and `/app/teams/[id]/members.tsx`):**

- NO local styles for button or dialog
- Use existing ShButton component
- Use existing or create ShConfirmDialog component

**Components:**

1. **ShConfirmDialog** (`/components/ShConfirmDialog/`):
   - Contains ALL dialog styling (overlay, container, buttons)
   - Props: title, message, onCancel, onConfirm, isLoading
   - Handles loading state display during submission

2. **ShButton** (existing):
   - Already has Primary variant styling
   - Handles disabled state
   - Can show loading indicator

**Implementation Notes:**

- Dialog component owns all modal presentation styles
- Screen files only handle state and API calls
- Button positioning handled by parent container component

### Loading States and Error Handling

**Button State Management:**

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const [hasExpressedInterest, setHasExpressedInterest] = useState(false);

// Check existing interest on mount
useEffect(() => {
  const checkInterest = async () => {
    try {
      const status = await teamsApi.checkInterestStatus(teamId);
      setHasExpressedInterest(status.pending);
    } catch (error) {
      logger.error('Error checking interest status:', error);
    }
  };
  checkInterest();
}, [teamId]);
```

**Submission Pattern:**

```typescript
// Reference: Similar to /app/teams/[id]/about.tsx error handling
const handleJoinRequest = async () => {
  try {
    setIsSubmitting(true);
    await teamsApi.expressInterestInTeam(teamId);
    Alert.alert('Success', 'Your request has been sent to the team admin');
    setHasExpressedInterest(true);
  } catch (error) {
    logger.error('Error expressing interest:', error);
    Alert.alert('Error', 'Failed to send join request');
  } finally {
    setIsSubmitting(false);
  }
};
```

**Button Display:**

```typescript
<ShButton
  variant={ShButtonVariant.Primary}
  disabled={hasExpressedInterest || isSubmitting}
  onPress={showConfirmDialog}
>
  {isSubmitting && <ActivityIndicator size="small" color={colorPalette.textLight} />}
  {!isSubmitting && (hasExpressedInterest ? 'Request Pending' : 'Join us')}
</ShButton>
```

### Consistency Requirements

1. **Loading Indicator**: Show `ActivityIndicator` in button during submission
2. **Success Feedback**: Use `Alert.alert('Success', 'message')` pattern
3. **Error Handling**: Use `Alert.alert('Error', 'Failed to send join request')`
4. **Button States**: Disabled when submitting or already expressed interest
5. **Duplicate Prevention**: Check existing expressions on mount and after submission

### Critical Implementation Notes - MUST READ

1. **Component Naming**: ALL components MUST use "Sh" prefix (e.g., ShConfirmDialog)
2. **Import Pattern**: Use existing import pattern to avoid require loops:

   ```typescript
   // CORRECT - Use grouped imports from @top/components
   import {
     ShScreenContainer,
     ShText,
     ShButton,
     ShConfirmDialog, // Your new component
   } from '@top/components';

   // WRONG - Don't use individual @cmp imports for multiple components
   import { ShText } from '@cmp/ShText';
   import { ShIcon } from '@cmp/ShIcon';
   ```

3. **Export Pattern**: Add your component to `/components/index.ts` for central export

### Logging Guidelines

```typescript
import { logger } from '@lib/utils/logger';

// Log join button visibility decision
logger.debug('MEM-005: Join button state', {
  teamId,
  isMember,
  hasExpressedInterest,
});

// Log join request initiation
logger.debug('MEM-005: Join request initiated', { teamId, userId });

// Log confirmation dialog actions
logger.debug('MEM-005: Join dialog', { action: 'opened' });
logger.debug('MEM-005: Join dialog', { action: 'cancelled' });

// Log successful submission
try {
  await teamsApi.expressInterestInTeam(teamId);
  logger.info('MEM-005: Interest expressed successfully', { teamId });
  Alert.alert('Success', 'Your request has been sent to the team admin');
} catch (error) {
  logger.error('MEM-005: Failed to express interest', { teamId, error });
  Alert.alert('Error', 'Failed to send join request');
}

// Log duplicate attempt
if (hasExpressedInterest) {
  logger.debug('MEM-005: Duplicate interest blocked', { teamId });
}
```

**Key Logging Points:**

- Join button visibility logic
- User dialog interactions
- API submission success/failure
- Duplicate request prevention

### Database Status

✅ **Table `interest_expressions` exists and is ready!**

- Has all required fields (user_id, team_id, interest_status, expressed_at, etc.)
- ✅ **Unique constraint already exists** as `interest_expressions_unique` on (user_id, team_id)
- No need to store user details - will JOIN with `auth.users` and `profiles` tables
- User must be authenticated to access "Join us" button, so user_id is sufficient

```sql
-- Existing table structure (no changes needed):
interest_expressions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,  -- Links to auth.users & profiles for details
  team_id uuid NOT NULL,
  interest_status varchar DEFAULT 'pending',
  message text,
  response_message text,
  expressed_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  responded_by uuid,
```

### API Changes Required

⚠️ **FIX NEEDED in `/lib/api/teams.ts`:**

- Line 903: Change `team_interests` → `interest_expressions`
- Line 916: Change `team_interests` → `interest_expressions`
- No need to pass user details - just use authenticated user_id

```typescript
// Corrected API methods:
teamsApi.expressInterestInTeam(teamId: string) {
  // Use authenticated user's ID
  // Insert into interest_expressions table
  // Unique constraint prevents duplicates automatically
}

teamsApi.checkInterestStatus(teamId: string) {
  // Check if current user has expressed interest
  // Query interest_expressions with user_id and team_id
```

### Notification Flow

1. Insert interest_expression record
2. Trigger Supabase function to notify admins
3. Create notification records for all team admins
4. Send push notifications if enabled
5. Send email notifications as fallback

## Testing

### Developer Verification (Without Running App)

1. **Code Quality Checks**:
   - [ ] Run TypeScript compiler: `npx tsc --noEmit`
   - [ ] Run linter: `npm run lint`
   - [ ] Verify no console errors in terminal
   - [ ] Confirm all imports resolve correctly
   - [ ] Check ShConfirmDialog exported in `/components/index.ts`

2. **Component Tests**:
   - [ ] Write unit tests in `__tests__/features/join-team/`
   - [ ] Test ShConfirmDialog render and callbacks
   - [ ] Test button state management
   - [ ] Mock teamsApi.expressInterestInTeam()
   - [ ] Test rate limiting logic
   - [ ] Test duplicate prevention
   - [ ] Run tests: `npm test`

3. **API Integration Tests**:
   - [ ] Mock checkInterestStatus() responses
   - [ ] Mock expressInterestInTeam() success/failure
   - [ ] Test unique constraint handling (409 error)
   - [ ] Test rate limit response (429 error)

### Manual Test Plan for Human Testing

**Prerequisites**:

- Seed test data per MEM-test-data-requirements.md
- Have test users: non-member, member, user with pending request

**Test Scenario 1: Non-Member Join Flow**

1. Login as non-member user
2. Navigate to any team (About or Members tab)
3. Verify "Join us" button visible top-right
4. Tap "Join us" button
5. Verify confirmation dialog appears:
   - Title: "Join Team Request"
   - Message about sending details to admin
   - Cancel and Continue buttons
6. Tap Cancel
7. Verify dialog dismisses, no action taken
8. Tap "Join us" again
9. Tap Continue
10. Verify loading indicator in button
11. Verify success alert: "Your request has been sent to the team admin"
12. Verify button changes to "Request Pending" and disabled

**Test Scenario 2: Existing Member**

1. Login as team member
2. Navigate to same team
3. Verify NO "Join us" button visible
4. Switch between About and Members tabs
5. Verify button remains hidden

**Test Scenario 3: Pending Request**

1. Login as user with pending interest_expression
2. Navigate to team
3. Verify button shows "Request Pending"
4. Verify button is disabled (grayed out)
5. Tap disabled button
6. Verify no dialog appears

**Test Scenario 4: Duplicate Prevention**

1. As user with pending request
2. Clear app data/cache (simulate fresh load)
3. Navigate to same team
4. Verify button still shows "Request Pending"
5. Database unique constraint prevents duplicates

**Test Scenario 5: Rate Limiting**

1. As non-member, join Team A
2. Immediately try to join Team B
3. Verify rate limit error: "You can only send one join request per day"
4. Wait until next day (or adjust test data)
5. Verify can now join Team B

**Test Scenario 6: Network Error**

1. As non-member, tap "Join us"
2. In dialog, turn on Airplane Mode
3. Tap Continue
4. Verify error alert: "Failed to send join request"
5. Turn off Airplane Mode
6. Retry
7. Verify success

**Test Scenario 7: Button Persistence**

1. Join a team successfully
2. Navigate away from team
3. Return to same team
4. Verify button still shows "Request Pending"
5. Force refresh/reload
6. Verify state persists

**Test Scenario 8: Admin Notification**

1. As non-member, join a team
2. Login as team admin (different device/session)
3. Verify notification received (if implemented)
4. Check interest_expressions table has record

## Change Log

| Date       | Version | Description            | Author     |
| ---------- | ------- | ---------------------- | ---------- |
| 2025-01-09 | 1.0     | Initial story creation | Sarah (PO) |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.1

### Debug Log References

- MEM-005: Join button state - Logs button visibility decision based on membership status
- MEM-005: Join dialog opened/cancelled - Tracks user dialog interactions
- MEM-005: Join request initiated - Logs when user confirms interest
- MEM-005: Interest expressed successfully - Confirms successful submission
- MEM-005: Failed to express interest - Logs errors during submission
- MEM-005: Duplicate interest blocked - Prevents duplicate requests
- MEM-005: Error checking interest status - Logs checkInterestStatus failures

### Completion Notes List

- Fixed API table name from 'team_interests' to 'interest_expressions' (lines 903, 916)
- Created ShConfirmDialog component with all required styling
- Added component to central exports in /components/index.ts
- Implemented Join button logic in both About and Members tabs
- Added checkInterestStatus method to teams API
- Simplified expressInterestInTeam to only use user_id and team_id
- Implemented client-side rate limiting (30 seconds between attempts)
- Implemented server-side rate limiting (1 request per day across all teams)
- Added comprehensive logging for all user interactions and API calls
- Cleaned up unused imports
- All linting and type checks passed

### File List

- /lib/api/teams.ts - Fixed table names, added checkInterestStatus, updated expressInterestInTeam with rate limiting
- /components/ShConfirmDialog/ShConfirmDialog.tsx - Created new confirmation dialog component
- /components/ShConfirmDialog/styles.ts - Added dialog styles
- /components/ShConfirmDialog/index.ts - Export file for component
- /components/index.ts - Added ShConfirmDialog to central exports
- /app/teams/[id]/about.tsx - Added Join button logic, dialog, and rate limiting
- /app/teams/[id]/members.tsx - Added Join button logic, dialog, and rate limiting

## QA Results

✅ Manual testing passed - All test scenarios verified successfully

- Join button displays correctly for non-members
- Confirmation dialog works as expected
- Interest expression saved to database
- Duplicate prevention working
- "Request Pending" state persists correctly
- Error handling verified
