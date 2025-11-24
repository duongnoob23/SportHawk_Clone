# ADM-000: Team Administration Management Epic

## Epic Summary

Allow Team Admin to manage the members of a team, including searching, adding, removing, and dealing with those who have expressed interest; plus appointing other Team Admins.

## Source Design Document

`/docs/design-team-admins.md` - SportHawk Team Admins Journey - Sep 2025

## Figma References

- **Admin Grid**: [Node 559-2966](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2966)
- **Manage Members**: [Node 559-2682](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2682)
- **Add Members**: [Node 559-2661](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2661)
- **Manage Admins**: [Node 559-2613](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2613)

## Business Value

- Enable Team Admins to self-manage team membership without developer intervention
- Process interest expressions from users who want to join the team
- Control admin hierarchy with Super Admin role for critical operations
- Improve team governance through clear admin controls

## User Stories

1. **ADM-001**: Manage Members - View, search, and remove team members; navigate to Add Members
2. **ADM-002**: Add Members - Accept or ignore interest expressions from users wanting to join
3. **ADM-003**: Manage Admins - Appoint team admins and remove them (Super Admin only)

## Navigation Flow

```
Home
  └── Teams (footer icon)
      └── Admins (top tab - rightmost)
          └── 6-icon grid (3 rows x 2 columns):
              ├── Events (future)
              ├── Payments (future)
              ├── Members → ADM-001 Manage Members
              │   └── "Add members" card → ADM-002 Add Members
              ├── Alerts (future)
              ├── Settings (future)
              └── Admins → ADM-003 Manage Admins
```

## Core Requirements from Design

### Global Requirements

- **Team Selection**: A SINGLE team must be selected to see any screen content
- **Search Debounce**: Uses app default 500ms debounce for ALL search functionality
- **Double Confirmation**: ALL destructive actions require two-step confirmation
- **Notifications**: ALL member/admin changes trigger notifications via notifications table

### ADM-001: Manage Members

- Shows "Add members" card with count of pending interest_expressions
- Card shows "0 interested" if none, still displayed but non-functional when 0
- Search members with app default 500ms debounce
- "Team Members" dropdown shows "All" or "Search" based on active search
- Remove member with "-" icon requires double confirmation
- Removed members deleted from team_members table

### ADM-002: Add Members

- Shows "Interested Players" who have registered interest
- Lists interest_expressions with interest_status = "pending"
- Ordered by expressed_at (oldest first)
- Accept: Adds to team_members, updates interest_status to "accepted"
- Ignore: Updates interest_status to "ignored"
- Both actions require confirmation popup and send notifications

### ADM-003: Manage Admins

- "Team Admins" section shows all admins for selected team
- Remove icon ONLY shown if current user is Super Admin
- Cannot remove self (even as Super Admin)
- "Search Members" section shows team members not already admins
- Plus icon to promote member to admin with confirmation
- Admin changes update team_admins table

## Technical Requirements

### Database Tables (VERIFIED via MCP)

```sql
-- ✅ CONFIRMED: All tables exist with correct structure
team_members        -- Team membership
team_admins         -- Admin roles
  -- ✅ CONFIRMED: has is_primary boolean for Super Admin
  -- Default role: 'Manager'
interest_expressions -- Users who registered interest
  -- ✅ CONFIRMED: has interest_status field (default: 'pending')
  -- Currently only 'pending' exists in data
  -- Developer must add: 'accepted', 'ignored', 'invited' values
notifications       -- Member/admin change notifications
  -- ✅ CONFIRMED columns: id, user_id, notification_type, title, message,
  -- data (jsonb), is_read, created_at
  -- NOTE: Use 'notification_type' not 'type'
  -- NOTE: Has both 'title' and 'message' fields
users              -- User profiles with first_name, last_name, email, avatar_url
```

### Permission Matrix

| Action                       | Regular Member | Team Admin | Super Admin |
| ---------------------------- | -------------- | ---------- | ----------- |
| Access Admin Tab             | ✗              | ✓          | ✓           |
| View/Search Members          | ✗              | ✓          | ✓           |
| Remove Members               | ✗              | ✓          | ✓           |
| Process Interest Expressions | ✗              | ✓          | ✓           |
| View Admins                  | ✗              | ✓          | ✓           |
| Promote to Admin             | ✗              | ✓          | ✓           |
| Remove Admins                | ✗              | ✗          | ✓           |

