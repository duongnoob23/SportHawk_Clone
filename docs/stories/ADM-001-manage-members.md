# ADM-001: Team Admin - Manage Members Screen (Figma: 559-2682)

## Parent Epic

**ADM-000**: Team Administration Management - Allow Team Admins to manage team members, handle join requests, and appoint other admins

## Story Description

As a Team Admin, I want to manage my team's members through the Teams > Admins tab interface where I can view all members, search for specific members, see pending interest expressions, and remove members when necessary.

**Figma Reference**: Node 559-2682
**File Location**: `/app/teams/[id]/admin/manage-members.tsx`
**Route**: `/teams/{teamId}/admin/manage-members`

## Visual Design Specifications

### Screen Layout

- **Background**: `#161615` (Base Dark)
- **Content padding**: `24px` horizontal
- **Section gap**: `24px` vertical
- **No separate navigation bar** - uses Teams tab structure

### Component Specifications

#### Add Members Card

```
Background: rgba(0,0,0,0.3)
Border: 1px solid rgba(158,155,151,0.2)
Border radius: 12px
Padding: 24px horizontal, 24px vertical
Height: 88px
Gap: 20px between elements

Alert icon container:
- Size: 40x40px
- Background: rgba(234,189,34,0.1)
- Border radius: 12px
- Icon: 16x16px centered

Text:
- Title: "Add members" - Inter Regular 16px #eceae8
- Subtitle: "{count} interested" - Inter Regular 14px #9e9b97

Right arrow: 8x14px in #eabd22
```

#### Search Bar

```
Background: rgba(0,0,0,0.3)
Border: 1px solid rgba(158,155,151,0.2)
Border radius: 12px
Height: 50px
Padding: 16px left for icon, 44px left for text

Search icon: 16x16px at left: 16px, top: 17px
Placeholder: "Search members..." - Inter Regular 16px #9e9b97
```

#### Member List Header

```
Title: "Team Members" - Inter Medium 20px #eceae8, tracking -0.04px
Dropdown: "All" - Inter Regular 16px #9e9b97
Dropdown icon: 14x8px downward arrow
```

#### Member Cards

```
Background: rgba(0,0,0,0.3)
Border: 1px solid rgba(158,155,151,0.2)
Border radius: 12px
Height: 80px
Padding: 16px
Gap between cards: 12px

Avatar:
- Size: 48x48px
- Border radius: 50%
- Position: 16px from left, 16px from top

Text container:
- Left: 60px from avatar
- Name: Inter Regular 16px #eceae8
- Title/Role: Inter Regular 14px #9e9b97

Remove icon:
- Position: right: 32px, vertical center
- Size: 12px width, 2px height
- Color: #eabd22 (Primary Gold)
- Shape: Horizontal bar
```

## Acceptance Criteria

1. **Screen Access**
   - Screen accessed via Teams tab > Admins tab (yellow highlighted)
   - Team must be selected in dropdown (shows team photo, name, type)
   - Only accessible to users with admin role

2. **Team Selection**
   - DEVELOPER NOTE: Team ID comes from URL params `[id]`
   - Use existing team context or router params
   - If no team or invalid team ID, redirect to teams list
   - Shows selected team with 40x40px photo
   - Team name in Inter Regular 18px #eceae8
   - Team type in Inter Regular 14px #9e9b97
   - Dropdown arrow button 40x40px with down arrow icon

3. **Add Members Card**
   - Always visible at top of content area
   - Shows count from interest_expressions (pending status)
   - Yellow alert icon in translucent container
   - Navigates to Add Members screen (ADM-002) on tap
   - Right arrow indicates navigation

4. **Search Functionality**
   - Search bar positioned below Add Members card
   - Uses app default 500ms debounce on text input
   - Searches across first_name, last_name, email
   - Updates member list in real-time
   - Maintains card styling consistency

5. **Member List Display**
   - "Team Members" header with "All" dropdown
   - DEVELOPER NOTE: Dropdown shows "All" or "Search" - READ-ONLY indicator, not interactive
   - Changes to "Search" automatically when search is active
   - Shows all team members by default
   - Each member in consistent card format
   - Vertical scroll when > 5 members
   - 12px gap between member cards

