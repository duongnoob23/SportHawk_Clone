# ADM-003: Team Admin - Manage Admins Screen

## Parent Epic

**ADM-000**: Team Administration Management - Allow Team Admins to manage team members, handle join requests, and appoint other admins

## Story Description

As a Team Admin, I want to manage other team administrators by viewing current admins, removing admins (if I'm a Super Admin), and promoting team members to admin roles.

## Acceptance Criteria

1. **Navigation & Access Control**
   - The screen SHALL be accessible by tapping "Admins" icon in Admin tab grid (Teams > Admins tab > Admins icon)
   - The screen SHALL redirect non-admin users to Home screen
   - The screen SHALL have navigation bar with title "Admins" following Create-Event pattern
   - Only users with team admin role SHALL access this screen

2. **Team Admins Section**
   - The screen SHALL display "Team Admins" as section header
   - Each admin SHALL be displayed as a card showing:
     - Avatar/photo
     - Full name (first_name + last_name)
     - Admin role (e.g., "Coach", "Manager", "Admin")
     - Primary admin badge (if applicable)

3. **Admin Removal - Super Admin Only**
   - Remove button (minus icon) SHALL ONLY appear for Super Admin users
   - Non-Super Admins SHALL NOT see remove buttons
   - The current user SHALL NOT be able to remove themselves

4. **Admin Removal - First Confirmation**
   - Tapping minus icon SHALL show first confirmation dialog
   - Dialog message: "Confirm REMOVING Team Admin, {first_name} {last_name} from Team {team_name}"
   - Dialog buttons: "Confirm Remove" (warning), "Cancel" (secondary)

5. **Admin Removal - Second Confirmation**
   - Selecting "Confirm Remove" SHALL show second confirmation dialog
   - Dialog message: "Are you sure you want to REMOVE {first_name} {last_name} from team: {team_name}"
   - Dialog buttons: "Yes" (danger), "No" (secondary)

6. **Admin Removal - Action**
   - Selecting "Yes" SHALL:
     - Delete the admin's row from team_admins table
     - Send notification to removed admin via notifications table
   - The admin card SHALL be removed from list immediately
   - Success toast: "Admin removed successfully"

7. **Search Members for Admin Promotion**
   - Section header: "Search Members"
   - Search input SHALL trigger after 300ms debounce
   - Empty search SHALL show all team members (non-admins)
   - Search SHALL match against first_name, last_name, email
   - Results SHALL be de-duplicated (exclude existing admins)

8. **Member Display for Promotion**
   - Each member SHALL display as card with:
     - Avatar/photo
     - Full name
     - Position (if set)
     - Plus icon on the right for promotion

9. **Promote to Admin - Confirmation**
   - Tapping plus icon SHALL show confirmation dialog
   - Dialog message: "Confirm TEAM ADMIN role for {first_name} {last_name} to team: {team_name}"
   - Dialog buttons: "Confirm Team Admin" (primary), "Cancel" (secondary)

10. **Promote to Admin - Action**
    - Selecting "Confirm Team Admin" SHALL:
      - Insert row into team_admins table (if not already admin)
      - Send notification to new admin via notifications table
    - Member SHALL move from search results to Team Admins section
    - Success toast: "{member_name} is now a Team Admin"

## Technical Requirements

### Navigation & Routing

- Route: `/teams/admin/admins`
- Params: `teamId` (required)
- Permission check: User must be team admin
- Super Admin check: For removal features

### Components to Use

- **ShMemberListItem**: Base for admin/member display
- **ShSearchBar**: Modified for 300ms debounce
- **ShConfirmDialog**: For all confirmations
- **ShText, ShIcon, ShButton**: Standard components
- **ShScreenContainer**: Screen layout

### New Components Needed

- **ShAdminCard**: Extended member card with role display
  ```typescript
  interface ShAdminCardProps {
    admin: {
      id: string;
      name: string;
      photoUri?: string;
      role: string;
      isPrimary?: boolean;
    };
    showRemove?: boolean; // Only for Super Admins
    onRemove?: () => void;
    isRemoving?: boolean;
  }
  ```

### API Endpoints

```typescript
// teams.ts additions
async getTeamAdmins(teamId: string) {
  // Query team_admins with user profiles
  // Include role, is_primary fields
}

async removeTeamAdmin(teamId: string, adminUserId: string) {
  // Check if caller is Super Admin
  // Delete from team_admins
  // Create notification
}

async promoteToAdmin(teamId: string, userId: string, role: string = 'admin') {
  // Insert into team_admins
  // Create notification
  // Return success/duplicate status
}

async searchNonAdminMembers(teamId: string, searchText: string) {
  // Search team_members NOT in team_admins
  // 300ms debounce
}

async checkSuperAdmin(teamId: string, userId: string) {
  // Check if user is club/team super admin
  // Required for showing remove buttons
}
```

### Database Operations

```sql
-- Get team admins
SELECT ta.*, u.first_name, u.last_name, u.photo_url
FROM team_admins ta
JOIN users u ON ta.user_id = u.id
WHERE ta.team_id = $1
ORDER BY ta.is_primary DESC, ta.created_at ASC;

-- Search non-admin members
SELECT tm.*, u.first_name, u.last_name, u.photo_url, u.position
FROM team_members tm
JOIN users u ON tm.user_id = u.id
WHERE tm.team_id = $1
  AND tm.user_id NOT IN (
    SELECT user_id FROM team_admins WHERE team_id = $1
  )
  AND (
    LOWER(u.first_name) LIKE LOWER($2) OR
    LOWER(u.last_name) LIKE LOWER($2) OR
    LOWER(u.email) LIKE LOWER($2)
  );
```

### Config Values

```typescript
// spacing.ts
spacing.searchDebounceTime: 300  // Admin search debounce
spacing.cardPadding: 16
spacing.sectionSpacing: 24

// colors.ts
colorPalette.dangerRed  // Remove actions
colorPalette.primaryGold  // Promote actions
colorPalette.borderSubtle
```

### Logging Requirements

```typescript
logger.log('Manage Admins screen loaded', { teamId, isSuperAdmin });
logger.log('Admin removal initiated', { adminId, teamId });
logger.log('Admin removed', { adminId, teamId });
logger.log('Member promotion initiated', { userId, teamId });
logger.log('Member promoted to admin', { userId, teamId, role });
logger.error('Failed to remove/promote', { error, action });
```

## State Management

```typescript
interface ManageAdminsState {
  teamId: string;
  teamName: string;
  currentAdmins: TeamAdmin[];
  searchText: string;
  searchResults: TeamMember[];
  isSearching: boolean;
  isSuperAdmin: boolean;
  processingUserId: string | null;
  isLoading: boolean;
}

interface TeamAdmin {
  id: string;
  userId: string;
  name: string;
  photoUri?: string;
  role: string;
  isPrimary: boolean;
  canRemove: boolean; // Based on Super Admin status
}
```

## Permission Matrix

| Action               | Regular Admin | Super Admin |
| -------------------- | ------------- | ----------- |
| View Admins          | ✓             | ✓           |
| Search Members       | ✓             | ✓           |
| Promote to Admin     | ✓             | ✓           |
| Remove Admin         | ✗             | ✓           |
| Remove Self          | ✗             | ✗           |
| Remove Primary Admin | ✗             | ✓\*         |

\*With additional warning

## Error Handling

- Permission denied: Redirect to Teams screen with toast
- Duplicate admin: Show toast "User is already an admin"
- Network errors: Show retry button
- Can't remove self: Show alert "You cannot remove yourself as admin"
- Last admin: Show alert "Cannot remove the last admin"

## Performance Considerations

- Cache Super Admin status for session
- Debounce search at exactly 300ms
- Limit search results to 50 members
- Optimistic UI for promotion/removal
- Preload member avatars

## Accessibility

- Remove button: accessibilityLabel="Remove {admin_name} as admin"
- Promote button: accessibilityLabel="Make {member_name} an admin"
- Search field: label="Search team members to promote"
- Role badge: accessibilityHint="Admin role: {role}"

## Testing Requirements

1. Test Super Admin detection and UI differences
2. Verify 300ms search debounce
3. Test double confirmation for removal
4. Verify cannot remove self
5. Test duplicate admin prevention
6. Verify notification creation
7. Test with 0, 1, 5+ admins
8. Test search de-duplication
9. Verify permission checks

## Security Considerations

- Server-side Super Admin validation
- Prevent self-removal at API level
- Audit log all admin changes
- Validate team ownership
- Rate limit admin operations

## Business Rules

- Teams must have at least one admin
- Primary admin can only be set by Super Admin
- Admin roles: "coach", "manager", "admin"
- Members must be in team before becoming admin
- Removed admins remain team members

## Related Stories

- ADM-001: Manage Members (sibling feature)
- ADM-002: Add Members (sibling feature)
- AUTH-003: Role-based permissions
- NOTIF-001: Notification system

## Future Enhancements

- Custom admin role names
- Admin permission levels (view-only, edit, full)
- Bulk admin operations
- Admin activity history
- Transfer primary admin role
- Admin invitation by email
