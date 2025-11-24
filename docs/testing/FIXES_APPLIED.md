# Fixes Applied - Sửa Mocks Để Phản Ánh Đúng Schema

## ✅ Đã Sửa

### **1. event_status: 'scheduled' → 'active'**

**File:** `tests/event/createEvent.test.ts`
- **Line 52:** Đổi `event_status: 'scheduled'` thành `event_status: 'active'`
- **Lý do:** Schema chỉ cho phép: `'active'`, `'cancelled'`, `'completed'`

---

## ⚠️ Vấn Đề Còn Lại: Mocks Đang Quá "Tốt Bụng"

### **Vấn Đề Chính:**

Các mocks hiện tại **luôn trả về success**, không kiểm tra các constraints của database. Điều này khiến tests pass ngay cả khi vi phạm constraints.

### **Các Constraints Bị Bỏ Qua:**

1. **UNIQUE Constraint: `event_invitations (event_id, user_id)`**
   - Tests không kiểm tra duplicate invitations
   - Mocks luôn trả về success khi insert duplicate

2. **UNIQUE Constraint: `event_squads (event_id, user_id)`**
   - Tests không kiểm tra duplicate squad members
   - Mocks luôn trả về success khi insert duplicate

3. **CHECK Constraint: `end_time > start_time`**
   - Tests không kiểm tra `end_time <= start_time`
   - Mocks luôn trả về success

4. **CHECK Constraint: `max_participants > 0`**
   - Tests không kiểm tra `max_participants <= 0`
   - Mocks luôn trả về success

5. **CHECK Constraint: `cancelled_reason` required khi `event_status = 'cancelled'`**
   - Code tự động set default `'Cancel Event'` nếu reason null/empty (line 652 trong `deleteEvent`)
   - Tests đúng với logic này

---

## 🔍 Phân Tích Chi Tiết

### **1. UNIQUE Constraint: event_invitations**

**Schema:**
```sql
constraint event_invitations_unique unique (event_id, user_id)
```

**Vấn đề:**
- `createEvent.test.ts` line 307-378: Test tạo invitations nhưng không kiểm tra duplicate
- `upsertInvitations.test.ts`: Test insert invitations nhưng không kiểm tra duplicate
- `updateEventById.test.ts`: Test add members nhưng không kiểm tra duplicate

**Mocks hiện tại:**
```typescript
const mockInsert = jest.fn().mockResolvedValue({
  data: null,
  error: null, // ❌ Luôn trả về success
});
```

**Cần sửa:**
Mocks cần kiểm tra duplicate và trả về error:
```typescript
const mockInsert = jest.fn().mockImplementation((data) => {
  // Kiểm tra duplicate (event_id, user_id)
  if (isDuplicate(data)) {
    return Promise.resolve({
      data: null,
      error: {
        message: 'duplicate key value violates unique constraint "event_invitations_unique"',
        code: '23505',
        details: `Key (event_id, user_id)=(${data.event_id}, ${data.user_id}) already exists.`,
      },
    });
  }
  return Promise.resolve({ data: null, error: null });
});
```

---

### **2. UNIQUE Constraint: event_squads**

**Schema:**
```sql
constraint event_squads_unique unique (event_id, user_id)
```

**Vấn đề:**
- `getUpsertEventsquad.test.ts`: Test upsert squad members nhưng không kiểm tra duplicate
- Test case 7: `getUpsertEventsquad_WhenAddExistingMembers_SkipsDuplicates` - nhưng mock vẫn trả về success

**Cần sửa:**
Tương tự như `event_invitations`, mocks cần kiểm tra duplicate.

---

### **3. CHECK Constraint: end_time > start_time**

**Schema:**
```sql
constraint events_end_after_start check (
  (
    (end_time is null)
    or (end_time > start_time)
  )
)
```

**Vấn đề:**
- `createEvent.test.ts`: Mock data có `start_time: '14:00:00'`, `end_time: '16:00:00'` ✅ (OK)
- Nhưng KHÔNG có test case cho `end_time <= start_time` → Should fail

**Cần sửa:**
Thêm test case với mock error:
```typescript
const mockError = {
  message: 'new row for relation "events" violates check constraint "events_end_after_start"',
  code: '23514',
};
```

---

### **4. CHECK Constraint: max_participants > 0**

**Schema:**
```sql
constraint events_max_participants_positive check (
  (
    (max_participants is null)
    or (max_participants > 0)
  )
)
```

**Vấn đề:**
- KHÔNG có test case cho `max_participants <= 0` → Should fail

**Cần sửa:**
Thêm test case với mock error:
```typescript
const mockError = {
  message: 'new row for relation "events" violates check constraint "events_max_participants_positive"',
  code: '23514',
};
```

---

## 🎯 Kết Luận

### **Đã Sửa:**
- ✅ `event_status: 'scheduled'` → `'active'`

### **Cần Sửa (Nhưng Phức Tạp):**
- ❌ Mocks cần kiểm tra UNIQUE constraints
- ❌ Mocks cần kiểm tra CHECK constraints
- ❌ Thêm test cases cho các edge cases

### **Vấn Đề:**
Để tests thực sự bắt được lỗi, cần:
1. **Mock logic phức tạp hơn** - kiểm tra constraints trước khi trả về response
2. **Hoặc sử dụng integration tests** - test với database thực tế
3. **Hoặc chấp nhận rằng unit tests chỉ test logic, không test database constraints**

### **Khuyến Nghị:**
- **Unit tests:** Test logic của code, mocks đơn giản
- **Integration tests:** Test với database thực tế để kiểm tra constraints
- **Hoặc:** Tạo mock helper functions để validate constraints