6. **Member Removal**
   - Minus icon (SPECIFICALLY: horizontal bar 12x2px, NOT a minus sign character)
   - First confirmation dialog:
     - Title: "Confirm REMOVING player, {first_name} {last_name}"
     - Buttons: "Confirm Remove" (primary) / "Cancel" (secondary)
   - Second confirmation dialog:
     - Title: "Are you sure you want to REMOVE {first_name} {last_name} from team: {team_name}"
     - Buttons: "Yes" (danger/red) / "No" (secondary)
   - On Yes: Removes from team_members table
   - Creates notification with exact format: `{first_name} has been removed from {team_name}`

## Technical Implementation

### CRITICAL: No Local Styles in Page Files

**All styling MUST be encapsulated in components. The page files in /app should contain NO local styles, only component composition and business logic.**

### Existing Components to Use (NO MODIFICATIONS NEEDED)

```typescript
// These work as-is, no changes required:
-ShScreenContainer - // Screen layout wrapper
  ShSearchBar - // Already has 500ms debounce built-in
  ShConfirmDialog - // Double confirmation popups
  ShText - // All text elements
  ShButton - // Action buttons
  ShIcon - // Icons (remove icon as simple bars)
  ShAvatar - // Member profile photos
  ShSpacer - // Spacing between elements
  ShEmptyState; // When no members to show
```

### New Components to Create

```typescript
// 1. ShAddMembersCard.tsx - Yellow alert card for interest count
interface ShAddMembersCardProps {
  count: number;
  onPress: () => void;
}
// ALL STYLES INSIDE COMPONENT:
// - Height: spacing.addMembersCardHeight (88)
// - Background: colorPalette.paymentDueDateBannerBg
// - Border: colorPalette.paymentDueDateBannerBorder
// - Icon size: spacing.alertIconContainerSize (40)
// - Border radius: spacing.borderRadiusLarge (12)
// - Padding: spacing.cardPadding (16)
// NO STYLE PROPS - all styling handled internally

// 2. ShMemberCard.tsx - Versatile card for all admin screens
interface ShMemberCardProps {
  avatar?: string;
  name: string;
  subtitle?: string;
  onRemove?: () => void;
  showRemoveIcon?: boolean;
  isProcessing?: boolean;
}
// ALL STYLES INSIDE COMPONENT:
// - Height: spacing.memberCardHeight (80) - ADD TO CONFIG
// - Background: colorPalette.backgroundListItem
// - Border: colorPalette.borderInputField
// - Border radius: spacing.borderRadiusLarge (12)
// - Padding: spacing.cardPadding (16)
// - Avatar size: spacing.avatarSizeMedium (40)
// - Remove icon width: spacing.removeIconWidth (12)
// - Remove icon height: spacing.removeIconHeight (2)
// - Text primary: colorPalette.lightText
// - Text secondary: colorPalette.stoneGrey
// NO STYLE PROPS - all styling handled internally

// 3. ShAdminGrid.tsx - 6-icon navigation grid (3 rows x 2 columns)
interface ShAdminGridProps {
  onMembersPress: () => void; // Icon: users or people icon
  onAdminsPress: () => void; // Icon: shield or admin badge
  // Future disabled icons (show but grayed out):
  // onEventsPress - calendar icon - disabled
  // onPaymentsPress - credit card icon - disabled
  // onAlertsPress - bell icon - disabled
  // onSettingsPress - gear icon - disabled
}
// DEVELOPER NOTE: Show all 6 icons but only Members/Admins are tappable
// ALL STYLES INSIDE COMPONENT:
// - Card width: spacing.adminButtonWidth (165)
// - Card height: spacing.adminButtonHeight (120)
// - Border radius: spacing.adminButtonBorderRadius (12)
// - Icon size: spacing.adminButtonIconSize (36)
// - Grid gap: spacing.gridGap (16)
// - Background: colorPalette.backgroundListItem
// - Border: colorPalette.borderAdminButton
// NO STYLE PROPS - all styling handled internally
```

### Config Values to Add

```typescript
// Add to spacing.ts:
memberCardHeight: 80; // Height of member cards in admin screens
```

### NO MODIFIED COMPONENTS

- ShSearchBar works perfectly as-is with 500ms debounce
- ShConfirmDialog handles double confirmation without changes
- All existing components are used without modification

### API Endpoints

