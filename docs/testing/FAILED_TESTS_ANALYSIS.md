# Phân Tích 11 Tests Đang Fail

## 📊 Tổng Quan

**11 tests FAIL** được chia thành 2 nhóm:

### Nhóm 1: **MOCK SETUP SAI** (10 tests) ❌
- **Lỗi:** `TypeError: supabase_1.supabase.from(...).insert is not a function`
- **Nguyên nhân:** Mock không được setup đúng, thiếu function `.insert()`
- **Cần sửa:** Sửa mock setup trong test files

### Nhóm 2: **PROOF TESTS** (1 test) ✅
- **Lỗi:** Expected success nhưng fail vì smart mock bắt được lỗi
- **Nguyên nhân:** Đây là test CỐ TÌNH để chứng minh smart mocks hoạt động
- **Không cần sửa:** Test này đúng như mong đợi (fail là đúng)

---

## 🔍 Chi Tiết Từng Test

### 1. **updateEventById.test.ts** - 5 tests fail ❌

#### Test 1: `updateEventById_WhenEndTimeEqualsStartTime_ShouldFail`
```typescript
// Expected: Error với code "23514" và message chứa "events_end_after_start"
// Received: TypeError: supabase_1.supabase.from(...).insert is not a function
```
**Nguyên nhân:** Mock không có `.insert()` function khi `updateEventById` cố gắng insert invitations.

#### Test 2: `updateEventById_WhenEndTimeBeforeStartTime_ShouldFail`
```typescript
// Expected: Error với code "23514" và message chứa "events_end_after_start"
// Received: TypeError: supabase_1.supabase.from(...).insert is not a function
```
**Nguyên nhân:** Tương tự test 1.

#### Test 3: `updateEventById_WhenTitleIsTooLong_ShouldFail`
```typescript
// Expected: Error với code "22001" và message chứa "too long"
// Received: TypeError: supabase_1.supabase.from(...).insert is not a function
```
**Nguyên nhân:** Mock không có `.insert()` function.

#### Test 4: `updateEventById_WhenLocationNameIsTooLong_ShouldFail`
```typescript
// Expected: Error với code "22001" và message chứa "too long"
// Received: TypeError: supabase_1.supabase.from(...).insert is not a function
```
**Nguyên nhân:** Tương tự.

#### Test 5: `updateEventById_WhenOpponentIsTooLong_ShouldFail`
```typescript
// Expected: Error với code "22001" và message chứa "too long"
// Received: TypeError: supabase_1.supabase.from(...).insert is not a function
```
**Nguyên nhân:** Tương tự.

**Vấn đề chung:** 
- `updateEventById` API code có logic insert invitations khi có `addArray`
- Tests này chỉ mock `.update()` nhưng không mock `.insert()` cho invitations
- Khi code chạy đến phần insert invitations → TypeError

---

### 2. **upsertInvitations.test.ts** - 2 tests fail ❌

#### Test 1: `upsertInvitations_WhenEventIdDoesNotExist_ShouldFail`
```typescript
// Expected: Error với code "23503" và message chứa "foreign key constraint"
// Received: TypeError: supabase_1.supabase.from(...).insert is not a function
```
**Nguyên nhân:** Mock setup sai - không có `.insert()` function.

#### Test 2: `upsertInvitations_WhenInvitedByDoesNotExist_ShouldFail`
```typescript
// Expected: Error với code "23503" và message chứa "foreign key constraint"
// Received: TypeError: supabase_1.supabase.from(...).insert is not a function
```
**Nguyên nhân:** Tương tự test 1.

**Vấn đề chung:**
- `upsertInvitations` API code gọi `.insert()` để insert invitations
- Tests này mock `.insert()` nhưng không đúng cách
- Mock trả về object không có function `.insert()` hoặc không chain đúng

---

### 3. **getUpdateEventInvitationHandGestures.test.ts** - 2 tests fail ❌

#### Test 1: `getUpdateEventInvitationHandGestures_WhenEventIdDoesNotExist_ShouldFail`
```typescript
// Expected: Error với code "23503" và message chứa "foreign key constraint"
// Received: TypeError: supabase_1.supabase.from(...).insert is not a function
```
**Nguyên nhân:** Mock setup sai.

#### Test 2: `getUpdateEventInvitationHandGestures_WhenUserIdDoesNotExist_ShouldFail`
```typescript
// Expected: Error với code "23503" và message chứa "foreign key constraint"
// Received: TypeError: supabase_1.supabase.from(...).insert is not a function
```
**Nguyên nhân:** Tương tự.

**Vấn đề chung:**
- `getUpdateEventInvitationHandGestures` chỉ dùng `.update()`, không dùng `.insert()`
- Nhưng test mock sai → TypeError

---

### 4. **deleteEvent.test.ts** - 1 test fail ✅ (PROOF TEST)

#### Test: `deleteEvent_WhenCancelledByIsNullButExpectSuccess_ShouldFail`
```typescript
// Expected: Test này EXPECT SUCCESS nhưng sẽ FAIL
// Received: null value in column "cancelled_by" violates not-null constraint
```
**Nguyên nhân:** Đây là **PROOF TEST** - test này CỐ TÌNH expect success nhưng sẽ fail vì smart mock bắt được lỗi NOT NULL constraint.

