# 🧪 Testing Guide - SportHawk

## 📚 Tài Liệu

1. **[README_FEATURES.md](./README_FEATURES.md)** - Tổng hợp chức năng & phân công cho 3 thành viên
2. **[docs/testing/JEST_COMPLETE_GUIDE.md](./docs/testing/JEST_COMPLETE_GUIDE.md)** - Hướng dẫn Jest từ cơ bản đến nâng cao
3. **[docs/testing/TESTING_RECOMMENDATIONS.md](./docs/testing/TESTING_RECOMMENDATIONS.md)** - Phần nào nên test, phần nào không

---

## 🚀 Quick Start

### Bước 1: Cài đặt dependencies

```bash
npm install
```

### Bước 2: Chạy tests

```bash
# Chạy tất cả tests
npm test

# Chạy tests ở chế độ watch (tự động chạy lại khi có thay đổi)
npm run test:watch

# Chạy tests với coverage report
npm run test:coverage
```

### Bước 3: Xem ví dụ tests đã tạo

```bash
# Test logger utility
npm test lib/utils/__tests__/logger.test.ts

# Test payment fee calculation
npm test features/payments/utils/__tests__/paymentCaculationiStripeFee.test.ts

# Test date formatting
npm test features/event/utils/__tests__/formatDateToYMD.test.ts
```

---

## 📁 Cấu Trúc Test Files

```
project/
├── lib/
│   └── utils/
│       └── __tests__/
│           └── logger.test.ts          ✅ Đã có
├── features/
│   ├── payments/
│   │   └── utils/
│   │       └── __tests__/
│   │           └── paymentCaculationiStripeFee.test.ts  ✅ Đã có
│   └── event/
│       └── utils/
│           └── __tests__/
│               └── formatDateToYMD.test.ts  ✅ Đã có
└── jest.config.js                      ✅ Đã có
└── jest.setup.js                       ✅ Đã có
```

---

## 🎯 Bắt Đầu Từ Đâu?

### **Cho Người Mới:**

1. **Đọc:** [JEST_COMPLETE_GUIDE.md](./docs/testing/JEST_COMPLETE_GUIDE.md) - Phần "Cơ Bản"
2. **Xem ví dụ:** `lib/utils/__tests__/logger.test.ts` - Test đơn giản nhất
3. **Thực hành:** Viết test cho một function đơn giản của bạn

### **Cho Người Có Kinh Nghiệm:**

1. **Đọc:** [TESTING_RECOMMENDATIONS.md](./docs/testing/TESTING_RECOMMENDATIONS.md)
2. **Xem ví dụ:** `features/payments/utils/__tests__/paymentCaculationiStripeFee.test.ts`
3. **Bắt đầu:** Test các functions trong module được phân công

---

## 📊 Test Coverage Goals

- **Critical Functions (Payments):** 100%
- **Business Logic:** 80%+
- **Utilities:** 80%+
- **API Functions:** 70%+

---

## 💡 Tips

1. Bắt đầu với functions đơn giản → Tự tin hơn
2. Test edge cases → Phát hiện bugs sớm
3. Mock external dependencies → Tests chạy nhanh
4. Đọc [JEST_COMPLETE_GUIDE.md](./docs/testing/JEST_COMPLETE_GUIDE.md) để hiểu rõ hơn

---

## 📞 Hỗ Trợ

Nếu có thắc mắc, tham khảo:

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [JEST_COMPLETE_GUIDE.md](./docs/testing/JEST_COMPLETE_GUIDE.md)
