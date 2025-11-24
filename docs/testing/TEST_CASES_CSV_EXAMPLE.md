# Đề Xuất Các Cột CSV Cho Jest/Node.js Test Cases

## 📋 Các Cột Đề Xuất

### Cột Cơ Bản (Từ Jira):
1. **STT** - Số thứ tự test case
2. **Chức năng** - Mô tả chức năng đang test (ví dụ: "Tạo event mới")
3. **Lớp điều khiển** - File path (ví dụ: `features/event/api/event.ts`)
4. **Phương thức** - Function name (ví dụ: `createEvent`)
5. **Test case** - Tên test case (ví dụ: `createEvent_WhenValidInput_ReturnsSuccess`)
6. **Mục tiêu** - Mục đích test (ví dụ: "Kiểm tra phương thức createEvent thành công khi input hợp lệ")
7. **Input** - Input data dưới dạng JSON
8. **Output** - Actual output dưới dạng JSON (nếu có)
9. **Expected Output** - Expected output dưới dạng JSON
10. **Kết quả** - PASS/FAIL/SKIP

### Cột Bổ Sung Cho Jest/Node.js:
11. **Test Suite** - Tên describe block (ví dụ: `createEvent API`)
12. **Test Type** - Loại test: `Positive` / `Negative` / `Edge Case` / `Integration`
13. **Error Code** - Error code nếu test fail (ví dụ: `23502`, `23503`, `23514`)
14. **Error Message** - Error message nếu test fail
15. **DB Check** - Mô tả kiểm tra database (ví dụ: "Kiểm tra record được insert vào bảng events")
16. **Mock Setup** - Mô tả mock được setup (ví dụ: "Mock supabase.from().insert() trả về success")
17. **Constraint Tested** - Constraint được test (ví dụ: `NOT NULL`, `UNIQUE`, `CHECK`, `FOREIGN KEY`)
18. **Edge Case Description** - Mô tả edge case nếu có (ví dụ: "end_time < start_time")

## 📝 Ví Dụ 1 Hàng

| STT | Test Suite | Test Case Name | Chức năng | Lớp điều khiển | Phương thức | Mục tiêu | Input | Expected Output | Actual Output | Kết quả | Test Type | Error Code | Error Message | DB Check | Mock Setup | Constraint Tested | Edge Case Description |
|-----|------------|----------------|-----------|----------------|-------------|----------|-------|-----------------|--------------|---------|-----------|------------|---------------|----------|------------|-------------------|---------------------|
| 1 | createEvent API | createEvent_WhenValidInput_ReturnsSuccess | Tạo event mới | features/event/api/event.ts | createEvent | Kiểm tra phương thức createEvent thành công khi input hợp lệ | {"data": {"team_id": "team-123", "title": "Test Match", "event_type": "home_match", "event_date": "2025-12-25", "start_time": "14:00:00", "end_time": "16:00:00", "location_name": "Test Stadium", "location_address": "123 Test St", "description": "Test description", "event_status": "active"}, "userId": "user-123"} | {"success": true, "eventId": "event-123"} | {"success": true, "eventId": "event-123"} | PASS | Positive | - | - | Kiểm tra record mới được insert vào bảng events với đúng team_id, created_by, title | Mock supabase.from('events').insert() trả về {data: {id: 'event-123', ...}, error: null} | - | - |

## 📝 Ví Dụ 1 Hàng (Negative Test)

