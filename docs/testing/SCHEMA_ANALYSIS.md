# Schema Analysis - So Sánh Với Tests

## 🔍 Phân Tích Schema Thực Tế

### **1. events Table**

#### **Điểm Quan Trọng:**
- ✅ `event_status` default là `'active'` (KHÔNG phải `'scheduled'`)
- ✅ `event_status` CHECK constraint: `'active'`, `'cancelled'`, `'completed'`
- ✅ `event_type` CHECK constraint: `'home_match'`, `'away_match'`, `'training'`, `'other'`, `'match'`, `'social'`, `'meeting'`
- ⚠️ **QUAN TRỌNG:** `cancelled_reason` có CHECK constraint:
  - Nếu `event_status = 'cancelled'` → `cancelled_reason` phải NOT NULL
  - Nếu `event_status != 'cancelled'` → `cancelled_reason` phải NULL
- ⚠️ **QUAN TRỌNG:** `end_time` có CHECK constraint: phải > `start_time` nếu không null
- ⚠️ **QUAN TRỌNG:** `max_participants` có CHECK constraint: phải > 0 nếu không null
- ✅ `updated_at` có trigger tự động update
- ⚠️ Foreign keys: `created_by` và `cancelled_by` reference `auth.users(id)`, KHÔNG phải `profiles(id)`

#### **Cần Sửa Tests:**
1. `deleteEvent.test.ts` - Cần test case cho `cancelled_reason` required khi `event_status = 'cancelled'`
2. `createEvent.test.ts` - Cần test case cho `end_time > start_time` constraint
3. `updateEventById.test.ts` - Cần test case cho `end_time > start_time` constraint
4. `createEvent.test.ts` - Cần test case cho `max_participants > 0` constraint

### **2. event_invitations Table**

#### **Điểm Quan Trọng:**
- ✅ `invitation_status` là ENUM type: `invitation_status_enum` với default `'pending'`
- ⚠️ **QUAN TRỌNG:** Có UNIQUE constraint: `(event_id, user_id)` - không thể có 2 invitations cho cùng event và user
- ⚠️ Foreign keys: `invited_by` reference `auth.users(id)`, KHÔNG phải `profiles(id)`
- ✅ `user_id` reference `profiles(id)` với ON DELETE CASCADE

#### **Cần Sửa Tests:**
1. `createEvent.test.ts` - Cần test case cho duplicate invitation (event_id + user_id)
2. `upsertInvitations.test.ts` - Cần test case cho duplicate invitation
3. `updateEventById.test.ts` - Cần test case cho duplicate invitation khi add members

### **3. event_squads Table**

#### **Điểm Quan Trọng:**
- ⚠️ **QUAN TRỌNG:** Có UNIQUE constraint: `(event_id, user_id)` - không thể có 2 squad entries cho cùng event và user
- ⚠️ Foreign keys: `selected_by` reference `auth.users(id)`, KHÔNG phải `profiles(id)`
- ✅ `user_id` reference `profiles(id)` với ON DELETE CASCADE

#### **Cần Sửa Tests:**
1. `getUpsertEventsquad.test.ts` - Cần test case cho duplicate squad member (event_id + user_id)

### **4. team_members Table**

#### **Điểm Quan Trọng:**
- ✅ `member_status` CHECK constraint: `'active'`, `'inactive'`, `'suspended'`, `'injured'`
- ✅ Default: `'active'`
- ⚠️ **QUAN TRỌNG:** Có UNIQUE constraint: `(team_id, user_id)` - không thể có 2 members cho cùng team và user
- ⚠️ **QUAN TRỌNG:** Có UNIQUE constraint: `(team_id, jersey_number)` - không thể có 2 members cùng jersey number trong cùng team
- ⚠️ `jersey_number` CHECK constraint: phải >= 1 và <= 99

#### **Cần Sửa Tests:**
- Tests hiện tại chỉ filter `member_status = 'active'`, điều này đúng với logic

### **5. team_admins Table**

#### **Điểm Quan Trọng:**
- ✅ `is_primary` default: `false`
- ⚠️ **QUAN TRỌNG:** Có UNIQUE constraint: `(team_id, user_id)` - không thể có 2 admins cho cùng team và user
- ✅ `role` default: `'Manager'`

#### **Cần Sửa Tests:**
- Tests hiện tại đã đúng

### **6. profiles Table**

#### **Điểm Quan Trọng:**
- ✅ `id` reference `auth.users(id)` (primary key)
- ✅ Các columns: `first_name`, `last_name`, `profile_photo_uri` đều nullable

#### **Cần Sửa Tests:**
- Tests hiện tại đã đúng

## 🚨 Các Vấn Đề Quan Trọng Cần Sửa

### **1. cancelled_reason Constraint**
**Vấn đề:** Khi `event_status = 'cancelled'`, `cancelled_reason` phải NOT NULL.

**Cần thêm test cases:**
- `deleteEvent.test.ts`: Test khi `event_status = 'cancelled'` nhưng `cancelled_reason = null` → Should fail
- `updateEventById.test.ts`: Test khi update `event_status = 'cancelled'` nhưng không có `cancelled_reason` → Should fail

### **2. end_time > start_time Constraint**
**Vấn đề:** `end_time` phải > `start_time` nếu không null.

**Cần thêm test cases:**
- `createEvent.test.ts`: Test khi `end_time <= start_time` → Should fail
- `updateEventById.test.ts`: Test khi `end_time <= start_time` → Should fail

### **3. max_participants > 0 Constraint**
**Vấn đề:** `max_participants` phải > 0 nếu không null.

**Cần thêm test cases:**
- `createEvent.test.ts`: Test khi `max_participants <= 0` → Should fail
- `updateEventById.test.ts`: Test khi `max_participants <= 0` → Should fail

### **4. UNIQUE Constraints**
**Vấn đề:** Có nhiều UNIQUE constraints mà tests chưa cover.

**Cần thêm test cases:**
- `createEvent.test.ts`: Test khi tạo duplicate invitation (event_id + user_id) → Should fail
- `upsertInvitations.test.ts`: Test khi insert duplicate invitation → Should fail
- `updateEventById.test.ts`: Test khi add duplicate member → Should fail
- `getUpsertEventsquad.test.ts`: Test khi add duplicate squad member → Should fail

### **5. Foreign Key References**
**Vấn đề:** `created_by`, `cancelled_by`, `invited_by`, `selected_by` reference `auth.users(id)`, không phải `profiles(id)`.

**Cần kiểm tra:**
- Tests hiện tại có đang mock đúng không?
- Có cần thêm test cases cho invalid foreign keys không?

## ✅ Action Items

1. [ ] Thêm test cases cho `cancelled_reason` constraint
2. [ ] Thêm test cases cho `end_time > start_time` constraint
3. [ ] Thêm test cases cho `max_participants > 0` constraint
4. [ ] Thêm test cases cho UNIQUE constraints
5. [ ] Kiểm tra và sửa foreign key mocks nếu cần
6. [ ] Chạy lại tất cả tests để đảm bảo vẫn pass

