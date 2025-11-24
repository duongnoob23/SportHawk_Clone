# Hướng Dẫn Chạy Tests

## 🚀 Lệnh Chạy Tests

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

### **Chạy với coverage report:**

```bash
npm run test:coverage
```

---

## 📊 Hiểu Output

### **Verbose Mode (Mặc định)**

Khi chạy test, bạn sẽ thấy:

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
Time:        2.5 s
```

### **Nếu Test Fail:**

```
FAIL  tests/event/createEvent.test.ts
  createEvent API
    ✓ createEvent_WhenValidInput_ReturnsSuccess (15 ms)
    ✕ createEvent_WhenTeamIdIsNull_ReturnsFailure (8 ms)

  ● createEvent API › createEvent_WhenTeamIdIsNull_ReturnsFailure

    expect(received).toEqual(expected)

    Expected: { message: 'null value...', code: '23502' }
    Received: { message: 'Different error', code: 'PGRST202' }

      45 |     ).rejects.toEqual(mockError);
      46 |
    > 47 |     expect(result).toBe(mockEventId);
         |                   ^
      48 |
      49 |     at Object.<anonymous> (tests/event/createEvent.test.ts:47:25)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
```

---

## ⚠️ Troubleshooting

### **Vấn đề: Chỉ chạy được 1 test thay vì nhiều tests**

**Nguyên nhân:**

- Test bị dừng sau test đầu tiên fail
- Mock không được reset giữa các tests
- Có lỗi syntax trong test file

**Giải pháp:**

1. Kiểm tra `beforeEach` có `jest.clearAllMocks()` không
2. Kiểm tra test đầu tiên có fail không
3. Chạy với `--verbose` để xem chi tiết:
   ```bash
   npm test tests/event/createEvent.test.ts -- --verbose
   ```

### **Vấn đề: Không thấy progress khi chạy**

**Giải pháp:**

- Đã thêm `--verbose` vào tất cả scripts
- Bạn sẽ thấy từng test case chạy và kết quả

### **Vấn đề: SyntaxError với react-native jest setup**

**Nguyên nhân:**

- Jest-expo đang cố parse file setup của react-native có TypeScript syntax

**Giải pháp:**

- Đã cấu hình `transformIgnorePatterns` để bỏ qua react-native/jest
- Nếu vẫn lỗi, thử:
  ```bash
  npm test -- --no-cache
  ```

---

## 💡 Tips

1. **Chạy test thường xuyên** - Để phát hiện bugs sớm
2. **Dùng watch mode** - Khi đang viết code
3. **Xem coverage** - Để biết phần nào chưa test
4. **Fix test fail ngay** - Đừng để tích tụ

---

## 📝 Checklist Khi Test Fail

- [ ] Kiểm tra mock có đúng không
- [ ] Kiểm tra expected value có đúng không
- [ ] Kiểm tra async/await có đúng không
- [ ] Kiểm tra beforeEach có reset mocks không
- [ ] Chạy với `--verbose` để xem chi tiết