| STT | Test Suite | Test Case Name | Chức năng | Lớp điều khiển | Phương thức | Mục tiêu | Input | Expected Output | Actual Output | Kết quả | Test Type | Error Code | Error Message | DB Check | Mock Setup | Constraint Tested | Edge Case Description |
|-----|------------|----------------|-----------|----------------|-------------|----------|-------|-----------------|--------------|---------|-----------|------------|---------------|----------|------------|-------------------|---------------------|
| 2 | createEvent API | createEvent_WhenTeamIdIsNull_ReturnsFailure | Tạo event mới | features/event/api/event.ts | createEvent | Kiểm tra phương thức createEvent thất bại khi teamId là null | {"data": {"team_id": null, "title": "Test Match", "event_type": "home_match", "event_date": "2025-12-25", "start_time": "14:00:00", "end_time": "16:00:00", "location_name": "Test Stadium", "event_status": "active"}, "userId": "user-123"} | {"error": {"code": "23502", "message": "null value in column \"team_id\" violates not-null constraint"}} | {"error": {"code": "23502", "message": "null value in column \"team_id\" violates not-null constraint"}} | PASS | Negative | 23502 | null value in column "team_id" violates not-null constraint | Kiểm tra không có record nào được insert vào bảng events | Mock supabase.from('events').insert() trả về {data: null, error: {code: '23502', message: '...'}} | NOT NULL | team_id = null |

## 📝 Ví Dụ 1 Hàng (Edge Case Test)

| STT | Test Suite | Test Case Name | Chức năng | Lớp điều khiển | Phương thức | Mục tiêu | Input | Expected Output | Actual Output | Kết quả | Test Type | Error Code | Error Message | DB Check | Mock Setup | Constraint Tested | Edge Case Description |
|-----|------------|----------------|-----------|----------------|-------------|----------|-------|-----------------|--------------|---------|-----------|------------|---------------|----------|------------|-------------------|---------------------|
| 8 | createEvent API | createEvent_WhenEndTimeBeforeStartTime_ReturnsFailure | Tạo event mới | features/event/api/event.ts | createEvent | Kiểm tra phương thức createEvent thất bại khi end_time < start_time | {"data": {"team_id": "team-123", "title": "Test Match", "event_type": "home_match", "event_date": "2025-12-25", "start_time": "14:00:00", "end_time": "13:00:00", "location_name": "Test Stadium", "event_status": "active"}, "userId": "user-123"} | {"error": {"code": "23514", "message": "new row for relation \"events\" violates check constraint \"events_end_after_start\""}} | {"error": {"code": "23514", "message": "new row for relation \"events\" violates check constraint \"events_end_after_start\""}} | PASS | Edge Case | 23514 | new row for relation "events" violates check constraint "events_end_after_start" | Kiểm tra không có record nào được insert vào bảng events | Mock với smart mock validateEndTimeAfterStartTime() trả về error | CHECK (end_time > start_time) | end_time = '13:00:00' < start_time = '14:00:00' |

## 🎯 Giải Thích Các Cột

### Input (JSON Format):
```json
{
  "data": {
    "team_id": "team-123",
    "title": "Test Match",
    "event_type": "home_match",
    "event_date": "2025-12-25",
    "start_time": "14:00:00",
    "end_time": "16:00:00",
    "location_name": "Test Stadium",
    "event_status": "active"
  },
  "userId": "user-123"
}
```

### Expected Output (JSON Format):
- **Success case:**
```json
{
  "success": true,
  "eventId": "event-123"
}
```

- **Error case:**
```json
{
  "error": {
    "code": "23502",
    "message": "null value in column \"team_id\" violates not-null constraint",
    "details": "Failing row contains (null, ...)"
  }
}
```

### Actual Output (JSON Format):
- Giống Expected Output nếu test PASS
- Khác Expected Output nếu test FAIL

## 📊 Tổng Kết

**Các cột quan trọng nhất:**
1. ✅ **Mục tiêu** - Mô tả rõ ràng mục đích test
2. ✅ **Input** - JSON format với đầy đủ tham số
3. ✅ **Expected Output** - JSON format với kết quả mong đợi
4. ✅ **Actual Output** - JSON format với kết quả thực tế
5. ✅ **Kết quả** - PASS/FAIL/SKIP
6. ✅ **Error Code/Message** - Nếu test fail
7. ✅ **Constraint Tested** - Nếu test constraint
8. ✅ **Edge Case Description** - Nếu là edge case

**Các cột bổ sung hữu ích:**
- Test Type - Phân loại test
- DB Check - Kiểm tra database
- Mock Setup - Mô tả mock

