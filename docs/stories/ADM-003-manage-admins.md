# ADM-003: Team Admin - Manage Admins Screen (Figma: 559-2613)

## Parent Epic

**ADM-000**: Team Administration Management - Allow Team Admins to manage team members, handle join requests, and appoint other admins

## Story Description

As a Team Admin, I want to manage other team administrators by viewing current admins, removing admins (if I'm a Super Admin), and promoting team members to admin roles.

**Figma Reference**: Node 559-2613
**File Location**: `/app/teams/[id]/admin/manage-admins.tsx`
**Route**: `/teams/{teamId}/admin/manage-admins`
**Parent Screen**: Admin Grid (accessed via "Admins" icon)

## Visual Design Specifications

### Screen Layout

- **Background**: `#161615` (Base Dark)
- **Navigation**: Back arrow with "Admins" title
- **Content padding**: `24px` horizontal, `21px` vertical
- **Section gap**: `24px` between sections
- **Identical structure to Add Members screen**

### Component Specifications

#### Navigation Header

```
Height: 112px
Border bottom: 1px solid rgba(158,155,151,0.2)
Back arrow: 17.5x15px at left: 35px
Title: "Admins" - Inter Regular 16px #eceae8, centered
```

#### Team Admins Section

```
Header: "Team Admins" - Inter Medium 20px #eceae8, tracking -0.04px

Admin cards:
- Identical styling to member cards
- Height: 80px
- Background: rgba(0,0,0,0.3)
- Border: 1px solid rgba(158,155,151,0.2)
- Border radius: 12px
- Padding: 16px

Remove icon (Super Admin only):
- Horizontal bar: 12x2px
- Color: #eabd22
- Position: right: 32px, vertical center
- Only visible if current user is Super Admin
```

#### Search Members Section

```
Header: "Search Members" - Inter Medium 20px #eceae8

Search bar:
- Identical to other screens
- Height: 50px
- Background: rgba(0,0,0,0.3)
- Placeholder: "Search..."

Helper text:
- Font: Inter Regular 12px #9e9b97
- Text: "By adding a member to Team Admins, you are allowing them to manage events, payments, members and alerts."
- Position: 12px below search bar
```

#### Search Result Cards (Non-Admin Members)

```
Same styling as ADM-001 member cards
Height: 80px

Plus icon for promotion:
- Two bars forming plus: 12x2px each
- Color: #eabd22
- Position: right: 32px
- Vertical bar rotated 90°
```

## Acceptance Criteria

1. **Screen Navigation**
   - Accessed via Teams > Admins tab > Admins icon
   - Back arrow returns to Teams/Admins grid
   - Only accessible to users with admin role
   - Title "Admins" centered

2. **Team Admins Display**
   - Shows all current team admins
   - Same card styling as member cards
   - Shows name and role/title
   - Lists in order: Primary admins first, then by created_at

3. **Admin Removal (Super Admin Only)**
   - Remove icon ONLY visible for Super Admin users
   - Remove icon NOT shown for current user (can't remove self)
   - First confirmation: "Confirm REMOVING Team Admin, {name} from Team {team_name}"
   - Second confirmation: "Are you sure you want to REMOVE {name} from team: {team_name}"
   - On confirm: Remove from team_admins, send notification

4. **Search Members for Promotion**
   - Shows team members who are NOT admins
   - Uses app default 500ms debounce on search
   - Searches first_name, last_name, email
   - Helper text explains admin permissions

5. **Promote to Admin**
   - Plus icon on non-admin member cards
   - Confirmation: "Confirm TEAM ADMIN role for {name} to team: {team_name}"
   - Buttons: "Confirm Team Admin" / "Cancel"
   - On confirm: Add to team_admins, send notification
   - Card moves from search results to Team Admins section

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
  ShIcon - // Remove/Plus icons (simple bars)
  ShAvatar - // Admin/Member profile photos
  ShSpacer - // Spacing between elements
  ShEmptyState; // When no search results
```

### Components to Reuse from ADM-001

```typescript
// ShMemberCard.tsx - Same component from ADM-001, different config
interface ShMemberCardProps {
  avatar?: string;
  name: string;
  subtitle?: string; // Shows "Super Admin" for is_primary=true, "Admin" for others

  // For admins section:
  onRemove?: () => void;
  showRemoveIcon?: boolean; // Only true if currentUser is Super Admin AND target is not self

  // For search results:
  onAdd?: () => void;
  showAddIcon?: boolean;

  isProcessing?: boolean;
}

// DEVELOPER NOTES:
// 1. Empty states: If no admins (impossible), show error and redirect
// 2. Empty search: Show ShEmptyState "No members found"
// 3. If all members are admins: Show "All team members are already admins"

// ALL STYLES INSIDE COMPONENT - Team Admins config:
// - Height: spacing.memberCardHeight (80)
// - Subtitle shows role (e.g., "Admin" or "Super Admin")
// - Remove icon ONLY if current user is Super Admin
// - Cannot remove self (even as Super Admin)
// - Remove icon: spacing.removeIconWidth x removeIconHeight (12x2px)
// - Background: colorPalette.backgroundListItem
// - Border: colorPalette.borderInputField
// - Text primary: colorPalette.lightText
// - Text secondary: colorPalette.stoneGrey
// NO STYLE PROPS - all styling handled internally

// ALL STYLES INSIDE COMPONENT - Search Members config:
// - Height: spacing.memberCardHeight (80)
// - Subtitle shows position
// - Plus icon for promotion (12x2px bars, one rotated 90°)
// - Plus icon color: colorPalette.primaryGold
// - Icon width: spacing.removeIconWidth (12)
// - Icon height: spacing.removeIconHeight (2)
// - Background: colorPalette.backgroundListItem
// - Border: colorPalette.borderInputField
// NO STYLE PROPS - all styling handled internally
```

### NO NEW COMPONENTS NEEDED

- Reuses ShMemberCard from ADM-001
- Reuses ShAdminGrid from ADM-001

### NO MODIFIED COMPONENTS

- ShSearchBar works perfectly as-is with 500ms debounce
- All existing components are used without modification

### NO ADDITIONAL CONFIG VALUES NEEDED

- All config values already defined in ADM-001 and ADM-002

### API Endpoints

#### ✅ EXISTING Endpoints (Ready to Use)

```typescript
// From /lib/api/teams.ts
teamsApi.getTeamAdmins(teamId: string)         // Lines 433-459
teamsApi.addTeamAdmin(teamId, userId, role)    // Lines 461-481
teamsApi.removeTeamAdmin(teamId, userId)       // Lines 483-503
```

#### ❌ NEW Endpoints to Implement

```typescript
// 1. Check if user is Super Admin
teamsApi.checkSuperAdmin(teamId: string, userId: string)
// Implementation:
// - Query team_admins table
// - Filter: team_id = teamId AND user_id = userId
// - Return: boolean based on is_primary field
// - Can also use existing DB function: is_super_admin(team_uuid, user_uuid)

// 2. Search team members who are NOT admins
teamsApi.searchNonAdminMembers(teamId: string, query: string)
// Implementation:
// - Query team_members with user joins
// - EXCLUDE users who exist in team_admins for this team
// - Search with ILIKE on first_name, last_name, email
// - ShSearchBar handles 500ms debounce automatically

// 3. Promote member to admin (wrapper around addTeamAdmin)
teamsApi.promoteToAdmin(teamId: string, userId: string, role?: string)
// Implementation:
// - Verify user is team member first
// - Call existing addTeamAdmin
// - INSERT notification for new admin
// - Default role to 'Admin' if not specified
```

### Database & RLS Requirements

#### Existing Database Functions (Ready to Use)

```sql
-- Already in database:
is_super_admin(team_uuid uuid, user_uuid uuid) RETURNS boolean
-- Returns true if user has is_primary = true in team_admins

user_is_club_admin_for_team(team_uuid uuid) RETURNS boolean
-- Checks if auth.uid() is admin for the team
```

#### Required Authorization Checks

```typescript
// Super Admin operations (remove other admins):
const canRemoveAdmin = async (teamId: string, targetAdminId: string) => {
  // 1. Current user must be Super Admin (is_primary = true)
  // 2. Cannot remove self (even as Super Admin)
  // 3. Use is_super_admin() database function

  const isSuperAdmin = await supabase.rpc('is_super_admin', {
    team_uuid: teamId,
    user_uuid: auth.uid(),
  });

  return isSuperAdmin && targetAdminId !== auth.uid();
};

// Regular Admin operations (promote members):
const canPromoteMember = async (teamId: string) => {
  // Any admin can promote members
  return await supabase.rpc('user_is_club_admin_for_team', {
    team_uuid: teamId,
  });
};
```

#### Notification Creation for Admin Changes

```typescript
// Admin removal notification
await supabase.from('notifications').insert({
  user_id: removedAdminId,
  type: 'admin_change',
  message: `You have been removed as admin from ${teamName}`,
  metadata: { team_id: teamId, action: 'removed' },
});

// Admin promotion notification
await supabase.from('notifications').insert({
  user_id: newAdminId,
  type: 'admin_change',
  message: `You have been promoted to admin for ${teamName}`,
  metadata: { team_id: teamId, action: 'promoted' },
});
```

#### Implementation Notes

- Use existing RLS policies on team_admins table
- Super Admin check is critical for remove operations
- Self-removal protection must be enforced at API level
- All admin changes require notification creation
- Consider logging admin changes for audit trail

### State Management

```typescript
interface ManageAdminsState {
  admins: TeamAdmin[];
  isSuperAdmin: boolean;
  currentUserId: string;
  searchQuery: string;
  searchResults: TeamMember[];
  isSearching: boolean;
  processingId: string | null;
}
```

### Permission Logic

```typescript
const canRemoveAdmin = (admin: TeamAdmin): boolean => {
  return isSuperAdmin && admin.userId !== currentUserId && !admin.isPrimary; // Can't remove primary admin
};
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
logger.log('ADM-003: Manage Admins screen mounted', {
  teamId,
  userId: currentUserId,
  isSuperAdmin,
});

logger.log('ADM-003: Manage Admins screen unmounted');
```

#### Navigation & Access

```typescript
// Back navigation
logger.log('ADM-003: Back navigation', {
  returningTo: 'Admin Grid',
});

// Non-admin redirect
logger.warn('ADM-003: Non-admin access attempt', {
  userId,
  teamId,
});

// Super Admin check
logger.log('ADM-003: Super Admin status checked', {
  userId,
  teamId,
  isSuperAdmin: result,
});
```

#### Admin Management

```typescript
// Remove initiated (Super Admin only)
logger.log('ADM-003: Admin removal initiated', {
  targetAdminId,
  targetAdminName,
  teamId,
  initiatedBy: currentUserId,
  isSuperAdmin: true,
});

// First confirmation
logger.log('ADM-003: Admin removal first confirmation', {
  targetAdminId,
  action: 'confirm' | 'cancel',
});

// Second confirmation
logger.log('ADM-003: Admin removal second confirmation', {
  targetAdminId,
  action: 'yes' | 'no',
});

// Remove success
logger.log('ADM-003: Admin removed successfully', {
  targetAdminId,
  targetAdminName,
  teamId,
  removedBy: currentUserId,
  timestamp: new Date().toISOString(),
});

// Remove failure
logger.error('ADM-003: Admin removal failed', {
  targetAdminId,
  teamId,
  error: error.message,
  stack: error.stack,
});

// Self-removal attempt blocked
logger.warn('ADM-003: Self-removal attempt blocked', {
  userId: currentUserId,
  teamId,
});
```

#### Search Operations

```typescript
// Search initiated
logger.log('ADM-003: Non-admin member search initiated', {
  query,
  teamId,
  searchType: 'non_admin_members',
});

// Search results
logger.log('ADM-003: Non-admin member search results', {
  query,
  resultCount: results.length,
  teamId,
  excludedAdminCount: totalMembers - results.length,
});

// Search cleared
logger.log('ADM-003: Search cleared', { teamId });
```

#### Admin Promotion

```typescript
// Promotion initiated
logger.log('ADM-003: Admin promotion initiated', {
  userId,
  userName,
  teamId,
  promotedBy: currentUserId,
});

// Promotion confirmation
logger.log('ADM-003: Admin promotion confirmation', {
  userId,
  action: 'confirm' | 'cancel',
});

// Promotion success
logger.log('ADM-003: Member promoted to admin', {
  userId,
  userName,
  teamId,
  role: assignedRole || 'Admin',
  promotedBy: currentUserId,
  timestamp: new Date().toISOString(),
});

// Promotion failure
logger.error('ADM-003: Admin promotion failed', {
  userId,
  teamId,
  error: error.message,
});

// Duplicate admin attempt
logger.warn('ADM-003: User already admin', {
  userId,
  teamId,
});
```

#### Data Loading

```typescript
// Admins fetch
logger.log('ADM-003: Fetching team admins', { teamId });

logger.log('ADM-003: Team admins loaded', {
  teamId,
  adminCount: admins.length,
  superAdminCount: admins.filter(a => a.isPrimary).length,
});

// Non-admin members fetch
logger.log('ADM-003: Fetching non-admin members', {
  teamId,
  query,
});

logger.log('ADM-003: Non-admin members loaded', {
  teamId,
  memberCount: members.length,
});

// API errors
logger.error('ADM-003: API error', {
  endpoint: 'getTeamAdmins',
  teamId,
  error: error.message,
});
```

#### Component Interactions

```typescript
// ShMemberCard interactions
logger.debug('ADM-003: Admin card interaction', {
  adminId,
  action: 'remove_icon_tapped',
  canRemove: canRemoveAdmin(admin),
});

// Plus icon tap
logger.debug('ADM-003: Promote icon tapped', {
  userId,
  fromSearch: true,
});

// Search debounce
logger.debug('ADM-003: Search debounced', {
  query,
  debounceMs: 500,
});
```

### Debug Mode Helpers

```typescript
// For testing permissions
if (__DEV__) {
  logger.debug('ADM-003: Permission check', {
    userId: currentUserId,
    isSuperAdmin,
    targetAdminId,
    canRemove: canRemoveAdmin(targetAdmin),
    reason: !isSuperAdmin
      ? 'not_super_admin'
      : targetAdminId === currentUserId
        ? 'self_removal'
        : 'allowed',
  });

  // Track notification creation
  logger.debug('ADM-003: Notification created', {
    userId,
    notificationType: 'admin_promoted' | 'admin_removed',
    teamId,
  });

  // Database function calls
  logger.debug('ADM-003: Database function called', {
    function: 'is_super_admin',
    params: { team_uuid: teamId, user_uuid: userId },
    result,
  });
}
```

### Performance Logging

```typescript
// Track operation times
const startTime = Date.now();

// After operation completes
logger.log('ADM-003: Operation performance', {
  operation: 'promoteToAdmin' | 'removeAdmin',
  durationMs: Date.now() - startTime,
  teamId,
});
```

### Security Logging

```typescript
// Log all admin changes for audit
logger.info('ADM-003: AUDIT - Admin change', {
  action: 'promote' | 'remove',
  targetUserId,
  teamId,
  performedBy: currentUserId,
  isSuperAdmin,
  timestamp: new Date().toISOString(),
  ip: userIpAddress, // if available
});
```

## Key UI Elements

### Visual Consistency

- Identical card styling across all three admin screens
- Same search bar implementation
- Consistent icon design (simple bars)
- Same section header typography

### Icon Specifications

- **Remove icon**: Single horizontal bar 12x2px
- **Add icon**: Two bars forming plus, each 12x2px
- **Color**: Always #eabd22 (Primary Gold)
- **Position**: Always right: 32px from card edge

### Helper Text

- Critical for user understanding
- Explains permissions granted when promoting
- Same styling as Add Members helper text

## Testing Requirements

1. Verify Super Admin detection and UI differences
2. Test cannot remove self (no icon shown)
3. Verify app default 500ms search debounce
4. Test promotion moves card between sections
5. Verify admin cards are exactly 80px height
6. Test with 0, 1, 5+ admins
7. Verify helper text displays correctly
8. Test permission denied for non-admins

## Manual Test Plan for QA

### Prerequisites

- Two test accounts: one Super Admin, one regular Admin
- Test team with 5+ members (mix of admins and non-admins)
- Access to team_admins table to verify is_primary field
- Access to notifications table

### Test Scenarios

#### 1. Navigation & Access

- [ ] Navigate: Teams → Admins tab → Admins icon
- [ ] Verify back arrow returns to Admin grid
- [ ] Title "Admins" centered
- [ ] Non-admin users redirected to Home
- [ ] Regular admins can access screen

#### 2. Team Admins Section Display

- [ ] "Team Admins" header shows
- [ ] All team admins listed
- [ ] Order: Primary admins first, then by created_at
- [ ] Each card shows: avatar, name, role ("Admin" or "Super Admin")
- [ ] Card height exactly 80px

#### 3. Super Admin Permissions

**Test as Super Admin:**

- [ ] Remove icon (12x2px horizontal bar) visible on OTHER admin cards
- [ ] Remove icon NOT shown on OWN card (can't remove self)
- [ ] Remove icon color: #eabd22

**Test as Regular Admin:**

- [ ] NO remove icons visible on any cards
- [ ] Can still view all admins
- [ ] Can still promote members

#### 4. Admin Removal Flow (Super Admin only)

- [ ] Tap remove icon on another admin
- [ ] First popup: "Confirm REMOVING Team Admin, John Smith from Team SportHawks"
- [ ] Tap Cancel - nothing happens
- [ ] Tap remove again → "Confirm Remove"
- [ ] Second popup: "Are you sure you want to REMOVE John Smith from team: SportHawks"
- [ ] Tap No - nothing happens
- [ ] Complete removal (Yes)
- [ ] Admin disappears from list immediately
- [ ] Check team_admins table - row deleted
- [ ] Check notifications table - removal notification sent

#### 5. Search Members Section

- [ ] "Search Members" header always visible
- [ ] Search bar below header
- [ ] Helper text (12px, #9e9b97): "By adding a member to Team Admins, you are allowing them to manage events, payments, members and alerts."
- [ ] Helper text 12px below search bar

#### 6. Search Functionality

- [ ] Shows ONLY team members who are NOT admins
- [ ] Type "sam" - wait 500ms - search triggers
- [ ] Search matches first_name, last_name, email
- [ ] Clear search - shows all non-admin members
- [ ] Each result card 80px height

#### 7. Promote to Admin Flow

- [ ] Plus icon (two 12x2px bars forming +) on member cards
- [ ] Plus icon at right: 32px position
- [ ] Tap plus icon
- [ ] Popup: "Confirm TEAM ADMIN role for Sarah Johnson to team: SportHawks"
- [ ] Buttons: "Confirm Team Admin" / "Cancel"
- [ ] Tap Cancel - nothing happens
- [ ] Tap plus again → "Confirm Team Admin"
- [ ] Card moves from search results to Team Admins section
- [ ] Check team_admins table - new row added
- [ ] Check notifications table - promotion notification sent

#### 8. Visual Validation

- [ ] Background: #161615
- [ ] Cards: rgba(0,0,0,0.3) background
- [ ] Card border: rgba(158,155,151,0.2)
- [ ] Text primary: #eceae8
- [ ] Text secondary: #9e9b97
- [ ] Icons: #eabd22
- [ ] All cards 80px height
- [ ] Icons are simple bars (not complex SVGs)

#### 9. Edge Cases

- [ ] Team with only 1 admin (Super Admin)
- [ ] Try to remove last Super Admin (should fail)
- [ ] Search for admin (shouldn't appear in results)
- [ ] Promote member who's already admin (handle gracefully)
- [ ] Very long admin names (text truncation)
- [ ] 10+ admins (scrolling)
- [ ] Rapid promotion clicks (no duplicates)

#### 10. Permission Matrix Verification

| Action           | Regular Member  | Team Admin    | Super Admin  |
| ---------------- | --------------- | ------------- | ------------ |
| View admins      | ❌ (redirected) | ✅            | ✅           |
| Promote to admin | ❌              | ✅            | ✅           |
| Remove admins    | ❌              | ❌ (no icons) | ✅           |
| Remove self      | N/A             | ❌            | ❌ (no icon) |

#### 11. Data Integrity

- [ ] Promoted users can access admin features
- [ ] Removed admins lose admin access immediately
- [ ] is_primary field preserved for Super Admins
- [ ] All changes reflected in team_admins table
- [ ] Notifications correctly formatted
- [ ] Audit trail maintained (if applicable)

## Security Considerations

- Server must validate Super Admin status
- Prevent self-removal at API level
- Log all admin changes for audit
- Validate team ownership

## Notes

- Screen structure mirrors Add Members exactly
- Icons are simple geometric shapes, not complex SVGs
- Helper text is mandatory for user understanding
- Super Admin UI differences are critical
