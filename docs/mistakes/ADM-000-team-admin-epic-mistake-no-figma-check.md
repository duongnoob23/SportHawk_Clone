# ADM-000: Team Administration Management Epic

## Epic Summary

Enable comprehensive team administration capabilities allowing Team Admins to manage members, process join requests, and control admin roles through dedicated screens accessible from the Teams interface.

## Business Value

- **Streamline team management**: Reduce admin overhead by 70% through self-service tools
- **Improve member onboarding**: Process join requests within minutes instead of days
- **Enhance governance**: Clear admin hierarchy with Super Admin controls
- **Increase engagement**: Faster response to member requests improves retention

## User Stories

1. **ADM-001**: Manage Members Screen - View, search, and remove team members
2. **ADM-002**: Add Members Screen - Process pending join requests
3. **ADM-003**: Manage Admins Screen - Control admin roles and permissions

## High-Level Requirements

### Navigation Flow

```
Teams Tab
  └── Admin Tab (visible only to admins)
      └── 6-icon grid:
          ├── Events (future)
          ├── Payments (future)
          ├── Members → ADM-001
          │   └── Add Members card → ADM-002
          ├── Alerts (future)
          ├── Settings (future)
          └── Admins → ADM-003
```

### Core Features

- **Member Management**: Search, view, and remove team members with double confirmation
- **Interest Processing**: Accept or ignore join requests with notifications
- **Admin Control**: Promote members to admin, remove admins (Super Admin only)
- **Search Functionality**: 300ms debounced search across all screens
- **Notifications**: Automatic notifications for all member/admin changes

## Technical Architecture

### Component Hierarchy

```
Existing Components:
- ShMemberListItem (member display)
- ShSearchBar (modified for 300ms debounce)
- ShConfirmDialog (confirmations)
- ShAvatar, ShButton, ShText (UI elements)
- ShScreenContainer (layout)

New Components:
- ShAddMembersCard (pending interest count)
- ShInterestCard (join request display)
- ShAdminCard (admin with role display)
```

### API Structure

```typescript
// Core endpoints
teamsApi.getTeamMembers(teamId);
teamsApi.searchTeamMembers(teamId, searchText);
teamsApi.removeTeamMember(teamId, userId);
teamsApi.getPendingInterests(teamId);
teamsApi.acceptInterestExpression(teamId, userId);
teamsApi.ignoreInterestExpression(teamId, userId);
teamsApi.getTeamAdmins(teamId);
teamsApi.removeTeamAdmin(teamId, adminUserId);
teamsApi.promoteToAdmin(teamId, userId, role);
teamsApi.checkSuperAdmin(teamId, userId);
```

### Database Schema

```sql
-- Core tables
teams (id, name, club_id, ...)
team_members (team_id, user_id, position, jersey_number, ...)
team_admins (team_id, user_id, role, is_primary, ...)
interest_expressions (team_id, user_id, interest_status, expressed_at, ...)
notifications (user_id, type, title, message, ...)
users (id, first_name, last_name, email, photo_url, ...)
```

## Configuration Requirements

### Spacing Configuration

```typescript
// Add to spacing.ts
spacing.searchDebounceTime: 300  // Team admin search debounce
spacing.adminCardHeight: 80
spacing.interestCardPadding: 20
```

### Color Configuration

```typescript
// Utilize from colors.ts
colorPalette.dangerRed; // Removal actions
colorPalette.successGreen; // Accept actions
colorPalette.warningOrange; // Ignore actions
colorPalette.primaryGold; // Primary actions
```

## Security & Permissions

### Role Matrix

| Feature           | Member | Admin | Super Admin |
| ----------------- | ------ | ----- | ----------- |
| View Members      | ✓      | ✓     | ✓           |
| Remove Members    | ✗      | ✓     | ✓           |
| Process Interests | ✗      | ✓     | ✓           |
| View Admins       | ✓      | ✓     | ✓           |
| Add Admins        | ✗      | ✓     | ✓           |
| Remove Admins     | ✗      | ✗     | ✓           |

### Security Requirements

- Server-side permission validation for all operations
- Audit logging for all admin actions
- Rate limiting on member operations (10 per minute)
- SQL injection prevention through parameterized queries
- XSS protection in notification content

## Performance Requirements

- Initial load: < 2 seconds
- Search response: < 500ms (after 300ms debounce)
- Member operations: < 1 second
- Support 100+ members without degradation
- Virtual scrolling for lists > 50 items

## Logging Strategy

```typescript
// Consistent logging pattern
logger.log('Action initiated', { userId, teamId, action, metadata });
logger.log('Action completed', { userId, teamId, action, result });
logger.error('Action failed', { userId, teamId, action, error });
```

## Testing Strategy

### Unit Tests

- Component rendering with mock data
- Search debounce timing (300ms)
- Permission checking logic
- API error handling

### Integration Tests

- Full flow: Accept interest → Member appears in list
- Full flow: Promote member → Admin permissions granted
- Database transaction integrity
- Notification delivery

### E2E Tests

- Complete admin journey from Teams tab
- Permission denial for non-admins
- Network failure recovery
- Concurrent user operations

## Accessibility Requirements

- WCAG 2.1 AA compliance
- Screen reader support for all interactive elements
- Keyboard navigation through all screens
- Clear focus indicators
- Descriptive labels for all actions

## Success Metrics

- **Adoption**: 80% of team admins use features within first month
- **Efficiency**: Average time to process interest < 30 seconds
- **Reliability**: 99.9% success rate for member operations
- **Performance**: 95th percentile response time < 1 second

## Dependencies

- Existing Teams infrastructure (ADM-001, ADM-002, ADM-003)
- Notification system (for member/admin notifications)
- Authentication system (for permission checking)
- Supabase database and API layer

## Risks & Mitigations

| Risk                   | Impact | Mitigation                                 |
| ---------------------- | ------ | ------------------------------------------ |
| Large team performance | High   | Implement pagination and virtual scrolling |
| Concurrent admin edits | Medium | Implement optimistic locking               |
| Notification failures  | Low    | Queue and retry mechanism                  |
| Permission bypass      | High   | Server-side validation on all operations   |

## Future Enhancements

- Bulk operations (accept/remove multiple)
- Admin activity audit trail
- Custom admin roles and permissions
- Email notifications
- Member import from CSV
- Team member analytics dashboard

## Release Plan

1. **Phase 1**: Core screens and navigation (ADM-001, ADM-002, ADM-003)
2. **Phase 2**: Enhanced search and filtering
3. **Phase 3**: Bulk operations and analytics

## Acceptance Criteria for Epic Completion

- [ ] All three stories (ADM-001, ADM-002, ADM-003) implemented
- [ ] 300ms search debounce working across all screens
- [ ] Double confirmation for destructive actions
- [ ] Notifications sent for all member/admin changes
- [ ] Super Admin permissions properly enforced
- [ ] All components follow Sh naming convention
- [ ] No magic numbers (all from config)
- [ ] Comprehensive logging implemented
- [ ] Unit tests with > 80% coverage
- [ ] E2E tests for critical paths
- [ ] Performance metrics met
- [ ] Accessibility standards met