### Configuration Requirements

#### app-values.ts

```typescript
searchDebounceMs: 500; // Default search debounce for the app (used by Team Admin)
```

#### spacing.ts

```typescript
removeIconWidth: 12; // Horizontal bar width for remove icon
removeIconHeight: 2; // Horizontal bar height for remove icon
addMembersCardHeight: 88; // "Add members" card specific height
alertIconContainerSize: 40; // Alert icon background container
```

#### colors.ts (existing values)

```typescript
colorPalette.baseDark: '#161615'
colorPalette.lightText: '#eceae8'
colorPalette.stoneGrey: '#9e9b97'
colorPalette.primaryGold: '#eabd22'
colorPalette.backgroundListItem: 'rgba(0,0,0,0.3)'
colorPalette.borderInputField: 'rgba(158,155,151,0.2)'
```

## Component Architecture

### Existing Components (NO MODIFICATIONS NEEDED)

```typescript
-ShScreenContainer - // Screen layout wrapper
  ShSearchBar - // Already has 500ms debounce built-in
  ShConfirmDialog - // Double confirmation popups
  ShText - // All text elements
  ShButton - // Action buttons
  ShIcon - // Icons (simple bars, not complex SVGs)
  ShAvatar - // Profile photos
  ShSpacer - // Spacing between elements
  ShEmptyState; // Empty states
```

### New Components to Create

```typescript
// 1. ShAddMembersCard - Yellow alert card
interface ShAddMembersCardProps {
  count: number;
  onPress: () => void;
}

// 2. ShMemberCard - Versatile card for all admin screens
interface ShMemberCardProps {
  avatar?: string;
  name: string;
  subtitle?: string;
  onRemove?: () => void;
  showRemoveIcon?: boolean;
  onAccept?: () => void;
  onIgnore?: () => void;
  showAcceptIgnoreButtons?: boolean;
  onAdd?: () => void;
  showAddIcon?: boolean;
  isProcessing?: boolean;
}

// 3. ShAdminGrid - 6-icon navigation grid
interface ShAdminGridProps {
  onMembersPress: () => void;
  onAdminsPress: () => void;
  // Future: onEventsPress, onPaymentsPress, etc.
}
```

### Config Values Required

```typescript
// MUST ADD to spacing.ts:
memberCardHeight: 80; // Height of member cards
memberCardButtonGap: 12; // Gap between Accept/Ignore buttons

// Already exist in configs - USE THESE, NO MAGIC NUMBERS:
// From spacing.ts:
addMembersCardHeight: 88;
removeIconWidth: 12;
removeIconHeight: 2;
interestCardButtonWidth: 145;
alertIconContainerSize: 40;
adminButtonWidth: 165;
adminButtonHeight: 120;
adminButtonBorderRadius: 12;
adminButtonIconSize: 36;
adminButtonIconTop: 28;
adminButtonTextTop: 72;
gridGap: 16;
borderRadiusLarge: 12;
cardPadding: 16;
avatarSizeMedium: 40;

// From colors.ts:
baseDark: '#161615';
lightText: '#eceae8';
stoneGrey: '#9e9b97';
primaryGold: '#eabd22';
backgroundListItem: 'rgba(0,0,0,0.3)';
borderInputField: 'rgba(158,155,151,0.2)';
borderAdminButton: 'rgba(158,155,151,0.4)';
paymentDueDateBannerBg: 'rgba(234,189,34,0.1)';
paymentDueDateBannerBorder: 'rgba(234,189,34,0.2)';

// From app-values.ts:
searchDebounceMs: 500;
```

## API Endpoints Required

### ✅ EXISTING Endpoints (from /lib/api/teams.ts)

```typescript
// Member management
teamsApi.getTeamMembers(teamId); // Lines 384-410
teamsApi.removeTeamMember(teamId, memberId); // Lines 412-431

// Admin management
teamsApi.getTeamAdmins(teamId); // Lines 433-459
teamsApi.addTeamAdmin(teamId, userId, role); // Lines 461-481
teamsApi.removeTeamAdmin(teamId, userId); // Lines 483-503

// Interest expressions (partial)
teamsApi.expressInterestInTeam(teamId); // Lines 505-533
```

