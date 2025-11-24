# Testing Recommendations - Phần Nào Nên Test?

## 🎯 Nguyên Tắc Chung

### ✅ **NÊN TEST** (High Priority)

#### 1. **Business Logic & Calculations** ⭐⭐⭐⭐⭐

**Lý do:** Logic tính toán sai = bug nghiêm trọng, đặc biệt với tiền bạc

**Ví dụ:**

- ✅ `paymentCaculationStripeFee.ts` - Tính phí Stripe
- ✅ `paymentTransformers.ts` - Transform dữ liệu payment
- ✅ `formatDateToYMD.ts` - Format dates
- ✅ `countInvitationStatus.ts` - Đếm RSVP responses

**Test coverage target:** 100%

---

#### 2. **Data Validation & Transformers** ⭐⭐⭐⭐

**Lý do:** Đảm bảo data được transform đúng format

**Ví dụ:**

- ✅ `paymentTransformers.ts` - Transform payment data
- ✅ `parseEventNotes.ts` - Parse event notes
- ✅ `mapRsvpToInvitationStatus.ts` - Map RSVP to status

**Test coverage target:** 90%+

---

#### 3. **API Functions với Supabase** ⭐⭐⭐⭐

**Lý do:** Đảm bảo database operations hoạt động đúng

**Ví dụ:**

- ✅ `features/event/api/event.ts` - Create, update, delete events
- ✅ `features/payments/apis/paymentRequest.ts` - Payment operations
- ✅ `features/teams/api/teamMember.ts` - Team member operations

**Test coverage target:** 80%+

**Cách test:** Mock Supabase client

---

#### 4. **Error Handling** ⭐⭐⭐⭐

**Lý do:** Đảm bảo app xử lý lỗi gracefully

**Ví dụ:**

- ✅ Test khi Supabase trả về error
- ✅ Test khi Stripe API fails
- ✅ Test khi network timeout

**Test coverage target:** 100% error paths

---

#### 5. **Utility Functions** ⭐⭐⭐

**Lý do:** Dùng nhiều nơi, bug sẽ ảnh hưởng rộng

**Ví dụ:**

- ✅ `lib/utils/logger.ts` - Logging utility
- ✅ `formatTimeToHMS.ts` - Time formatting
- ✅ `parseAnswerBy.ts` - Parse answer by date

**Test coverage target:** 80%+

---

### ❌ **KHÔNG NÊN TEST** (Low Priority hoặc Không Cần)

#### 1. **UI Components (Visual)** ⭐

**Lý do:**

- Test UI tốn thời gian, dễ break khi design thay đổi
- Nên dùng E2E tests thay vì unit tests

**Ví dụ:**

- ❌ `components/ShButton/ShButton.tsx` - Chỉ test props, không test render
- ❌ `components/ShText/ShText.tsx` - Không cần test styling

**Exception:** Test logic trong components (validation, calculations)

---

#### 2. **Simple Getters/Setters** ⭐

**Lý do:** Quá đơn giản, không có logic phức tạp

**Ví dụ:**

```typescript
// ❌ Không cần test
function getName(user: User) {
  return user.name;
}
```

---

#### 3. **Third-party Library Code** ⭐

**Lý do:** Đã được test bởi library maintainers

**Ví dụ:**

- ❌ Supabase client methods
- ❌ Stripe SDK methods
- ❌ React Native components

**Exception:** Test cách bạn sử dụng chúng (wrappers, error handling)

---

#### 4. **Configuration Files** ⭐

**Lý do:** Không có logic, chỉ là constants

**Ví dụ:**

- ❌ `constants/colors.ts`
- ❌ `constants/spacing.ts`
- ❌ `constants/routes.ts`

---

#### 5. **Type Definitions** ⭐

**Lý do:** TypeScript đã check types, không cần runtime test

**Ví dụ:**

- ❌ `types/database.ts`
- ❌ `types/event.ts`

---

## 📊 Test Priority Matrix

| Module                         | Priority   | Coverage Target | Reason                        |
| ------------------------------ | ---------- | --------------- | ----------------------------- |
| **Payments - Fee Calculation** | ⭐⭐⭐⭐⭐ | 100%            | Money related, critical       |
| **Payments - Transformers**    | ⭐⭐⭐⭐⭐ | 100%            | Data transformation, critical |
| **Events - API Functions**     | ⭐⭐⭐⭐   | 80%+            | Core business logic           |
| **Events - Utils**             | ⭐⭐⭐⭐   | 90%+            | Used in multiple places       |
| **Teams - API Functions**      | ⭐⭐⭐     | 70%+            | Important but simpler         |
| **Auth - Validation**          | ⭐⭐⭐     | 80%+            | Security important            |
| **Logger Utility**             | ⭐⭐⭐     | 70%+            | Used everywhere               |
| **UI Components**              | ⭐         | 0%              | Use E2E instead               |
| **Constants**                  | ⭐         | 0%              | No logic to test              |

