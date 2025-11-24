# ADM-002: Team Admin - Add Members Screen (Figma: 559-2661)

## Parent Epic

**ADM-000**: Team Administration Management - Allow Team Admins to manage team members, handle interest expressions, and appoint other admins

## Story Description

As a Team Admin, I want to review players who have expressed interest in joining my team AND search for players to invite, allowing me to accept/ignore interest expressions and add new members via search.

**Figma Reference**: Node 559-2661
**File Location**: `/app/teams/[id]/admin/add-members.tsx`
**Route**: `/teams/{teamId}/admin/add-members`
**Parent Screen**: ADM-001 Manage Members (accessed via "Add members" card)

## Visual Design Specifications

### Screen Layout

- **Background**: `#161615` (Base Dark)
- **Navigation**: Back arrow with "Add Members" title
- **Content padding**: `24px` horizontal, `21px` vertical
- **Section gap**: `24px` between major sections

### Component Specifications

#### Navigation Header

```
Height: 112px
Border bottom: 1px solid rgba(158,155,151,0.2)
Back arrow: 17.5x15px at left: 35px
Title: "Add Members" - Inter Regular 16px #eceae8, centered
```

#### Section Headers

```
Font: Inter Medium 20px #eceae8
Tracking: -0.04px
Alert icon: 16x16px (for Interested Players section)
Icon position: After text with small gap
```

#### Interested Player Cards

```
Background: rgba(0,0,0,0.3)
Border: 1px solid rgba(158,155,151,0.2)
Border radius: 12px
Padding: 24px vertical, 12px horizontal
Gap: 16px between card sections
Card spacing: 12px between cards

Avatar section:
- Size: 48x48px circular
- Position: Left aligned

Text section:
- Name: Inter Regular 16px #eceae8
- Title/Role: Inter Regular 14px #9e9b97
- Gap: 4px between name and role

Divider line:
- Height: 1px
- Color: rgba(158,155,151,0.2)
- Full width

Button section:
- Gap: 16px between buttons
- Accept button:
  * Background: #eabd22
  * Text: "Accept" - Inter Regular 16px #161615
  * Height: 50px
  * Width: 144.795px
  * Border radius: 12px
- Ignore button:
  * Background: rgba(158,155,151,0.2)
  * Text: "Ignore" - Inter Regular 16px #eceae8
  * Height: 50px
  * Width: 144.795px
  * Border radius: 12px
```

#### Search Section

```
Header: "Search Players" - Inter Medium 20px #eceae8

Search bar:
- Same styling as ADM-001 search bar
- Height: 50px
- Background: rgba(0,0,0,0.3)
- Border: 1px solid rgba(158,155,151,0.2)

Helper text:
- Font: Inter Regular 12px #9e9b97
- Text: "By adding a player by search, you are sending them an invitation to join the team, you will be notified if they accept."
- Position: 12px below search bar
```

#### Search Result Cards

```
Same base styling as member cards from ADM-001
Height: 80px
Background: rgba(0,0,0,0.3)
Border: 1px solid rgba(158,155,151,0.2)

Plus icon (for adding):
- Position: right: 32px
- Two bars forming plus: 12x2px each
- Color: #eabd22
- Vertical bar rotated 90°
```

## Acceptance Criteria

1. **Screen Navigation**
   - Accessed from "Add members" card in Manage Members screen
   - Back arrow returns to Manage Members
   - Title "Add Members" centered in header

2. **Interested Players Section**
   - Section title with yellow alert icon
   - Shows all pending interest_expressions
   - Orders by expressed_at (oldest first)
   - Each card shows full player info with Accept/Ignore buttons
   - Cards have unique layout with divider line

3. **Accept Action**
   - Shows confirmation: "Confirm ACCEPTING {name} to team: {team_name}"
   - Buttons: "Confirm Accept" / "Cancel"
   - On confirm: Add to team_members, update status to "accepted", send notification
   - Card removed from list immediately

