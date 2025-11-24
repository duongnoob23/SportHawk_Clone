# Mock Validation Issues - So Sánh Schema Với Mocks

## 🚨 Vấn Đề: Mocks Đang Bỏ Qua Constraints

### **1. event_status Constraint**

**Schema:**
- `event_status` chỉ có thể là: `'active'`, `'cancelled'`, `'completed'`
- Default: `'active'`

**Vấn đề trong Tests:**
- `createEvent.test.ts` line 52: `event_status: 'scheduled'` ❌ (KHÔNG TỒN TẠI trong schema)
- Mocks không kiểm tra constraint này

**Cần sửa:**
- Đổi `'scheduled'` thành `'active'` trong mock data
- Thêm test case cho invalid `event_status` → Should fail với CHECK constraint error

---

### **2. cancelled_reason Constraint**

**Schema:**
```sql
constraint events_cancelled_reason_required check (
  (
    ((event_status)::text = 'cancelled'::text)
    and (cancelled_reason is not null)
  )
  or (
    ((event_status)::text <> 'cancelled'::text)
    and (cancelled_reason is null)
  )
)
```

**Vấn đề trong Tests:**
- `deleteEvent.test.ts` line 7, 15: Tests cho phép `reason` null/empty khi cancel event ❌
- Mocks không kiểm tra constraint này - luôn trả về success

**Cần sửa:**
- Sửa test cases 7, 8 trong `deleteEvent.test.ts`:
  - Khi `event_status = 'cancelled'` nhưng `cancelled_reason = null` → Should fail với CHECK constraint error
  - Khi `event_status = 'cancelled'` nhưng `cancelled_reason = ''` → Should fail với CHECK constraint error

---

### **3. end_time > start_time Constraint**

**Schema:**
```sql
constraint events_end_after_start check (
  (
    (end_time is null)
    or (end_time > start_time)
  )
)
```

**Vấn đề trong Tests:**
- `createEvent.test.ts`: Mock data có `start_time: '14:00:00'`, `end_time: '16:00:00'` ✅ (OK)
- Nhưng KHÔNG có test case cho `end_time <= start_time` → Should fail
- Mocks không kiểm tra constraint này

**Cần sửa:**
- Thêm test case trong `createEvent.test.ts`: Khi `end_time <= start_time` → Mock should return CHECK constraint error
- Thêm test case trong `updateEventById.test.ts`: Khi `end_time <= start_time` → Mock should return CHECK constraint error

---

### **4. max_participants > 0 Constraint**

**Schema:**
```sql
constraint events_max_participants_positive check (
  (
    (max_participants is null)
    or (max_participants > 0)
  )
)
```

**Vấn đề trong Tests:**
- KHÔNG có test case cho `max_participants <= 0` → Should fail
- Mocks không kiểm tra constraint này

**Cần sửa:**
- Thêm test case trong `createEvent.test.ts`: Khi `max_participants <= 0` → Mock should return CHECK constraint error
- Thêm test case trong `updateEventById.test.ts`: Khi `max_participants <= 0` → Mock should return CHECK constraint error

---

### **5. UNIQUE Constraint: event_invitations (event_id, user_id)**

**Schema:**
```sql
constraint event_invitations_unique unique (event_id, user_id)
```

**Vấn đề trong Tests:**
- `createEvent.test.ts` line 307-378: Test tạo invitations cho members nhưng KHÔNG kiểm tra duplicate
- `upsertInvitations.test.ts`: Test insert invitations nhưng KHÔNG kiểm tra duplicate
- `updateEventById.test.ts`: Test add members nhưng KHÔNG kiểm tra duplicate
- Mocks luôn trả về success, không kiểm tra UNIQUE constraint

**Cần sửa:**
- Thêm test case trong `createEvent.test.ts`: Khi insert duplicate invitation (cùng event_id + user_id) → Mock should return UNIQUE constraint error
- Thêm test case trong `upsertInvitations.test.ts`: Khi insert duplicate invitation → Mock should return UNIQUE constraint error
- Thêm test case trong `updateEventById.test.ts`: Khi add duplicate member → Mock should return UNIQUE constraint error

---

### **6. UNIQUE Constraint: event_squads (event_id, user_id)**

**Schema:**
```sql
constraint event_squads_unique unique (event_id, user_id)
```

**Vấn đề trong Tests:**
- `getUpsertEventsquad.test.ts`: Test upsert squad members nhưng KHÔNG kiểm tra duplicate
- Mocks luôn trả về success, không kiểm tra UNIQUE constraint

**Cần sửa:**
- Thêm test case trong `getUpsertEventsquad.test.ts`: Khi insert duplicate squad member → Mock should return UNIQUE constraint error

---

### **7. event_type Constraint**

**Schema:**
```sql
constraint events_event_type_check check (
  (
    (event_type)::text = any (
      (
        array[
          'home_match'::character varying,
          'away_match'::character varying,
          'training'::character varying,
          'other'::character varying,
          'match'::character varying,
          'social'::character varying,
          'meeting'::character varying
        ]
      )::text[]
    )
  )
)
```

**Vấn đề trong Tests:**
- Tests sử dụng `'home_match'`, `'away_match'`, `'training'`, `'other'` ✅ (OK)
- Nhưng KHÔNG có test case cho invalid `event_type` → Should fail

**Cần sửa:**
- Thêm test case trong `createEvent.test.ts`: Khi `event_type = 'invalid_type'` → Mock should return CHECK constraint error
- Thêm test case trong `updateEventById.test.ts`: Khi `event_type = 'invalid_type'` → Mock should return CHECK constraint error

---

### **8. member_status Constraint**

**Schema:**
```sql
constraint team_members_member_status_check check (
  (
    (member_status)::text = any (
      (
        array[
          'active'::character varying,
          'inactive'::character varying,
          'suspended'::character varying,
          'injured'::character varying
        ]
      )::text[]
    )
  )
)
```

**Vấn đề trong Tests:**
- Tests filter `member_status = 'active'` ✅ (OK)
- Nhưng KHÔNG có test case cho invalid `member_status` → Should fail

**Cần sửa:**
- Thêm test case trong `getTeamMembersSimple.test.ts`: Khi query với invalid `member_status` → Mock should return CHECK constraint error

---

## 📋 Tổng Kết Các Vấn Đề

### **Mocks Đang Bỏ Qua:**
1. ❌ `event_status = 'scheduled'` (không tồn tại trong schema)
2. ❌ `cancelled_reason` required khi `event_status = 'cancelled'`
3. ❌ `end_time > start_time` constraint
4. ❌ `max_participants > 0` constraint
5. ❌ UNIQUE constraint `event_invitations (event_id, user_id)`
6. ❌ UNIQUE constraint `event_squads (event_id, user_id)`
7. ❌ Invalid `event_type` values
8. ❌ Invalid `member_status` values

### **Cần Sửa:**
1. Sửa mock data: `event_status: 'scheduled'` → `'active'`
2. Sửa test cases: `deleteEvent.test.ts` - không cho phép `cancelled_reason = null` khi cancel
3. Thêm test cases cho các constraints bị bỏ qua
4. Sửa mocks để trả về error khi vi phạm constraints

