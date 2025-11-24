# 📋 Yêu Cầu Schema - Tóm Tắt

## 🎯 Mục Đích
Để đảm bảo tests thực sự bắt được lỗi, cần kiểm tra lại với schema thực tế của database.

## 📊 Các Bảng Cần Schema (6 bảng)

### **Bảng Chính (Bắt buộc):**
1. **`events`** - Bảng chính cho events
2. **`event_invitations`** - Bảng invitations
3. **`event_squads`** - Bảng squad members
4. **`team_members`** - Bảng team members
5. **`team_admins`** - Bảng team admins/leaders

### **Bảng Phụ (Optional):**
6. **`profiles`** - Chỉ cần các columns: `id`, `first_name`, `last_name`, `profile_photo_uri`

## 📝 Thông Tin Cần Cho Mỗi Bảng

Với mỗi bảng, cần:

1. ✅ **Tất cả columns** với data types chính xác (UUID, TEXT, TIMESTAMP, etc.)
2. ✅ **NOT NULL constraints** - Column nào bắt buộc phải có giá trị?
3. ✅ **Foreign keys** - References đến bảng nào? ON DELETE CASCADE hay RESTRICT?
4. ✅ **Default values** - Column nào có giá trị mặc định?
5. ✅ **CHECK constraints** - Đặc biệt cho các enum columns:
   - `events.event_type`: `home_match`, `away_match`, `training`, `other`
   - `events.event_status`: `active` (hoặc `scheduled`?), `cancelled`, `completed`
   - `event_invitations.invitation_status`: `pending`, `sent`, `accepted`, `declined`, `maybe`
   - `team_members.member_status`: `active`, `inactive` (hoặc các giá trị khác?)
6. ✅ **Unique constraints** - Có composite unique nào không? (ví dụ: event_id + user_id)

## 🔍 Cách Gửi Schema (Chọn 1 trong 4 cách)

### **Cách 1: SQL DDL (Khuyến nghị nhất)**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('home_match', 'away_match', 'training', 'other')),
  event_status TEXT NOT NULL DEFAULT 'active' CHECK (event_status IN ('active', 'cancelled', 'completed')),
  -- ... các columns khác
);
```

### **Cách 2: Supabase Dashboard Screenshot**
- Chụp màn hình từ Supabase Dashboard → Table Editor
- Bao gồm tất cả columns, types, và constraints

### **Cách 3: Migration Files**
- Nếu có Supabase migration files, gửi các file đó

### **Cách 4: pg_dump Schema Only**
```bash
pg_dump --schema-only --table=events --table=event_invitations --table=event_squads --table=team_members --table=team_admins --table=profiles > schema.sql
```

## ⚠️ Lưu Ý Quan Trọng

1. **Enum Values:** Cần chính xác các giá trị có thể (ví dụ: `event_status` có phải là `'active'` hay `'scheduled'`?)
2. **Foreign Keys:** Cần biết ON DELETE action (CASCADE hay RESTRICT?)
3. **Nullable Columns:** Cần biết column nào có thể NULL
4. **Auto-Generated:** Cần biết column nào tự động generate (id, created_at, updated_at)

## 📧 Sau Khi Gửi Schema

Tôi sẽ:
- ✅ So sánh schema với mocks trong tests
- ✅ Kiểm tra constraints có đúng không
- ✅ Thêm/sửa test cases nếu cần
- ✅ Đảm bảo tests thực sự bắt được lỗi

---

**File chi tiết:** Xem `docs/testing/SCHEMA_CHECKLIST.md` để biết thêm chi tiết.