4. **Ignore Action**
   - Shows confirmation: "Confirm that you wish to IGNORE the JOIN request from {name} to team: {team_name}"
   - Buttons: "Confirm Ignore" / "Cancel"
   - On confirm: Update status to "ignored", send notification
   - Card removed from list immediately

5. **Search Players Section**
   - Always visible below Interested Players
   - Search bar with app default 500ms debounce
   - Helper text explains invitation system
   - Shows team members NOT in team

6. **Add Player via Search**
   - Plus icon (two bars) on search result cards
   - Tapping sends invitation (creates interest_expression)
   - Shows success notification
   - Player remains in search (can't add twice)

## Technical Implementation

### CRITICAL: No Local Styles in Page Files

**All styling MUST be encapsulated in components. The page files in /app should contain NO local styles, only component composition and business logic.**

### Existing Components to Use (NO MODIFICATIONS NEEDED)

```typescript
// These work as-is, no changes required:
-ShScreenContainer - // Screen layout wrapper
  ShSearchBar - // Already has 500ms debounce built-in
  ShConfirmDialog - // Confirmation popups
  ShText - // All text elements
  ShButton - // Accept/Ignore buttons
  ShIcon - // Plus icon for adding players
  ShAvatar - // Player profile photos
  ShSpacer - // Spacing between elements
  ShEmptyState; // When no interested players
```

### Components to Reuse from ADM-001

```typescript
// ShMemberCard.tsx - Same component from ADM-001, different config
interface ShMemberCardProps {
  avatar?: string;
  name: string;
  subtitle?: string;

  // For interested players section:
  onAccept?: () => void;
  onIgnore?: () => void;
  showAcceptIgnoreButtons?: boolean;

  // For search results section:
  onAdd?: () => void;
  showAddIcon?: boolean;

  isProcessing?: boolean; // When true: disable all buttons, show spinner on active button
}

// DEVELOPER NOTE: Empty states
// If no interested players: Show ShEmptyState with message "No pending requests"
// If no search results: Show ShEmptyState with message "No players found"

// ALL STYLES INSIDE COMPONENT - Interested Players config:
// - Height: spacing.memberCardHeight (80)
// - Show Accept/Ignore buttons
// - Button width: spacing.interestCardButtonWidth (145)
// - Button gap: spacing.memberCardButtonGap (12) - ADD TO CONFIG
// - Accept button: colorPalette.primaryGold
// - Ignore button: colorPalette.stoneGrey
// - Background: colorPalette.backgroundListItem
// - Border: colorPalette.borderInputField
// NO STYLE PROPS - all styling handled internally

// ALL STYLES INSIDE COMPONENT - Search Results config:
// - Height: spacing.memberCardHeight (80)
// - Show plus icon (12x2px bars)
// - Plus icon color: colorPalette.primaryGold
// - Icon width: spacing.removeIconWidth (12)
// - Icon height: spacing.removeIconHeight (2)
// - Background: colorPalette.backgroundListItem
// - Border: colorPalette.borderInputField
// NO STYLE PROPS - all styling handled internally
```

### Config Values to Add

```typescript
// Add to spacing.ts:
memberCardButtonGap: 12; // Gap between Accept/Ignore buttons
```

### NO MODIFIED COMPONENTS

- ShSearchBar works perfectly as-is with 500ms debounce
- All existing components are used without modification

### API Endpoints

#### ✅ EXISTING Endpoints (Ready to Use)

```typescript
// From /lib/api/teams.ts
teamsApi.expressInterestInTeam(teamId: string)  // Lines 505-533
// Can adapt this for invitation creation
```

#### ❌ NEW Endpoints to Implement

```typescript
// 1. Get pending interest expressions
teamsApi.getInterestExpressions(teamId: string)
// Implementation:
// - Query interest_expressions with user joins
// - Filter: team_id = teamId AND interest_status = 'pending'
// - Order by expressed_at ASC (oldest first)
// - Include user details (first_name, last_name, avatar_url)

// 2. Accept interest expression
teamsApi.acceptInterestExpression(teamId: string, userId: string)
// Implementation:
// - BEGIN transaction
// - Add user to team_members (if not exists)
// - UPDATE interest_expressions SET interest_status = 'accepted'
// - INSERT notification for accepted user
// - COMMIT transaction

// 3. Ignore interest expression
teamsApi.ignoreInterestExpression(teamId: string, userId: string)
// Implementation:
// - UPDATE interest_expressions SET interest_status = 'ignored'
// - INSERT notification for ignored user

// 4. Search non-team members for invitation
teamsApi.searchNonMembers(teamId: string, query: string)
// Implementation:
// - Query users table
// - EXCLUDE users already in team_members for this team
// - Search with ILIKE on first_name, last_name, email
// - ShSearchBar handles 500ms debounce automatically

// 5. Invite player to team
teamsApi.invitePlayer(teamId: string, userId: string)
// Implementation:
// - INSERT into interest_expressions
// - Set interest_status = 'invited' (new status)
// - Set expressed_at = now()
// - INSERT notification for invited user
```

### Database & RLS Requirements

#### Required RLS Policies for `interest_expressions` table

```sql
-- Policy: Team admins can UPDATE interest status
CREATE POLICY "Team admins can update interest status" ON interest_expressions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM team_admins
    WHERE team_admins.team_id = interest_expressions.team_id
    AND team_admins.user_id = auth.uid()
  )
);

-- Policy: Team admins can INSERT invitations
CREATE POLICY "Team admins can create invitations" ON interest_expressions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_admins
    WHERE team_admins.team_id = interest_expressions.team_id
    AND team_admins.user_id = auth.uid()
  )
);
```

#### Notification Creation Pattern

```typescript
// Helper function needed for consistent notifications:
// ✅ VERIFIED: notifications table structure confirmed via MCP
async function createTeamNotification(
  userId: string,
  teamId: string,
  action: 'accepted' | 'ignored' | 'invited',
  teamName: string
) {
  const titles = {
    accepted: 'Team Membership Accepted',
    ignored: 'Team Request Update',
    invited: 'Team Invitation',
  };

  const messages = {
    accepted: `You have been accepted to team ${teamName}`,
    ignored: `Your request to join ${teamName} was not accepted`,
    invited: `You have been invited to join ${teamName}`,
  };

  // ✅ CONFIRMED table structure via MCP
  await supabase.from('notifications').insert({
    user_id: userId,
    notification_type: 'team_membership', // NOT 'type'
    title: titles[action], // Required field
    message: messages[action], // Required field
    data: { team_id: teamId, action }, // jsonb field for metadata
    // created_at is auto-set by database
  });
}
```

#### Implementation Notes

- All operations require admin verification first
- Use transactions for multi-table updates (accept/ignore)
- Maintain consistent notification format
- Consider adding 'invited' as new interest_status value

### State Management

```typescript
interface AddMembersState {
  interestedPlayers: InterestExpression[];
  searchResults: Player[];
  searchQuery: string;
  isSearching: boolean;
  processingId: string | null;
  invitedPlayerIds: Set<string>;
}
```

## Logging Requirements

### Import Logger

```typescript
import { logger } from '@lib/utils/logger';
```

### Required Logging Points

#### Page Level Logging

```typescript
// Screen mount/unmount
logger.log('ADM-002: Add Members screen mounted', {
  teamId,
  userId: currentUserId,
  pendingInterestCount: interestedPlayers.length,
});

logger.log('ADM-002: Add Members screen unmounted');
```

#### Navigation

```typescript
// Back navigation
logger.log('ADM-002: Back navigation', {
  returningTo: 'ADM-001',
  processedCount: acceptedCount + ignoredCount,
});
```

#### Interest Expression Management

```typescript
// Accept flow initiated
logger.log('ADM-002: Accept initiated', {
  userId,
  userName,
  teamId,
});

// Accept confirmation
logger.log('ADM-002: Accept confirmation', {
  userId,
  action: 'confirm' | 'cancel',
});

// Accept success
logger.log('ADM-002: Interest accepted', {
  userId,
  userName,
  teamId,
  addedToTeam: true,
  timestamp: new Date().toISOString(),
});

// Accept failure
logger.error('ADM-002: Accept failed', {
  userId,
  teamId,
  error: error.message,
  stack: error.stack,
});

// Ignore flow initiated
logger.log('ADM-002: Ignore initiated', {
  userId,
  userName,
  teamId,
});

// Ignore confirmation
logger.log('ADM-002: Ignore confirmation', {
  userId,
  action: 'confirm' | 'cancel',
});

// Ignore success
logger.log('ADM-002: Interest ignored', {
  userId,
  userName,
  teamId,
  timestamp: new Date().toISOString(),
});

// Ignore failure
logger.error('ADM-002: Ignore failed', {
  userId,
  teamId,
  error: error.message,
});
```

#### Search Operations

```typescript
// Search initiated
logger.log('ADM-002: Player search initiated', {
  query,
  teamId,
  searchType: 'non_members',
});

// Search results
logger.log('ADM-002: Player search results', {
  query,
  resultCount: results.length,
  teamId,
});

// Search cleared
logger.log('ADM-002: Player search cleared', { teamId });
```

#### Invitation Flow

```typescript
// Invite initiated
logger.log('ADM-002: Player invitation initiated', {
  playerId,
  playerName,
  teamId,
});

// Invite success
logger.log('ADM-002: Player invited', {
  playerId,
  playerName,
  teamId,
  invitationType: 'search',
  timestamp: new Date().toISOString(),
});

// Invite failure
logger.error('ADM-002: Invitation failed', {
  playerId,
  teamId,
  error: error.message,
});

// Duplicate invite attempt
logger.warn('ADM-002: Duplicate invitation attempt', {
  playerId,
  teamId,
  alreadyInvited: true,
});
```

#### Data Loading

```typescript
// Interest expressions fetch
logger.log('ADM-002: Fetching interest expressions', { teamId });

logger.log('ADM-002: Interest expressions loaded', {
  teamId,
  pendingCount: interestedPlayers.length,
});

// API errors
logger.error('ADM-002: API error', {
  endpoint: 'getInterestExpressions',
  teamId,
  error: error.message,
});
```

#### Component Interactions

```typescript
// ShMemberCard button interactions
logger.debug('ADM-002: Interest card interaction', {
  userId,
  action: 'accept' | 'ignore',
});

// Plus icon tap
logger.debug('ADM-002: Add player icon tapped', {
  playerId,
  fromSearch: true,
});

// Search debounce
logger.debug('ADM-002: Search debounced', {
  query,
  debounceMs: 500,
});
```

### Debug Mode Helpers

```typescript
// For testing button interactions
if (__DEV__) {
  logger.debug('ADM-002: Accept button state', {
    userId,
    isProcessing,
    timestamp: Date.now(),
  });

  logger.debug('ADM-002: Ignore button state', {
    userId,
    isProcessing,
    timestamp: Date.now(),
  });

  // Track notification creation
  logger.debug('ADM-002: Notification created', {
    userId,
    notificationType: 'accepted' | 'ignored' | 'invited',
    teamId,
  });
}
```

### Performance Logging

```typescript
// Track processing times
const startTime = Date.now();

// After operation completes
logger.log('ADM-002: Operation performance', {
  operation: 'acceptInterest',
  durationMs: Date.now() - startTime,
  teamId,
});
```

## Key Differences from Original Design

1. **Combined screen**: Both interest review AND player search
2. **Different card layouts**: Interest cards have unique button layout
3. **Invitation system**: Search doesn't directly add, sends invitation
4. **Alert icon**: Visual indicator for pending interests
5. **Plus icon design**: Two simple bars, not complex icon

## Testing Requirements

1. Verify card heights match Figma (80px for search, custom for interests)
2. Test app default 500ms search debounce
3. Verify button dimensions (144.795px width, 50px height)
4. Test with 0, 1, 5+ interested players
5. Verify plus icon is two 12x2px bars
6. Test invitation flow vs direct add

## Manual Test Plan for QA

### Prerequisites

- Tester must have Team Admin role
- Create 3+ test users who expressed interest (pending status)
- Have access to notifications table to verify entries
- Know some users who are NOT team members for search testing

### Test Scenarios

#### 1. Navigation

- [ ] Access from ADM-001 "Add members" card tap
- [ ] Verify back arrow returns to Manage Members
- [ ] Title "Add Members" centered in header
- [ ] Only accessible to admin users

#### 2. Interested Players Section

- [ ] Yellow alert icon (16x16) next to "Interested Players" header
- [ ] Shows all pending interest_expressions
- [ ] Cards ordered by expressed_at (oldest first)
- [ ] Each card shows: avatar (48x48), name, title/role
- [ ] Horizontal divider line between avatar/text and buttons
- [ ] Accept button: yellow (#eabd22), 144.795px wide
- [ ] Ignore button: grey (rgba(158,155,151,0.2)), 144.795px wide
- [ ] 16px gap between buttons

#### 3. Accept Flow

- [ ] Tap Accept button
- [ ] Popup: "Confirm ACCEPTING John Smith to team: Team Name"
- [ ] Buttons: "Confirm Accept" / "Cancel"
- [ ] Tap Cancel - nothing happens
- [ ] Tap Accept again → Confirm Accept
- [ ] Card disappears immediately
- [ ] Check team_members table - user added
- [ ] Check interest_expressions - status = "accepted"
- [ ] Check notifications table - acceptance notification created

#### 4. Ignore Flow

- [ ] Tap Ignore button
- [ ] Popup: "Confirm that you wish to IGNORE the JOIN request from John Smith to team: Team Name"
- [ ] Buttons: "Confirm Ignore" / "Cancel"
- [ ] Tap Cancel - nothing happens
- [ ] Tap Ignore again → Confirm Ignore
- [ ] Card disappears immediately
- [ ] Check interest_expressions - status = "ignored"
- [ ] Check notifications table - ignore notification created
- [ ] User NOT added to team_members

#### 5. Search Players Section

- [ ] "Search Players" header always visible
- [ ] Search bar below header
- [ ] Helper text (12px, #9e9b97): "By adding a player by search..."
- [ ] Helper text 12px below search bar

#### 6. Search Functionality

- [ ] Type "mar" - wait 500ms - search triggers
- [ ] Results show non-team members only
- [ ] Search matches first_name, last_name, email
- [ ] Each result card 80px height
- [ ] Plus icon (two 12x2px bars) on right at 32px
- [ ] Plus icon color #eabd22

#### 7. Add via Search (Invitation)

- [ ] Tap plus icon on search result
- [ ] Creates invitation (interest_expression)
- [ ] Success notification shown
- [ ] Player remains in search results
- [ ] Cannot add same player twice
- [ ] Check interest_expressions - new row with "invited" status

#### 8. Visual Validation

- [ ] Background: #161615
- [ ] Interest cards: rgba(0,0,0,0.3) background
- [ ] Search result cards: 80px height
- [ ] Button height: 50px
- [ ] Button border radius: 12px
- [ ] Card padding: 24px vertical, 12px horizontal
- [ ] Divider line: 1px rgba(158,155,151,0.2)

#### 9. Empty States

- [ ] No interested players: show empty state
- [ ] No search results: show appropriate message
- [ ] Search section always visible even with no interests

#### 10. Edge Cases

- [ ] Process all interests - section becomes empty
- [ ] Test with 10+ interested players (scrolling)
- [ ] Rapid Accept/Ignore clicks (no double processing)
- [ ] Very long names (text truncation)
- [ ] Search for user already in team (shouldn't appear)
- [ ] Search for user with pending interest (handle appropriately)

#### 11. Data Verification

- [ ] All accepted users appear in team roster
- [ ] All ignored users can request again later
- [ ] Notifications sent to correct users
- [ ] Interest_expressions status properly updated
- [ ] No duplicate team_members created

## Notes

- Interest cards have unique layout with horizontal button arrangement
- Search creates invitations, not direct team additions
- Helper text is crucial for user understanding
- Plus icon must be two separate bars forming a plus
