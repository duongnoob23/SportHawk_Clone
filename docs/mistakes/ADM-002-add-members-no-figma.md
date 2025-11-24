# ADM-002: Team Admin - Add Members Screen

## Parent Epic

**ADM-000**: Team Administration Management - Allow Team Admins to manage team members, handle join requests, and appoint other admins

## Story Description

As a Team Admin, I want to review and manage players who have expressed interest in joining my team, allowing me to accept them as members or ignore their requests with appropriate notifications.

## Acceptance Criteria

1. **Navigation**
   - The screen SHALL be accessible by tapping "Add members" card from Manage Members screen (ADM-001)
   - The screen SHALL have navigation bar with title "Add Members" and back button
   - The screen SHALL only be accessible when pending interest count > 0

2. **Interested Players Display**
   - The screen SHALL show "Interested Players" as section title
   - Players SHALL be displayed from interest_expressions table where:
     - team_id matches selected team
     - interest_status = "pending"
   - Players SHALL be ordered by expressed_at column (oldest first)

3. **Player Card Display**
   - Each interested player SHALL display as a card showing:
     - Player avatar/photo
     - Full name (first_name + last_name)
     - Date of interest expression
     - Player's listed position (if available)
   - Cards SHALL have two action buttons: "Accept" and "Ignore"

4. **Accept Player - Confirmation**
   - Tapping "Accept" SHALL show confirmation dialog
   - Dialog message: "Confirm ACCEPTING {first_name} {last_name} to team: {team_name}"
   - Dialog buttons: "Confirm Accept" (primary), "Cancel" (secondary)

5. **Accept Player - Action**
   - Selecting "Confirm Accept" SHALL:
     - Insert player into team_members table (if not already member)
     - Update interest_expressions.interest_status to "accepted"
     - Send notification to accepted player via notifications table
   - The card SHALL be removed from the list immediately
   - Success toast: "{player_name} added to team"

6. **Ignore Player - Confirmation**
   - Tapping "Ignore" SHALL show confirmation dialog
   - Dialog message: "Confirm that you wish to IGNORE the JOIN request from {first_name} {last_name} to team: {team_name}"
   - Dialog buttons: "Confirm Ignore" (warning), "Cancel" (secondary)

7. **Ignore Player - Action**
   - Selecting "Confirm Ignore" SHALL:
     - Update interest_expressions.interest_status to "ignored"
     - Send notification to ignored player via notifications table
   - The card SHALL be removed from the list immediately
   - Info toast: "Request ignored"

8. **Empty State**
   - When all pending interests are processed, screen SHALL show:
     - Icon: People icon
     - Message: "No pending requests"
     - Subtext: "All interest expressions have been processed"
   - Back button SHALL return to Manage Members screen

9. **Loading & Error States**
   - Loading state SHALL show while fetching interest expressions
   - Network errors SHALL show retry button
   - Action errors SHALL keep card visible for retry

## Technical Requirements

### Navigation & Routing

- Route: `/teams/admin/add-members`
- Params: `teamId` (required)
- Entry point: Only from Manage Members "Add members" card

### Components to Use

- **ShConfirmDialog**: For accept/ignore confirmations
- **ShAvatar**: For player photos
- **ShText, ShButton**: Standard UI components
- **ShScreenContainer**: For screen layout
- **ShEmptyState**: For no pending requests state

### New Components Needed

- **ShInterestCard**: Card for interested player display
  ```typescript
  interface ShInterestCardProps {
    player: {
      id: string;
      name: string;
      photoUri?: string;
      position?: string;
      expressedAt: string;
    };
    onAccept: () => void;
    onIgnore: () => void;
    isProcessing?: boolean;
  }
  ```

### API Endpoints

```typescript
// teams.ts additions
async getInterestExpressions(teamId: string) {
  // Query interest_expressions with user profiles
  // WHERE team_id = teamId AND interest_status = 'pending'
  // ORDER BY expressed_at ASC
}

async acceptInterestExpression(teamId: string, userId: string) {
  // Transaction:
  // 1. Insert into team_members
  // 2. Update interest_expressions.interest_status = 'accepted'
  // 3. Create notification
}

async ignoreInterestExpression(teamId: string, userId: string) {
  // Update interest_expressions.interest_status = 'ignored'
  // Create notification
}
```

### Database Operations

```sql
-- Get pending interests
SELECT ie.*, u.first_name, u.last_name, u.photo_url, u.position
FROM interest_expressions ie
JOIN users u ON ie.user_id = u.id
WHERE ie.team_id = $1 AND ie.interest_status = 'pending'
ORDER BY ie.expressed_at ASC;

-- Accept player (transaction)
BEGIN;
INSERT INTO team_members (team_id, user_id, joined_at)
VALUES ($1, $2, NOW())
ON CONFLICT (team_id, user_id) DO NOTHING;

UPDATE interest_expressions
SET interest_status = 'accepted', processed_at = NOW()
WHERE team_id = $1 AND user_id = $2;

INSERT INTO notifications (user_id, type, title, message)
VALUES ($2, 'team_accepted', 'Request Accepted',
        'You have been accepted to join ' || $3);
COMMIT;
```

### Config Values

```typescript
// spacing.ts
spacing.cardPadding: 16
spacing.cardGap: 12
spacing.buttonGap: 8

// colors.ts
colorPalette.successGreen  // Accept button
colorPalette.warningOrange  // Ignore button
colorPalette.borderSubtle
colorPalette.textLight
```

### Logging Requirements

```typescript
logger.log('Add Members screen loaded', { teamId, pendingCount });
logger.log('Accept initiated', { playerId, teamId });
logger.log('Player accepted', { playerId, teamId });
logger.log('Ignore initiated', { playerId, teamId });
logger.log('Player ignored', { playerId, teamId });
logger.error('Failed to process interest', { error, playerId, action });
```

## State Management

```typescript
interface AddMembersState {
  teamId: string;
  teamName: string;
  interestedPlayers: InterestExpression[];
  processingPlayerId: string | null;
  isLoading: boolean;
  error: Error | null;
}

interface InterestExpression {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  position?: string;
  expressedAt: Date;
}
```

## Error Handling

- Duplicate member: Show toast "Player is already a team member"
- Network failure: Show alert with retry option
- Notification failure: Log error but don't block action
- Invalid state: Return to Manage Members with error toast

## Performance Considerations

- Load max 50 pending interests at once
- Implement pagination if more than 50
- Optimistic UI updates for accept/ignore
- Preload user avatars
- Cache team data from previous screen

## Accessibility

- Accept button: accessibilityLabel="Accept {player_name} to team"
- Ignore button: accessibilityLabel="Ignore request from {player_name}"
- Card: accessibilityHint="Player requesting to join team"
- Empty state: Announce when all requests processed

## Testing Requirements

1. Test with 0, 1, 10, 50+ pending interests
2. Verify oldest-first ordering
3. Test duplicate member prevention
4. Verify notification creation for both actions
5. Test optimistic UI updates
6. Verify transaction rollback on failure
7. Test network error recovery
8. Validate immediate card removal after action

## Security Considerations

- Verify user is team admin before any action
- Validate team ownership for all operations
- Sanitize notification content
- Prevent duplicate team_members entries
- Log all accept/ignore decisions for audit

## Related Stories

- ADM-001: Manage Members Screen (entry point)
- ADM-003: Manage Admins Screen (related admin feature)
- NOTIF-001: Notification System (for sending notifications)

## Future Enhancements

- Bulk accept/ignore functionality
- Filter by date range or player attributes
- Preview player profile before decision
- Undo action within 10 seconds
- Email notifications in addition to in-app
