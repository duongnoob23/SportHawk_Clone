# Schema Checklist - Cần Gửi Để Validate Tests

## 🎯 Mục Đích

Để đảm bảo tests thực sự bắt được lỗi và không phải "false positives", cần kiểm tra lại với schema thực tế của database.

## 📋 Các Bảng Cần Schema (Ưu Tiên)

### **1. events** ⭐⭐⭐ (Quan trọng nhất)
**Được sử dụng trong:** `createEvent`, `getEventDetail`, `updateEventById`, `deleteEvent`, `getEventEdit`

**Cần thông tin:**
- ✅ Tất cả columns và data types
- ✅ NOT NULL constraints
- ✅ Default values
- ✅ Check constraints (đặc biệt cho `event_status` và `event_type`)
- ✅ Foreign keys (team_id, created_by)
- ✅ Unique constraints (nếu có)

**Các columns quan trọng:**
- `id` (UUID?)
- `team_id` (UUID? NOT NULL?)
- `created_by` (UUID? NOT NULL?)
- `title` (TEXT? NOT NULL?)
- `event_type` (TEXT? ENUM? CHECK constraint?)
- `event_status` (TEXT? ENUM? CHECK constraint? Default?)
- `event_date` (DATE? TIMESTAMP?)
- `start_time` (TIME? TIMESTAMP?)
- `end_time` (TIME? TIMESTAMP? NULLABLE?)
- `cancelled_reason` (TEXT? NULLABLE?)
- `cancelled_at` (TIMESTAMP? NULLABLE?)
- `cancelled_by` (UUID? NULLABLE?)
- `updated_at` (TIMESTAMP? Auto-update?)

### **2. event_invitations** ⭐⭐⭐ (Quan trọng nhất)
**Được sử dụng trong:** Hầu hết các API liên quan đến invitations

**Cần thông tin:**
- ✅ Tất cả columns và data types
- ✅ NOT NULL constraints
- ✅ Foreign keys (event_id, user_id, invited_by)
- ✅ Check constraints cho `invitation_status`
- ✅ Unique constraints (có thể có composite unique cho event_id + user_id?)

**Các columns quan trọng:**
- `id` (UUID?)
- `event_id` (UUID? NOT NULL?)
- `user_id` (UUID? NOT NULL?)
- `invited_by` (UUID? NOT NULL?)
- `invited_at` (TIMESTAMP? NOT NULL? Default?)
- `invitation_status` (TEXT? ENUM? CHECK constraint? Default 'pending'?)

### **3. event_squads** ⭐⭐
**Được sử dụng trong:** `getEventSquad`, `getEventSquadsSelect`, `getUpsertEventsquad`, `getDeleteAllEventSquad`

**Cần thông tin:**
- ✅ Tất cả columns và data types
- ✅ NOT NULL constraints
- ✅ Foreign keys (event_id, user_id, selected_by)
- ✅ Unique constraints (có thể có composite unique cho event_id + user_id?)

**Các columns quan trọng:**
- `id` (UUID?)
- `event_id` (UUID? NOT NULL?)
- `user_id` (UUID? NOT NULL?)
- `selected_by` (UUID? NOT NULL?)
- `selected_at` (TIMESTAMP? NOT NULL? Default?)
- `position` (TEXT? NULLABLE?)
- `squad_role` (TEXT? NULLABLE?)
- `selection_notes` (TEXT? NULLABLE?)

### **4. team_members** ⭐⭐
**Được sử dụng trong:** `getEventDetail`, `getTeamMembersSimple`, `getTeamMembersWithTeamId`

**Cần thông tin:**
- ✅ Tất cả columns và data types
- ✅ NOT NULL constraints
- ✅ Foreign keys (team_id, user_id)
- ✅ Check constraints cho `member_status`

**Các columns quan trọng:**
- `id` (UUID?)
- `team_id` (UUID? NOT NULL?)
- `user_id` (UUID? NOT NULL?)
- `member_status` (TEXT? ENUM? CHECK constraint? Default 'active'?)
- `position` (TEXT? NULLABLE?)

### **5. team_admins** ⭐⭐
**Được sử dụng trong:** `getEventDetail`, `getTeamAdminsSimple`, `getTeamLeadersWithTeamId`