### ❌ NEW Endpoints to Implement

```typescript
// Member search
teamsApi.searchTeamMembers(teamId, query)
teamsApi.searchNonMembers(teamId, query)
teamsApi.searchNonAdminMembers(teamId, query)

// Interest expressions management
teamsApi.getPendingInterestCount(teamId)
teamsApi.getInterestExpressions(teamId)
teamsApi.acceptInterestExpression(teamId, userId)
teamsApi.ignoreInterestExpression(teamId, userId)
teamsApi.invitePlayer(teamId, userId)

// Admin verification
teamsApi.checkSuperAdmin(teamId, userId)
teamsApi.promoteToAdmin(teamId, userId, role?)
```

## Database & RLS Requirements

### Required RLS Policy Updates for `interest_expressions` Table

```sql
-- Allow admins to view pending interests
CREATE POLICY "Team admins can view pending interests" ON interest_expressions
FOR SELECT USING (
  interest_status = 'pending' AND
  EXISTS (
    SELECT 1 FROM team_admins
    WHERE team_admins.team_id = interest_expressions.team_id
    AND team_admins.user_id = auth.uid()
  )
);

-- Allow admins to update interest status
CREATE POLICY "Team admins can update interest status" ON interest_expressions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM team_admins
    WHERE team_admins.team_id = interest_expressions.team_id
    AND team_admins.user_id = auth.uid()
  )
);

-- Allow admins to create invitations
CREATE POLICY "Team admins can create invitations" ON interest_expressions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_admins
    WHERE team_admins.team_id = interest_expressions.team_id
    AND team_admins.user_id = auth.uid()
  )
);
```

### Existing Database Functions (✅ VERIFIED to Exist)

```sql
-- Both functions CONFIRMED in database via MCP:
is_super_admin(team_uuid uuid, user_uuid uuid) RETURNS boolean
user_is_club_admin_for_team(team_uuid uuid) RETURNS boolean
```

### ✅ Existing Components (CONFIRMED)

```typescript
// ShEmptyState component EXISTS at /components/ShEmptyState/ShEmptyState.tsx
// Can be used for all empty states in admin screens
```

## Acceptance Criteria

- [ ] All three screens accessible via Teams > Admins tab > 6-icon grid
- [ ] Single team selection required to see content
- [ ] App default 500ms search debounce working on all search fields
- [ ] Double confirmation on all destructive actions
- [ ] Interest expressions show count on "Add members" card
- [ ] Accept/Ignore properly updates interest_status
- [ ] Super Admin permissions enforced for admin removal
- [ ] All actions trigger notifications
- [ ] Remove icons are simple 12x2px horizontal bars
- [ ] All styling matches Figma specifications exactly
- [ ] No magic values - all from config files

## Implementation Notes

- Non-admin users redirected to Home if they try to access admin screens
- "Add members" card always visible even with 0 interested
- Search results de-duplicated in Manage Admins
- Cannot remove self as admin even if Super Admin
- All notifications inserted into notifications table
- Interest expressions ordered by expressed_at (oldest first)

## Error Handling Requirements

### API Error Responses

```typescript
// Expected error cases to handle:
- 401: Unauthorized - redirect to login
- 403: Forbidden - show "You don't have permission" toast
- 404: Team not found - redirect to teams list
- 409: Conflict - "User is already a team member" / "User is already an admin"
- 500: Server error - show "Something went wrong. Please try again."

// Display errors using existing toast/alert system
// Log all errors with logger.error() including full context
```

### Race Condition Prevention

```typescript
// Prevent double-clicks on all action buttons:
- Set isProcessing state immediately on click
- Disable button while isProcessing
- Show loading spinner in button
- Only re-enable after API response (success or failure)
```

## Out of Scope

- Events, Payments, Alerts, Settings icons (marked as "future")
- Bulk operations
- Email notifications (only in-app via notifications table)
- Custom admin roles (only role string stored)
