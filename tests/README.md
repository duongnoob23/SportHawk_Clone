# Test Suite - Event & Teams APIs

## 📁 Cấu Trúc

```
tests/
├── event/
│   ├── getEventDetail.test.ts      ✅ Đã có (5 test cases)
│   ├── createEvent.test.ts         ✅ Đã có (7 test cases)
│   ├── deleteEvent.test.ts         ✅ Đã có (6 test cases)
│   ├── updateEventById.test.ts     ⏳ Chưa có
│   ├── getEventSquad.test.ts       ⏳ Chưa có
│   └── ...
└── teams/
    ├── getTeam.test.ts             ⏳ Chưa có
    ├── getTeamMembers.test.ts     ⏳ Chưa có
    └── ...
```

## 🚀 Chạy Tests

### **Chạy tất cả tests:**

```bash
npm test
```

### **Chạy tests của Event:**

```bash
npm test tests/event
# hoặc
npm run test:event
```

### **Chạy tests của Teams:**

```bash
npm test tests/teams
# hoặc
npm run test:teams
```

### **Chạy một test file cụ thể:**

```bash
npm test tests/event/createEvent.test.ts
```

### **Chạy với watch mode (tự động chạy lại khi có thay đổi):**

```bash
npm run test:watch
```

### **Chạy với coverage:**

```bash
npm run test:coverage
```

### **Sử dụng PowerShell script (Windows):**

```powershell
# Chạy một file cụ thể
.\scripts\run-test.ps1 -TestPath "tests/event/createEvent.test.ts"

# Chạy với watch mode
.\scripts\run-test.ps1 -TestPath "tests/event" -Watch

# Chạy với coverage
.\scripts\run-test.ps1 -Coverage
```

## 📊 Hiểu Output

### **Khi Test Pass:**

```
PASS  tests/event/createEvent.test.ts
  createEvent API
    ✓ createEvent_WhenValidInput_ReturnsSuccess (15 ms)
    ✓ createEvent_WhenTeamIdIsNull_ReturnsFailure (8 ms)
    ✓ createEvent_WhenTitleIsEmpty_ReturnsFailure (7 ms)
    ✓ createEvent_WhenEventDateIsInvalid_ReturnsFailure (6 ms)
    ✓ createEvent_WhenDatabaseError_ReturnsFailure (5 ms)
    ✓ createEvent_WhenWithMembers_CreatesInvitations (12 ms)
    ✓ createEvent_WhenWithLeaders_CreatesLeaderInvitations (11 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        2.5 s
```

**Giải thích:**

- `Test Suites: 1 passed, 1 total` - Có 1 test file, tất cả đều pass
- `Tests: 7 passed, 7 total` - Có 7 test cases, tất cả đều pass
- `Time: 2.5 s` - Thời gian chạy

### **Khi Test Fail:**

```
FAIL  tests/event/createEvent.test.ts
  createEvent API
    ✓ createEvent_WhenValidInput_ReturnsSuccess (15 ms)
    ✕ createEvent_WhenTeamIdIsNull_ReturnsFailure (8 ms)

  ● createEvent API › createEvent_WhenTeamIdIsNull_ReturnsFailure

    expect(received).toEqual(expected)

    Expected: { message: 'null value...', code: '23502' }
    Received: { message: 'Different error', code: 'PGRST202' }

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
```

## ⚠️ Troubleshooting

### **Vấn đề: Chỉ chạy được 1 test thay vì nhiều tests**

**Nguyên nhân có thể:**

1. Test đầu tiên fail và dừng lại
2. Mock không được reset giữa các tests
3. Có lỗi syntax trong test file
4. Lỗi từ react-native jest setup

**Giải pháp:**

1. Kiểm tra test đầu tiên có pass không
2. Đảm bảo `beforeEach` có `jest.clearAllMocks()`
3. Chạy với `--verbose` để xem chi tiết:
   ```bash
   npm test tests/event/createEvent.test.ts -- --verbose
   ```
4. Clear cache và chạy lại:
   ```bash
   npm test -- --no-cache tests/event/createEvent.test.ts
   ```

### **Vấn đề: Không thấy progress khi chạy**

**Giải pháp:**

- Đã thêm `--verbose` vào tất cả scripts
- Bạn sẽ thấy từng test case chạy và kết quả
- Nếu vẫn không thấy, thử:
  ```bash
  npm test -- --verbose --no-coverage
  ```

### **Vấn đề: SyntaxError với react-native jest setup**

**Lỗi:**

```
SyntaxError: node_modules/react-native/jest/setup.js: Unexpected token, expected ","
```

**Giải pháp:**

- Đã cấu hình `transformIgnorePatterns` trong `jest.config.js`
- Nếu vẫn lỗi, thử:
  ```bash
  npm test -- --no-cache
  ```

## 📋 Test Coverage Goals

- **Event APIs**: 100% test cases cho mỗi API
- **Teams APIs**: 100% test cases cho mỗi API
- **Edge Cases**: Test đủ các trường hợp đặc biệt (null, empty, invalid, not found)

## 📝 Checklist Khi Test Fail

- [ ] Kiểm tra mock có đúng không
- [ ] Kiểm tra expected value có đúng không
- [ ] Kiểm tra async/await có đúng không
- [ ] Kiểm tra beforeEach có reset mocks không
- [ ] Chạy với `--verbose` để xem chi tiết
- [ ] Clear cache: `npm test -- --no-cache`