**Cần thông tin:**
- ✅ Tất cả columns và data types
- ✅ NOT NULL constraints
- ✅ Foreign keys (team_id, user_id)
- ✅ Default values (ví dụ: is_primary default false?)

**Các columns quan trọng:**
- `id` (UUID?)
- `team_id` (UUID? NOT NULL?)
- `user_id` (UUID? NOT NULL?)
- `role` (TEXT? NULLABLE?)
- `title` (TEXT? NULLABLE?)
- `is_primary` (BOOLEAN? Default false?)

### **6. profiles** ⭐ (Optional - chỉ cần các columns được select)
**Được sử dụng trong:** Join từ team_members và team_admins

**Cần thông tin:**
- ✅ Các columns được select trong queries:
  - `id` (UUID?)
  - `first_name` (TEXT? NULLABLE?)
  - `last_name` (TEXT? NULLABLE?)
  - `profile_photo_uri` (TEXT? NULLABLE?)

## 📝 Thông Tin Bổ Sung Cần Thiết

### **1. Enum Values (Từ Constants)**
Dựa trên code, các enum values có thể là:

**event_type:**
- `home_match`
- `away_match`
- `training`
- `other`

**event_status:**
- `scheduled` (hoặc `active`?)
- `cancelled`
- `completed`

**invitation_status:**
- `pending`
- `accepted`
- `declined`
- `maybe`
- `sent` (có thể có?)

**member_status:**
- `active`
- `inactive` (hoặc các giá trị khác?)

### **2. Foreign Key Actions**
- `ON DELETE CASCADE` hay `ON DELETE RESTRICT`?
- `ON UPDATE CASCADE` hay `ON UPDATE RESTRICT`?

### **3. Auto-Generated Fields**
- `id` có phải `gen_random_uuid()` không?
- `created_at` có auto-set không?
- `updated_at` có trigger tự động update không?

### **4. Indexes Quan Trọng**
- Indexes trên `event_id`, `user_id`, `team_id`?
- Composite indexes?

### **5. Edge Cases Thực Tế**
- Các lỗi thường gặp trong production?
- Các validation rules đặc biệt?
- Các constraints phức tạp?

## 🔍 Cách Gửi Schema

### **Cách 1: SQL DDL (Khuyến nghị nhất)**
```sql
-- Bảng events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('home_match', 'away_match', 'training', 'other')),
  event_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (event_status IN ('scheduled', 'cancelled', 'completed')),
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  -- ... các columns khác
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng event_invitations
CREATE TABLE event_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  invited_by UUID NOT NULL REFERENCES profiles(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'maybe', 'sent')),
  UNIQUE(event_id, user_id)
);
```

### **Cách 2: Supabase Dashboard Screenshot**
- Chụp màn hình từ Supabase Dashboard → Table Editor
- Bao gồm tất cả columns, types, và constraints

### **Cách 3: Migration Files**
- Nếu có Supabase migration files, gửi các file đó

### **Cách 4: pg_dump Schema Only**
```bash
pg_dump --schema-only --table=events --table=event_invitations ... > schema.sql
```

## ✅ Checklist Trước Khi Gửi

- [ ] Schema của **events** table (đầy đủ)
- [ ] Schema của **event_invitations** table (đầy đủ)
- [ ] Schema của **event_squads** table (đầy đủ)
- [ ] Schema của **team_members** table (đầy đủ)
- [ ] Schema của **team_admins** table (đầy đủ)
- [ ] Schema của **profiles** table (ít nhất các columns được select)
- [ ] Tất cả NOT NULL constraints
- [ ] Tất cả Foreign keys với ON DELETE/ON UPDATE actions
- [ ] Tất cả CHECK constraints (đặc biệt cho enums)
- [ ] Default values
- [ ] Unique constraints
- [ ] Các edge cases hoặc lỗi thường gặp trong production (nếu có)

## 🎯 Sau Khi Nhận Schema

Tôi sẽ:
1. ✅ So sánh schema với mocks trong tests
2. ✅ Kiểm tra các constraints có đúng không
3. ✅ Kiểm tra các enum values có đúng không
4. ✅ Kiểm tra các foreign keys có đúng không
5. ✅ Thêm các test cases bổ sung nếu cần
6. ✅ Sửa các test cases nếu phát hiện sai sót
7. ✅ Đảm bảo tests thực sự bắt được lỗi