---

## 🎯 Test Strategy by File Type

### **Utils Functions** ✅ NÊN TEST

```typescript
// ✅ Test này
export function calculateTotal(price: number, quantity: number) {
  return price * quantity * 1.2; // With tax
}
```

### **API Functions** ✅ NÊN TEST (với mocks)

```typescript
// ✅ Test này (mock Supabase)
export async function createEvent(data: CreateEventData) {
  const { data, error } = await supabase.from('events').insert(data);
  if (error) throw error;
  return data;
}
```

### **React Hooks** ⚠️ TEST LOGIC ONLY

```typescript
// ✅ Test business logic
export function usePaymentForm() {
  const [amount, setAmount] = useState(0);

  const isValid = amount > 0 && amount < 1000000; // Test này

  return { amount, setAmount, isValid };
}
```

### **React Components** ❌ KHÔNG TEST (trừ logic)

```typescript
// ❌ Không test render
export function ShButton({ title, onPress }) {
  return <Button title={title} onPress={onPress} />;
}

// ✅ Nhưng test logic nếu có
export function PaymentAmountInput({ value, onChange }) {
  const isValid = value > 0 && value < 1000000; // Test này
  return <Input value={value} onChange={onChange} />;
}
```

---

## 📝 Ví Dụ Cụ Thể

### ✅ **NÊN TEST - paymentCaculationStripeFee.ts**

**Lý do:**

- Tính toán tiền bạc - CRITICAL
- Logic phức tạp (if/else, calculations)
- Dùng nhiều nơi trong app

**Test cases:**

- [x] Tính fee đúng cho các mức giá khác nhau
- [x] Xử lý edge cases (0, số lớn, số lẻ)
- [x] Test cả 2 modes (isUserDisplay true/false)

---

### ✅ **NÊN TEST - paymentTransformers.ts**

**Lý do:**

- Transform dữ liệu quan trọng
- Logic mapping phức tạp
- Ảnh hưởng đến hiển thị payment

**Test cases:**

- [x] Transform payment request đúng format
- [x] Xử lý missing data (null, undefined)
- [x] Map payment status đúng

---

### ✅ **NÊN TEST - event/utils/index.tsx**

**Lý do:**

- Nhiều utility functions
- Logic phức tạp (parsing, formatting)
- Dùng trong nhiều screens

**Test cases:**

- [x] `formatDateToYMD` - Format dates
- [x] `formatTimeToHMS` - Format times
- [x] `countInvitationStatus` - Count RSVP
- [x] `parseEventNotes` - Parse notes
- [x] `mapRsvpToInvitationStatus` - Map RSVP

---

### ⚠️ **TEST LOGIC ONLY - usePaymentForm.ts**

**Lý do:**

- Hook có business logic (validation)
- Nhưng không test React hooks behavior

**Test cases:**

- [x] Validation logic (amount > 0, amount < max)
- [x] Form state management
- [ ] Không test React hooks behavior (dùng integration test)

---

### ❌ **KHÔNG TEST - components/ShButton.tsx**

**Lý do:**

- Chỉ render UI, không có logic
- Test UI tốn thời gian, dễ break

**Thay vào đó:**

- Dùng E2E tests để test user interactions
- Hoặc test logic nếu component có (validation, calculations)

---

## 🎯 Quick Decision Guide

**Hỏi 3 câu hỏi:**

1. **Có logic phức tạp không?** → ✅ TEST
2. **Có tính toán/transform data không?** → ✅ TEST
3. **Chỉ là UI render không?** → ❌ KHÔNG TEST (dùng E2E)

**Ví dụ:**

- `paymentCaculationStripeFee` → ✅ Có logic phức tạp → TEST
- `formatDateToYMD` → ✅ Transform data → TEST
- `ShButton` → ❌ Chỉ render UI → KHÔNG TEST
- `usePaymentForm` → ✅ Có validation logic → TEST LOGIC ONLY

---

## 📈 Test Coverage Goals

### **Phase 1: Critical Functions (Week 1-2)**

- ✅ Payment calculations: 100%
- ✅ Payment transformers: 100%
- ✅ Event utils: 90%+

### **Phase 2: API Functions (Week 3-4)**

- ✅ Event API: 80%+
- ✅ Payment API: 80%+
- ✅ Team API: 70%+

### **Phase 3: Utilities (Week 5-6)**

- ✅ Logger: 70%+
- ✅ Date/Time formatters: 80%+
- ✅ Validators: 80%+

---

## 💡 Tips

1. **Bắt đầu với functions đơn giản** → Tự tin hơn
2. **Test edge cases** → Phát hiện bugs sớm
3. **Test error handling** → Đảm bảo app không crash
4. **Không test UI trừ khi có logic** → Tiết kiệm thời gian
5. **Mock external dependencies** → Tests chạy nhanh và độc lập
