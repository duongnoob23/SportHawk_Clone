# API Contracts for Members Stories

## MEM-001: Club Search API

### Endpoint: `clubsApi.searchClubs()`

**Request:**

```typescript
interface SearchClubsRequest {
  searchTerm?: string; // Optional search text
  sport?: SportType; // Optional sport filter
  limit?: number; // Default: 20, Max: 100
  offset?: number; // For future pagination
}
```

**Response:**

```typescript
interface SearchClubsResponse {
  clubs: Array<{
    id: string;
    name: string;
    location_city: string;
    location_state: string;
    postcode?: string;
    description?: string;
    sport_types: SportType[];
    member_count: number; // Aggregated from teams
    club_badge_url?: string;
    background_image_url?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  }>;
  total_count: number;
}
```

**Error Responses:**

- 400: Invalid search parameters
- 500: Server error

## MEM-002: Club Details APIs

### Endpoint: `clubsApi.getPublicClubInfo()`

**Already exists - no changes needed**

### Endpoint: `clubsApi.getClubTeamsPreview()`

**Needs Enhancement:**

```typescript
interface TeamPreview {
  id: string;
  name: string;
  sport: string;
  age_group?: string;
  team_sort?: string;
  member_count: number; // ADD THIS via JOIN
}
```

## MEM-003: Team Details API

### Endpoint: `teamsApi.getPublicTeamInfo()`

**Already exists - returns:**

```typescript
interface TeamInfo {
  id: string;
  name: string;
  sport: string;
  age_group?: string;
  founded_year?: number;
  league_name?: string;
  gameplay_level?: string;
  home_ground_name?: string;
  home_ground_address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  playing_times?: Array<{
    event_type: string;
    days: string;
    time: string;
    location: string;
  }>;
  members?: Array<{
    user_id: string;
    role: 'admin' | 'coach' | 'member';
  }>;
}
```

## MEM-004: Team Members API

### Endpoint: `teamsApi.getTeamMembers()`

**Request:**

```typescript
interface GetTeamMembersRequest {
  teamId: string;
}
```

**Response:**

```typescript
interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: 'admin' | 'coach' | 'member';
  joined_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    profile_photo_uri?: string;
  };
}

type GetTeamMembersResponse = TeamMember[];
```

## MEM-005: Interest Expression APIs

### Endpoint: `teamsApi.checkInterestStatus()`

**Request:**

```typescript
interface CheckInterestRequest {
  teamId: string;
  // userId from auth context
}
```

**Response:**

```typescript
interface InterestStatus {
  hasExpressed: boolean;
  status?: 'pending' | 'accepted' | 'rejected';
  expressedAt?: string;
}
```

### Endpoint: `teamsApi.expressInterestInTeam()`

**Request:**

```typescript
interface ExpressInterestRequest {
  teamId: string;
  // userId from auth context
  message?: string; // Optional message to admin
}
```

**Response:**

```typescript
interface ExpressInterestResponse {
  id: string;
  status: 'pending';
  expressed_at: string;
}
```

**Error Responses:**

- 409: Duplicate expression (unique constraint)
- 403: User not authenticated
- 404: Team not found

## Supabase RLS Policies Required

### interest_expressions table

```sql
-- Users can read their own expressions
CREATE POLICY "Users can view own interest expressions"
ON interest_expressions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own expressions
CREATE POLICY "Users can create interest expressions"
ON interest_expressions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins can read team expressions
CREATE POLICY "Admins can view team interest expressions"
ON interest_expressions FOR SELECT
TO authenticated
USING (
  team_id IN (
    SELECT team_id FROM team_admins
    WHERE user_id = auth.uid()
  )
);
```

## Rate Limiting

- Search API: 10 requests per second per user
- Interest Expression: 5 attempts per hour per user/team combo
- Member lists: Cached for 60 seconds

## Response Time SLAs

- Search: < 500ms for up to 200 clubs
- Details: < 300ms for single entity fetch
- Lists: < 400ms for up to 100 members
