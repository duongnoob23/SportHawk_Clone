# 🚀 Quick Start - Jest Testing

## ⚡ 3 Bước Để Bắt Đầu

### 1. Cài đặt

```bash
npm install
```

### 2. Chạy test đầu tiên

```bash
npm test lib/utils/__tests__/logger.test.ts
```

### 3. Xem kết quả

```
PASS  lib/utils/__tests__/logger.test.ts
  Logger Utility
    ✓ logger.log should call console.log with timestamp
    ✓ logger.error should call console.error with timestamp

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

---

## 📚 Học Jest Theo Thứ Tự

### **Bước 1: Đọc Cơ Bản** (30 phút)

📖 [JEST_COMPLETE_GUIDE.md](./JEST_COMPLETE_GUIDE.md) - Phần "Cơ Bản"

**Học:**

- Jest là gì?
- Viết test đơn giản
- Matchers cơ bản

### **Bước 2: Xem Ví Dụ Đơn Giản** (15 phút)

👀 `lib/utils/__tests__/logger.test.ts`

**Hiểu:**

- Cấu trúc test file
- Mock functions
- beforeEach/afterAll

### **Bước 3: Thực Hành** (1 giờ)

✍️ Viết test cho `formatDateToYMD` (đã có sẵn ở `features/event/utils/__tests__/formatDateToYMD.test.ts`)

### **Bước 4: Đọc Trung Bình** (30 phút)

📖 [JEST_COMPLETE_GUIDE.md](./JEST_COMPLETE_GUIDE.md) - Phần "Trung Bình"

**Học:**

- Mock modules
- Async testing
- Test với Supabase

### **Bước 5: Xem Ví Dụ Phức Tạp** (30 phút)

👀 `features/payments/utils/__tests__/paymentCaculationiStripeFee.test.ts`

**Hiểu:**

- Test calculations
- Test edge cases
- Test multiple scenarios

### **Bước 6: Đọc Nâng Cao** (1 giờ)

📖 [JEST_COMPLETE_GUIDE.md](./JEST_COMPLETE_GUIDE.md) - Phần "Nâng Cao"

**Học:**

- Mock Supabase
- Test API functions
- Best practices

---

## 🎯 Ví Dụ Tests Đã Tạo (Từ Đơn Giản → Phức Tạp)

### 1. **logger.test.ts** ⭐ (Đơn giản nhất)

- Test basic functions
- Mock console
- Good starting point

### 2. **formatDateToYMD.test.ts** ⭐⭐

- Test date formatting
- Test edge cases
- Simple logic

### 3. **countInvitationStatus.test.ts** ⭐⭐⭐

- Test data counting
- Test null/undefined handling
- Array operations

### 4. **paymentCaculationiStripeFee.test.ts** ⭐⭐⭐⭐

- Test calculations
- Test multiple scenarios
- Test edge cases
- Money-related (critical)

---

## 📝 Checklist Bắt Đầu

- [ ] Đã cài đặt dependencies (`npm install`)
- [ ] Đã đọc phần "Cơ Bản" trong JEST_COMPLETE_GUIDE.md
- [ ] Đã xem ví dụ `logger.test.ts`
- [ ] Đã chạy test thành công (`npm test`)
- [ ] Đã đọc TESTING_RECOMMENDATIONS.md
- [ ] Đã chọn module để test (theo phân công)

---

## 🎓 Next Steps

1. Chọn một function đơn giản trong module của bạn
2. Viết test đầu tiên (copy từ ví dụ)
3. Chạy test và xem kết quả
4. Thêm test cases cho edge cases
5. Lặp lại với function tiếp theo

---

## 💡 Tips

- **Bắt đầu nhỏ:** Test 1 function đơn giản trước
- **Copy & Modify:** Dùng ví dụ có sẵn làm template
- **Chạy thường xuyên:** `npm run test:watch` để tự động test
- **Đọc error messages:** Jest error messages rất rõ ràng

---

## 📞 Cần Giúp?

1. Đọc lại [JEST_COMPLETE_GUIDE.md](./JEST_COMPLETE_GUIDE.md)
2. Xem ví dụ tests đã có
3. Hỏi team members
