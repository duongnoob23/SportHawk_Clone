# Cấu Trúc Test Suite - Event & Teams APIs

## 📁 Cấu Trúc Thư Mục

```
tests/                          # Folder test ở ngoài cùng
├── event/                      # Tests cho Event APIs
│   ├── getEventDetail.test.ts  ✅ Đã có (5 test cases)
│   ├── createEvent.test.ts     ✅ Đã có (7 test cases)
│   ├── deleteEvent.test.ts     ✅ Đã có (6 test cases)
│   ├── updateEventById.test.ts ⏳ Chưa có
│   ├── getEventSquad.test.ts   ⏳ Chưa có
│   └── ...
└── teams/                      # Tests cho Teams APIs
    ├── getTeam.test.ts         ⏳ Chưa có
    ├── getTeamMembers.test.ts  ⏳ Chưa có
    └── ...
```

## 📋 Format Test Case

Mỗi test case tuân theo format trong bảng:

| STT | Chức năng | Lớp điều khiển | Phương thức | Test case | Mục tiêu | Input | Expected Output | Kết quả |
|-----|-----------|----------------|-------------|-----------|---------|-------|----------------|---------|
| 1 | ... | ... | ... | ... | ... | ... | ... | P/F |

### Ví dụ trong code:

```typescript
/**
 * Test Case 1: getEventDetail_WhenEventExists_ReturnsSuccess
 * 
 * STT: 1
 * Chức năng: Tìm kiếm event theo ID
 * Test case: getEventDetail_WhenEventExists_ReturnsSuccess
 * Mục tiêu: Kiểm tra phương thức getEventDetail thành công khi event tồn tại
 * Input: { eventId: 'event-123', userId: 'user-123', teamId: 'team-123' }
 * Expected Output: Trả về thông tin event đầy đủ
 * Kết quả: P (Pass)
 * 
 * DB Check:
 * - Kiểm tra record được đọc từ bảng events
 * - Kiểm tra event_invitations được filter đúng
 */
it('getEventDetail_WhenEventExists_ReturnsSuccess', async () => {
  // Test code...
});
```

## ✅ Yêu Cầu Test Cases

### 1. **Comment Đầy Đủ**
- Mỗi test case có comment mô tả đầy đủ
- Comment theo format bảng (STT, Chức năng, Test case, Mục tiêu, Input, Expected Output)

### 2. **Đặt Tên Có Ý Nghĩa**
- Test case name: `methodName_WhenCondition_ReturnsResult`
- Biến: `mockEventId`, `mockUserId`, `mockTeamId`
- Hàm: `setupMocks()`, `verifyDatabaseUpdate()`

### 3. **Check Expected Output**
- Kiểm tra return value đúng
- Kiểm tra error được throw đúng
- Kiểm tra data structure đúng

### 4. **Check Database Operations**
- **Read**: Kiểm tra query được gọi với đúng parameters
- **Add**: Kiểm tra insert được gọi với đúng data
- **Delete**: Kiểm tra delete được gọi với đúng conditions
- **Change**: Kiểm tra update được gọi với đúng values

### 5. **Edge Cases**
Mỗi API phải test:
- ✅ ID tồn tại
- ✅ ID không tồn tại
- ✅ ID là null
- ✅ ID là empty string
- ✅ Invalid input
- ✅ Database error

## 🚀 Lệnh Chạy Tests

### Chạy tất cả tests:
```bash
npm test
```

### Chạy tests của Event:
```bash
npm test tests/event
# hoặc
npm run test:event
```

### Chạy tests của Teams:
```bash
npm test tests/teams
# hoặc
npm run test:teams
```

### Chạy một test file cụ thể:
```bash
npm test tests/event/getEventDetail.test.ts
```

### Chạy với watch mode:
```bash
npm run test:watch
```

### Chạy với coverage:
```bash
npm run test:coverage
```

## 📊 Test Coverage Goals

- **Event APIs**: 100% test cases
- **Teams APIs**: 100% test cases
- **Edge Cases**: Đủ các trường hợp đặc biệt

## 📝 Checklist Khi Viết Test

- [ ] Comment đầy đủ theo format bảng
- [ ] Đặt tên biến/hàm có ý nghĩa
- [ ] Test đủ edge cases (null, empty, invalid, not found)
- [ ] Check expected output
- [ ] Check database operations (read/add/delete/change)
- [ ] Mock Supabase client đúng cách
- [ ] Clean up mocks trong beforeEach/afterEach

