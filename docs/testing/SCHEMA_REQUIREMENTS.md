# Schema Requirements cho Test Validation

## 📋 Các Bảng Cần Schema

Dựa trên phân tích các test files, các bảng sau được sử dụng:

### 1. **events** (Bảng chính)

- Được sử dụng trong: `createEvent`, `getEventDetail`, `updateEventById`, `deleteEvent`, `getEventEdit`
- Cần schema đầy đủ với:
  - Tất cả columns và data types
  - NOT NULL constraints
  - Default values
  - Check constraints (nếu có)
  - Foreign keys

### 2. **event_invitations**

- Được sử dụng trong: `createEvent`, `getEventDetail`, `updateEventById`, `upsertInvitations`, `getEventInvitationsStatus`, `getUpdateEventInvitationHandGesture`, `getUpdateEventInvitationHandGestures`, `getEventSquadsSelect`, `getTeamMembersSimple`, `getTeamAdminsSimple`
- Cần schema đầy đủ với:
  - Tất cả columns và data types
  - NOT NULL constraints
  - Foreign keys (event_id, user_id, invited_by)
  - Enum values cho `invitation_status` (nếu có)

### 3. **event_squads**

- Được sử dụng trong: `getEventSquad`, `getEventSquadsSelect`, `getUpsertEventsquad`, `getDeleteAllEventSquad`
- Cần schema đầy đủ với:
  - Tất cả columns và data types
  - NOT NULL constraints
  - Foreign keys

### 4. **team_members**

- Được sử dụng trong: `getEventDetail`, `getTeamMembersSimple`, `getTeamMembersWithTeamId`
- Cần schema đầy đủ với:
  - Tất cả columns và data types
  - NOT NULL constraints
  - Foreign keys
  - Enum values cho `member_status` (nếu có)

### 5. **team_admins**

- Được sử dụng trong: `getEventDetail`, `getTeamAdminsSimple`, `getTeamLeadersWithTeamId`
- Cần schema đầy đủ với:
  - Tất cả columns và data types
  - NOT NULL constraints
  - Foreign keys

### 6. **profiles** (Optional - được join từ team_members và team_admins)

- Được sử dụng trong: `getTeamMembersSimple`, `getTeamAdminsSimple`, `getTeamMembersWithTeamId`, `getTeamLeadersWithTeamId`
- Cần schema đầy đủ với:
  - Các columns được select trong queries (id, first_name, last_name, profile_photo_uri)

## 📝 Thông Tin Cần Bổ Sung

### 1. **Constraints Chi Tiết**

- NOT NULL constraints cho từng column
- UNIQUE constraints
- CHECK constraints (ví dụ: event_status chỉ có thể là 'scheduled', 'cancelled', 'completed')
- Default values

### 2. **Foreign Keys**

- `event_invitations.event_id` → `events.id` (ON DELETE CASCADE?)
- `event_invitations.user_id` → `profiles.id` (hoặc users table?)
- `event_invitations.invited_by` → `profiles.id` (hoặc users table?)
- `event_squads.event_id` → `events.id`
- `event_squads.user_id` → `profiles.id`
- `team_members.team_id` → `teams.id`
- `team_members.user_id` → `profiles.id`
- `team_admins.team_id` → `teams.id`
- `team_admins.user_id` → `profiles.id`
- `events.team_id` → `teams.id`
- `events.created_by` → `profiles.id`

### 3. **Enum Values**

- `events.event_status`: Các giá trị có thể (scheduled, cancelled, completed, ...)
- `events.event_type`: Các giá trị có thể (home_match, away_match, training, other, ...)
- `event_invitations.invitation_status`: Các giá trị có thể (pending, accepted, declined, maybe, ...)
- `team_members.member_status`: Các giá trị có thể (active, inactive, ...)

### 4. **Data Types Chính Xác**

- UUID vs TEXT vs VARCHAR
- TIMESTAMP vs TIMESTAMPTZ vs DATE
- JSON vs JSONB
- BOOLEAN vs INTEGER

### 5. **Indexes**

- Các indexes quan trọng (để hiểu performance và query patterns)

### 6. **Triggers/Functions**

- Các triggers tự động (ví dụ: updated_at tự động update)
- Các functions liên quan

### 7. **Edge Cases Thực Tế**

- Các lỗi thường gặp trong production
- Các edge cases đã xảy ra
- Các validation rules đặc biệt

## 🔍 Cách Gửi Schema

Bạn có thể gửi schema theo một trong các cách sau:

### **Cách 1: SQL DDL (Khuyến nghị)**

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('home_match', 'away_match', 'training', 'other')),
  event_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (event_status IN ('scheduled', 'cancelled', 'completed')),
  ...
);
```

### **Cách 2: Supabase Table Editor Screenshot**

- Chụp màn hình từ Supabase Dashboard → Table Editor
- Bao gồm tất cả columns, types, và constraints

### **Cách 3: JSON Schema**

```json
{
  "events": {
    "columns": {
      "id": { "type": "uuid", "nullable": false, "default": "gen_random_uuid()" },
      "team_id": { "type": "uuid", "nullable": false, "foreign_key": "teams.id" },
      ...
    },
    "constraints": {
      "check": [
        { "column": "event_status", "values": ["scheduled", "cancelled", "completed"] }
      ]
    }
  }
}
```

### **Cách 4: Migration Files**

- Nếu có migration files (Supabase migrations), gửi các file đó

## ✅ Checklist Trước Khi Gửi

- [ ] Schema của tất cả 6 bảng (events, event_invitations, event_squads, team_members, team_admins, profiles)
- [ ] Tất cả columns với data types chính xác
- [ ] NOT NULL constraints
- [ ] Foreign keys với ON DELETE/ON UPDATE actions
- [ ] Enum values cho các columns có enum
- [ ] Default values
- [ ] Check constraints
- [ ] Các edge cases hoặc lỗi thường gặp trong production
