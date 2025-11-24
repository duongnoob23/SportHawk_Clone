# Tại Sao Tests Pass Khi Có Console.Error?

## Vấn Đề

Bạn đang thấy nhiều `console.error` trong terminal output và nghĩ rằng nếu có error thì test phải fail. Nhưng thực tế:

## Giải Thích

### 1. Tests Expect Errors và Pass Khi Có Error - Điều Này Là ĐÚNG

**Ví dụ:**
```typescript
// Test Case: getEventSquad_WhenEventIdIsNull_ReturnsFailure
it('getEventSquad_WhenEventIdIsNull_ReturnsFailure', async () => {
  const mockError = {
    message: 'null value in column "event_id" violates not-null constraint',
    code: '23502',
  };

  // Mock trả về error
  const mockSelect = jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    }),
  });

  // Test EXPECT ERROR và catch được error
  await expect(getEventSquad({ eventId: null })).rejects.toEqual(mockError);
  // ✅ PASS - Vì test expect error và catch được error
});
```

**Kết quả:**
- Code throw error: `console.error('Failed to get squad members:', error)`
- Test expect error: `await expect(...).rejects.toEqual(mockError)`
- Test PASS ✅ (vì test expect error và catch được error)

### 2. Console.Error Chỉ Là Logging - Không Ảnh Hưởng Đến Kết Quả Test

**Code:**
```typescript
export const getEventSquad = async (payload: EventSquadData) => {
  try {
    // ... query ...
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get squad members:', error); // ← Chỉ là logging
    throw error; // ← Throw error để test catch
  }
};
```

**Test:**
```typescript
await expect(getEventSquad({ eventId: null })).rejects.toEqual(mockError);
// ✅ PASS - Vì test expect error và catch được error
```

**Giải thích:**
- `console.error` chỉ log error ra terminal
- Test vẫn pass vì test expect error và catch được error
- `console.error` không làm test fail

### 3. Khi Nào Test Sẽ Fail?

Test sẽ FAIL khi:
1. **Test expect success nhưng code throw error:**
   ```typescript
   // ❌ FAIL - Test expect success nhưng code throw error
   const result = await getEventSquad({ eventId: null });
   expect(result).toBeDefined(); // ← Sẽ fail vì code throw error
   ```

2. **Test expect error nhưng code không throw error:**
   ```typescript
   // ❌ FAIL - Test expect error nhưng code không throw error
   await expect(getEventSquad({ eventId: 'valid-id' })).rejects.toEqual(mockError);
   // ← Sẽ fail vì code không throw error
   ```

## Chứng Minh Tests Có Thể Fail

Tôi đã tạo các "proof test cases" để chứng minh tests có thể fail:

1. `getEventSquad_WhenEventIdIsNullButExpectSuccess_ShouldFail` - ❌ FAIL
2. `getUpdateEventInvitationHandGesture_WhenIdIsNullButExpectSuccess_ShouldFail` - ❌ FAIL

Các test cases này:
- Input: Data vi phạm constraints (null eventId, null id)
- Expected: Test expect success
- Kết quả: FAIL ✅ (chứng minh tests hoạt động đúng)

## Kết Luận

1. **Tests expect errors và pass khi có error** - Điều này là ĐÚNG ✅
2. **`console.error` chỉ là logging** - Không ảnh hưởng đến kết quả test
3. **Tests có thể fail** - Đã chứng minh bằng proof test cases

## Các Test Cases Hiện Tại

Tất cả các test cases hiện tại đều ĐÚNG:
- Test cases expect errors → Pass khi có error ✅
- Test cases expect success → Pass khi không có error ✅
- `console.error` chỉ là logging → Không ảnh hưởng kết quả ✅