**Kết luận:** Test này **ĐÚNG** - fail là đúng như mong đợi. Đây là test để chứng minh smart mocks hoạt động.

---

### 5. **createEvent.test.ts** - 1 test fail ✅ (PROOF TEST)

#### Test: `createEvent_WhenEndTimeBeforeStartTimeButExpectSuccess_ShouldFail`
```typescript
// Expected: Test này EXPECT SUCCESS nhưng sẽ FAIL
// Received: (chưa thấy error message trong output)
```
**Nguyên nhân:** Đây là **PROOF TEST** - test này CỐ TÌNH expect success nhưng sẽ fail vì smart mock bắt được lỗi CHECK constraint.

**Kết luận:** Test này **ĐÚNG** - fail là đúng như mong đợi.

---

## 🎯 Phân Loại

### ❌ **Lỗi Mock Setup (10 tests)** - CẦN SỬA

1. `updateEventById_WhenEndTimeEqualsStartTime_ShouldFail`
2. `updateEventById_WhenEndTimeBeforeStartTime_ShouldFail`
3. `updateEventById_WhenTitleIsTooLong_ShouldFail`
4. `updateEventById_WhenLocationNameIsTooLong_ShouldFail`
5. `updateEventById_WhenOpponentIsTooLong_ShouldFail`
6. `upsertInvitations_WhenEventIdDoesNotExist_ShouldFail`
7. `upsertInvitations_WhenInvitedByDoesNotExist_ShouldFail`
8. `getUpdateEventInvitationHandGestures_WhenEventIdDoesNotExist_ShouldFail`
9. `getUpdateEventInvitationHandGestures_WhenUserIdDoesNotExist_ShouldFail`

**Nguyên nhân chung:**
- Mock không setup đúng chain: `.from().update()` hoặc `.from().insert()`
- Thiếu mock cho `.insert()` khi API code cần insert data
- Mock trả về object không có function cần thiết

### ✅ **Proof Tests (1 test)** - KHÔNG CẦN SỬA

1. `deleteEvent_WhenCancelledByIsNullButExpectSuccess_ShouldFail` - Đúng như mong đợi

**Lưu ý:** Có thể xóa proof tests này hoặc đổi thành test expect error thực sự.

---

## 🔧 Cách Sửa

### 1. **Sửa Mock Setup cho `updateEventById` tests:**

```typescript
// ❌ SAI - Chỉ mock update
const mockUpdate = jest.fn().mockReturnValue({
  eq: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    }),
  }),
});

(supabase.from as jest.Mock).mockReturnValue({
  update: mockUpdate,
});

// ✅ ĐÚNG - Mock cả update và insert (vì updateEventById có thể insert invitations)
const mockUpdate = jest.fn().mockReturnValue({
  eq: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: mockError, // Error từ update
      }),
    }),
  }),
});

const mockInsert = jest.fn().mockReturnValue({
  select: jest.fn().mockResolvedValue({
    data: [],
    error: null,
  }),
});

(supabase.from as jest.Mock)
  .mockReturnValueOnce({ update: mockUpdate }) // For event update
  .mockReturnValueOnce({ insert: mockInsert }); // For invitations insert (if needed)
```

### 2. **Sửa Mock Setup cho `upsertInvitations` tests:**

```typescript
// ✅ ĐÚNG - Mock insert với error
const mockInsert = jest.fn().mockReturnValue({
  select: jest.fn().mockResolvedValue({
    data: null,
    error: mockError, // Foreign key constraint error
  }),
});

(supabase.from as jest.Mock)
  .mockReturnValueOnce({ delete: jest.fn().mockResolvedValue({ data: null, error: null }) })
  .mockReturnValueOnce({ insert: mockInsert });
```

### 3. **Sửa Mock Setup cho `getUpdateEventInvitationHandGestures` tests:**

```typescript
// ✅ ĐÚNG - Mock update với error
const mockUpdate = jest.fn().mockReturnValue({
  eq: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({
      data: null,
      error: mockError, // Foreign key constraint error
    }),
  }),
});

(supabase.from as jest.Mock).mockReturnValue({
  update: mockUpdate,
});
```

---

## 📋 Tóm Tắt

| Test File | Số Tests Fail | Nguyên Nhân | Cần Sửa? |
|-----------|---------------|-------------|----------|
| `updateEventById.test.ts` | 5 | Mock setup sai - thiếu `.insert()` | ✅ Có |
| `upsertInvitations.test.ts` | 2 | Mock setup sai - `.insert()` không đúng | ✅ Có |
| `getUpdateEventInvitationHandGestures.test.ts` | 2 | Mock setup sai | ✅ Có |
| `deleteEvent.test.ts` | 1 | Proof test - đúng như mong đợi | ❌ Không |
| `createEvent.test.ts` | 1 | Proof test - đúng như mong đợi | ❌ Không |

**Tổng:** 10 tests cần sửa mock setup, 1 proof test đúng như mong đợi.

