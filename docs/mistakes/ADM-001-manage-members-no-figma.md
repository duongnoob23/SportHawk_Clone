# ADM-001: Team Admin - Manage Members Screen

## Parent Epic

**ADM-000**: Team Administration Management - Allow Team Admins to manage team members, handle join requests, and appoint other admins

## Story Description

As a Team Admin, I want to manage my team's members through a dedicated screen where I can view all members, search for specific members, see pending interest expressions, and remove members when necessary.

## Acceptance Criteria

1. **Navigation**
   - The screen SHALL be accessible by tapping "Members" icon in the Admin tab grid (Teams > Admins tab > Members icon)
   - The screen SHALL have a navigation bar with title "Manage Members" and standard back button
   - The screen SHALL follow the Create-Event pattern for navigation bar layout

2. **Team Selection Requirement**
   - The screen SHALL only show content when a single team is selected
   - The screen SHALL show empty state if no team is selected with message "Please select a team"

3. **Add Members Card**
   - The screen SHALL display an "Add members" card showing count of pending interest expressions
   - The card SHALL show "{count} interested" based on interest_expressions table (team_id match, interest_status="pending")
   - The card SHALL navigate to Add Members screen (ADM-002) when tapped if count > 0
   - The card SHALL display "0 interested" and be non-interactive when no pending interests exist

4. **Search Functionality**
   - The screen SHALL provide a "Search members" input field
   - The search SHALL trigger after 300ms debounce when user types
   - The search SHALL match against member first_name, last_name, and email fields
   - The search results SHALL update the Team Members list in real-time

5. **Team Members List**
   - The list SHALL default to showing "All" team members when no search is active
   - The list SHALL have a dropdown selector to the right of "Team Members" title
   - The dropdown SHALL show "Search" when search is active, "All" when showing all members
   - Selecting "All" from dropdown SHALL clear search and show all members

6. **Member Display**
   - Each member SHALL be displayed using ShMemberListItem component
   - Member cards SHALL show: avatar/photo, name, position (if set), jersey number (if set)
   - Each member card SHALL have a minus (-) icon on the right for removal

7. **Member Removal - First Confirmation**
   - Tapping minus icon SHALL show first confirmation dialog
   - Dialog title: "Confirm REMOVING player"
   - Dialog message: "Confirm REMOVING player, {first_name} {last_name}"
   - Dialog buttons: "Confirm Remove" (primary), "Cancel" (secondary)

8. **Member Removal - Second Confirmation**
   - Selecting "Confirm Remove" SHALL show second confirmation dialog
   - Dialog message: "Are you sure you want to REMOVE {first_name} {last_name} from team: {team_name}"
   - Dialog buttons: "Yes" (danger), "No" (secondary)

9. **Member Removal - Action**
   - Selecting "Yes" SHALL delete the member from team_members table
   - The system SHALL send notification to removed member via notifications table
   - The member list SHALL update immediately to reflect removal
   - Success message SHALL show: "Member removed successfully"

## Technical Requirements

### Navigation & Routing

- Route: `/teams/admin/members`
- Params: `teamId` (required)
- Navigation guard: User must be team admin

### Components to Use

- **ShMemberListItem**: For displaying each team member
- **ShSearchBar**: Modified to use 300ms debounce (not default 500ms)
- **ShConfirmDialog**: For both removal confirmation dialogs
- **ShText, ShIcon, ShButton**: Standard UI components
- **ShScreenContainer**: For consistent screen layout

### New Components Needed

- **ShAddMembersCard**: Card component showing pending interest count
  - Props: `count: number`, `onPress: () => void`, `isDisabled: boolean`
  - Styling: Follow payment summary card patterns

### API Endpoints

```typescript
// teams.ts additions
async getTeamMembers(teamId: string) {
  // Query team_members with user profiles
  // Include position, jersey_number
}

async searchTeamMembers(teamId: string, searchText: string) {
  // Search with 300ms debounce
  // Match first_name, last_name, email
}

async removeTeamMember(teamId: string, userId: string) {
  // Delete from team_members
  // Create notification record
}

async getPendingInterests(teamId: string) {
  // Count interest_expressions
  // WHERE team_id = teamId AND interest_status = 'pending'
}
```

### Database Tables

- `teams`: Team selection
- `team_members`: Member list and removal
- `interest_expressions`: Pending interest count
- `notifications`: Removal notifications
- `users`: Member profile data

### Config Values to Use

```typescript
// From spacing.ts
spacing.searchDebounceTime: 300  // Need to add this
spacing.cardPadding: 16
spacing.listItemPadding: 16
spacing.borderWidthThin: 1

// From colors.ts
colorPalette.borderSubtle
colorPalette.primaryGold
colorPalette.dangerRed  // For removal actions
colorPalette.textLight
```

### Logging Requirements

```typescript
logger.log('Manage Members screen loaded', { teamId, userId });
logger.log('Member search initiated', { searchText, teamId });
logger.log('Member removal initiated', { memberId, teamId });
logger.log('Member removed successfully', { memberId, teamId });
logger.error('Failed to remove member', { error, memberId, teamId });
```

## State Management

```typescript
interface ManageMembersState {
  selectedTeam: Team | null;
  members: TeamMember[];
  searchText: string;
  isSearching: boolean;
  pendingInterestCount: number;
  filterMode: 'all' | 'search';
  isLoading: boolean;
  removingMemberId: string | null;
}
```

## Error Handling

- Network errors: Show toast with "Failed to load members. Please try again."
- Search errors: Show inline message "Search failed. Showing all members."
- Removal errors: Show alert "Failed to remove member. Please try again."
- Permission errors: Redirect to teams screen with toast "Admin access required"

## Performance Considerations

- Implement virtual scrolling for lists over 50 members
- Cache member list for 5 minutes
- Debounce search at exactly 300ms (not 500ms default)
- Lazy load member avatars
- Optimistic UI updates for member removal

## Accessibility

- Search field: label="Search team members"
- Remove button: accessibilityLabel="Remove {member_name} from team"
- Card: accessibilityHint="Tap to view pending member requests"
- List: Announce count changes after search/filter

## Testing Requirements

1. Verify 300ms search debounce timing
2. Test double confirmation flow for removal
3. Verify notification creation on removal
4. Test search across all member fields
5. Validate admin permission checking
6. Test with 0, 1, 50+ pending interests
7. Verify immediate UI update after removal
8. Test network error recovery

## Related Stories

- ADM-002: Add Members Screen (navigation target)
- ADM-003: Manage Admins Screen (sibling admin feature)
- MEM-004: Member Profile View (member details)

## Notes

- Search debounce is 300ms per design spec, not the app's standard 500ms
- Double confirmation pattern matches existing dangerous actions
- Member removal is soft delete (set inactive) not hard delete
- Consider adding bulk selection for future enhancement
