# Test Data Requirements for Members Stories

## Purpose

Define specific test data scenarios developers need to properly test the Members features.

## Test Clubs Data

### Minimum Requirements

- **5 clubs** with varying member counts (0, 1, 10, 50, 100+)
- **Different locations** across multiple cities/states
- **Various sports** (at least Football, Rugby, Basketball)
- **Mix of clubs** with/without hero images
- **Clubs with long names** to test text truncation

### Search Test Cases

1. **Empty search**: Returns all clubs
2. **Single match**: "Unique Club Name"
3. **Multiple matches**: "Football" in name/description
4. **No matches**: "xyz123notfound"
5. **Partial match**: "Frem" for "Fremington"
6. **Case insensitive**: "FOOTBALL" matches "Football"

## Test Teams Data

### Per Club Requirements

- **Club with 0 teams**: Test empty state
- **Club with 1-3 teams**: Test no "View All" button
- **Club with 4+ teams**: Test "View All" button appears
- **Teams with various member counts**: 0, 1, 10, 24, 50+

### Team Details

- **Team with all fields populated**: Founded year, league, home ground, playing times
- **Team with minimal fields**: Only required fields
- **Team with no coordinates**: Test map hiding
- **Team with past founded year**: e.g., 2020
- **Team with null founded year**: Test hiding

## Test Members Data

### Role Distribution

- **Team with only admins** (2-3 admins)
- **Team with only members** (edge case)
- **Team with mixed roles**: 2 admins, 1 coach, 20 members
- **Empty team**: 0 members

### Member Profiles

- **Complete profiles**: first_name, last_name, profile_photo_uri
- **Minimal profiles**: Only required fields
- **Long names**: Test text truncation
- **Missing photos**: Test initials fallback

## Test User Scenarios

### Current User States

1. **Non-member**: Can see "Join us" button
2. **Team member**: "Join us" button hidden
3. **Pending interest**: Button shows "Request Pending"
4. **Team admin**: Can see admin badge on self

## Interest Expressions Data

### Existing Records

- **No expression**: User can join
- **Pending expression**: Button disabled
- **Rejected expression**: (future story)
- **Accepted expression**: User is now member

## Edge Cases to Test

1. **Network timeout**: Slow API responses (3+ seconds)
2. **Large datasets**: 200+ clubs, 100+ members
3. **Missing images**: Club logos, hero images, profile photos
4. **Long text**: Descriptions exceeding display area
5. **Rapid user actions**: Quick tab switches, search typing
6. **Offline mode**: No network connection

## Performance Benchmarks

- **Initial load**: < 2 seconds
- **Search response**: < 500ms after debounce
- **Tab switch**: < 100ms
- **Scroll performance**: 60 FPS with 100+ items

## Database Seeding Script

```sql
-- Example: Create test club with teams
INSERT INTO clubs (name, location_city, location_state, sport_types)
VALUES ('Test Athletic FC', 'Fremington', 'Devon', ARRAY['Football']);

-- Add teams with varying member counts
INSERT INTO teams (club_id, name, sport, age_group, founded_year)
VALUES
  (club_id, 'First Team', 'Football', 'Open', 2020),
  (club_id, 'Reserves', 'Football', 'Open', 2021),
  (club_id, 'Youth U18', 'Football', 'U18', NULL);

-- Add test members with different roles
INSERT INTO team_members (team_id, user_id, role, joined_at)
VALUES
  (team_id, user1_id, 'admin', NOW() - INTERVAL '1 year'),
  (team_id, user2_id, 'coach', NOW() - INTERVAL '6 months'),
  (team_id, user3_id, 'member', NOW() - INTERVAL '1 day');
```

## Testing Checklist for Developers

- [ ] Test with 0, 1, and many items in each list
- [ ] Test with missing optional fields
- [ ] Test with maximum length text
- [ ] Test rapid navigation between screens
- [ ] Test search with special characters
- [ ] Test on slow network (Network Link Conditioner)
- [ ] Test accessibility with screen reader
- [ ] Test on minimum supported device (iPhone SE)