#### ✅ EXISTING Endpoints (Ready to Use)

```typescript
// From /lib/api/teams.ts
teamsApi.getTeamMembers(teamId: string)        // Lines 384-410
teamsApi.removeTeamMember(teamId: string, memberId: string)  // Lines 412-431
```

#### ❌ NEW Endpoints to Implement

```typescript
// 1. Search team members
teamsApi.searchTeamMembers(teamId: string, query: string)
// Implementation pattern:
// - Use ILIKE for case-insensitive search
// - Search across first_name, last_name, email
// - Return same structure as getTeamMembers
// - ShSearchBar handles 500ms debounce automatically

// 2. Get pending interest count for "Add members" card
teamsApi.getPendingInterestCount(teamId: string)
// Implementation:
// - Query interest_expressions table
// - Filter: team_id = teamId AND interest_status = 'pending'
// - Return count as number
```

### Database & RLS Requirements

#### Required RLS Policies for `interest_expressions` table

```sql
-- Policy: Team admins can VIEW pending interests for their teams
CREATE POLICY "Team admins can view pending interests" ON interest_expressions
FOR SELECT USING (
  interest_status = 'pending' AND
  EXISTS (
    SELECT 1 FROM team_admins
    WHERE team_admins.team_id = interest_expressions.team_id
    AND team_admins.user_id = auth.uid()
  )
);
```

#### Existing Supabase Functions (Ready to Use)

```sql
-- Already exists in database:
is_super_admin(team_uuid, user_uuid)  -- Checks if user is Super Admin
user_is_club_admin_for_team(team_uuid)  -- Verifies admin permissions
```

#### Implementation Notes

- All endpoints must verify admin status before operations
- Use existing error handling patterns from teamsApi
- Member removal triggers notification insertion
- Search implementation should follow pattern from lines 384-410

## Logging Requirements

### Import Logger

```typescript
import { logger } from '@lib/utils/logger';
```

### Required Logging Points

#### Page Level Logging

```typescript
// Screen mount/unmount
logger.log('ADM-001: Manage Members screen mounted', {
  teamId,
  userId: currentUserId,
  isAdmin: true,
});

logger.log('ADM-001: Manage Members screen unmounted');
```

#### Navigation & Access

```typescript
// Team selection
logger.log('ADM-001: Team selected', { teamId, teamName });

// Non-admin redirect
logger.warn('ADM-001: Non-admin access attempt', { userId, teamId });

// Add members card tap
logger.log('ADM-001: Add members card tapped', {
  pendingCount,
  navigatingTo: 'ADM-002',
});
```

#### Search Operations

```typescript
// Search initiated
logger.log('ADM-001: Search initiated', {
  query,
  teamId,
  timestamp: new Date().toISOString(),
});

// Search results
logger.log('ADM-001: Search results', {
  query,
  resultCount: results.length,
  teamId,
});

// Search cleared
logger.log('ADM-001: Search cleared', { teamId });
```

#### Member Management

```typescript
// Remove initiated
logger.log('ADM-001: Remove member initiated', {
  memberId,
  memberName,
  teamId,
});

// First confirmation
logger.log('ADM-001: Remove first confirmation', {
  memberId,
  action: 'confirm' | 'cancel',
});

// Second confirmation
logger.log('ADM-001: Remove second confirmation', {
  memberId,
  action: 'yes' | 'no',
});

// Remove success
logger.log('ADM-001: Member removed successfully', {
  memberId,
  memberName,
  teamId,
  timestamp: new Date().toISOString(),
});

// Remove failure
logger.error('ADM-001: Member removal failed', {
  memberId,
  teamId,
  error: error.message,
  stack: error.stack,
});
```

#### Data Loading

```typescript
// Members fetch
logger.log('ADM-001: Fetching team members', { teamId });

logger.log('ADM-001: Team members loaded', {
  teamId,
  memberCount: members.length,
});

// Interest count fetch
logger.log('ADM-001: Fetching interest count', { teamId });

logger.log('ADM-001: Interest count loaded', {
  teamId,
  count: pendingCount,
});

// API errors
logger.error('ADM-001: API error', {
  endpoint: 'getTeamMembers',
  teamId,
  error: error.message,
});
```

#### Component Interactions

```typescript
// ShMemberCard interactions
logger.debug('ADM-001: Member card interaction', {
  memberId,
  action: 'remove_icon_tapped',
});

// ShSearchBar debounce
logger.debug('ADM-001: Search debounced', {
  query,
  debounceMs: 500,
});
```

### Debug Mode Helpers

```typescript
// For testing search debounce
if (__DEV__) {
  logger.debug('ADM-001: Search input changed', {
    value,
    timestamp: Date.now(),
  });

  logger.debug('ADM-001: Debounced search triggered', {
    value,
    timestamp: Date.now(),
    deltaMs: Date.now() - lastInputTime,
  });
}
```

## Testing Requirements

1. Verify exact Figma styling matches implementation
2. Test app default 500ms search debounce timing
3. Verify member card height is exactly 80px
4. Test remove icon is 12x2px horizontal bar
5. Confirm colors match Figma hex values
6. Test with 0, 1, 10+ pending interests
7. Verify double confirmation flow

## Manual Test Plan for QA

### Prerequisites

- Tester must have Team Admin role for at least one team
- Test team should have 5+ existing members
- Create test users who have expressed interest in joining

### Test Scenarios

#### 1. Navigation & Access Control

- [ ] Navigate: Home → Teams (footer) → Select single team → Admins (top tab) → Members icon
- [ ] Verify non-admin users cannot access screen (redirected to Home)
- [ ] Verify screen shows no content until single team selected
- [ ] Verify no back arrow (part of Teams tab flow)

#### 2. Add Members Card

- [ ] Verify card always visible at top
- [ ] Shows correct count of pending interest_expressions
- [ ] Test with 0 interested: shows "0 interested", tap does nothing
- [ ] Test with 3 interested: shows "3 interested", tap navigates to ADM-002
- [ ] Verify yellow alert icon with translucent background

#### 3. Search Functionality

- [ ] Type "joh" - wait 500ms - verify search triggers automatically
- [ ] Type quickly "john smith" - verify only ONE search after 500ms
- [ ] Search by first name: "John" - verify correct results
- [ ] Search by last name: "Smith" - verify correct results
- [ ] Search by email: "john@" - verify correct results
- [ ] Clear search - verify "All" members shown again

#### 4. Member List Display

- [ ] Verify all team members shown by default
- [ ] Check dropdown shows "All" when no search
- [ ] Check dropdown shows "Search" during active search
- [ ] Verify member cards show: avatar (48x48), name, role/title
- [ ] Test scroll with 10+ members
- [ ] Verify 12px gap between cards

#### 5. Remove Member Flow

- [ ] Tap remove icon (horizontal bar 12x2px)
- [ ] First popup: "Confirm REMOVING player, John Smith"
- [ ] Tap Cancel - verify nothing happens
- [ ] Tap remove again, then "Confirm Remove"
- [ ] Second popup: "Are you sure you want to REMOVE John Smith from team: Team Name"
- [ ] Tap No - verify nothing happens
- [ ] Complete full removal (Confirm Remove → Yes)
- [ ] Verify member disappears from list immediately
- [ ] Check notifications table for removal notification

#### 6. Visual Validation

- [ ] Background: #161615 (Base Dark)
- [ ] Card background: rgba(0,0,0,0.3)
- [ ] Card border: rgba(158,155,151,0.2)
- [ ] Text primary: #eceae8
- [ ] Text secondary: #9e9b97
- [ ] Remove icon: #eabd22 (Primary Gold)
- [ ] Card height exactly 80px
- [ ] Alert container 40x40px with 12px radius

#### 7. Edge Cases

- [ ] Test with team having 0 members
- [ ] Test with team having 50+ members (performance)
- [ ] Test rapid clicking of remove (should not double-trigger)
- [ ] Test search for non-existent member
- [ ] Switch teams mid-search - verify search clears
- [ ] Test with very long member names (text truncation)

#### 8. Data Integrity

- [ ] Verify removed member cannot access team content
- [ ] Verify removed member appears in notifications table
- [ ] Confirm member fully removed from team_members table
- [ ] Check member can re-join team later if invited

## Notes

- This screen does NOT have a back navigation - it's part of Teams tab flow
- The minus icon is a simple horizontal bar, not a complex icon
- Alert icon container has translucent yellow background
- All cards use consistent rgba(0,0,0,0.3) background
