# SportHawk - Tổng Hợp Chức Năng & Phân Công Testing

## 📋 Tổng Quan Dự Án

**SportHawk** là ứng dụng mobile quản lý câu lạc bộ thể thao, giúp giảm gánh nặng hành chính cho các câu lạc bộ và kết nối thành viên dễ dàng tham gia hoạt động.

**Tech Stack:**

- Frontend: React Native + Expo
- Backend: Supabase (PostgreSQL, Auth, Edge Functions)
- Payments: Stripe Connect
- Language: TypeScript

---

## 🎯 7 Chức Năng Lớn Chính

### 1. **Authentication & User Management** 🔐

**Location:** `app/(auth)/`, `app/user/`, `features/event/hooks/useNotification.ts`

**Chức năng:**

- ✅ Sign Up / Sign In (Email + Password)
- ✅ Email Verification (OTP)
- ✅ Forgot Password / Reset Password
- ✅ User Profile Management
- ✅ Account Settings & Preferences
- ✅ Delete Account

**Files chính:**

- `app/(auth)/SignIn.tsx`
- `app/(auth)/SignUp.tsx`
- `app/(auth)/VerifyEmail.tsx`
- `app/(auth)/ForgotPassword.tsx`
- `app/user/edit-profile.tsx`
- `app/user/manage-account.tsx`
- `app/user/change-password.tsx`
- `app/user/delete-account.tsx`

**Test Scenarios:**

- [ ] Email validation
- [ ] Password strength requirements
- [ ] OTP verification flow
- [ ] Session management
- [ ] Password reset flow
- [ ] Account deletion with data cleanup

**Priority:** ⭐⭐⭐ (High - Security critical)

---

### 2. **Payments** 💳

**Location:** `app/payments/`, `features/payments/`, `supabase/functions/stripe-*`

**Chức năng:**

- ✅ Create Payment Request (Admin)
- ✅ View Payment Details (Member & Admin)
- ✅ Process Payment (Stripe Integration)
- ✅ Payment History
- ✅ Payment Notifications
- ✅ Cancel Payment Request
- ✅ Edit Payment Members
- ✅ Stripe Fee Calculation

**Files chính:**

- `app/payments/create-payment.tsx`
- `app/payments/[id]/index.tsx` (Member view)
- `app/payments/[id]/admin-detail.tsx` (Admin view)
- `features/payments/utils/paymentCaculationiStripeFee.ts` ⭐ **CRITICAL**
- `features/payments/utils/paymentTransformers.ts` ⭐ **CRITICAL**
- `supabase/functions/stripe-create-payment/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**Test Scenarios:**

- [ ] Payment fee calculation (1.9% + 0.2)
- [ ] Payment rounding (no decimal pence)
- [ ] Stripe PaymentIntent creation
- [ ] Payment webhook processing
- [ ] Payment status updates
- [ ] Member payment notifications
- [ ] Admin payment notifications
- [ ] Payment cancellation
- [ ] Error handling (Stripe failures)

**Priority:** ⭐⭐⭐⭐⭐ (Critical - Money related)

---

### 3. **Events Management** 📅

**Location:** `app/events/`, `features/event/`

**Chức năng:**

- ✅ Create Event
- ✅ Edit Event
- ✅ View Event Details
- ✅ Event Invitations
- ✅ RSVP (Available/Unavailable/Maybe)
- ✅ Squad Selection
- ✅ Event Reminders
- ✅ Event Notifications

**Files chính:**

- `app/events/create-event.tsx`
- `app/events/edit-event.tsx`
- `app/events/details.tsx`
- `features/event/api/event.ts` ⭐ **CRITICAL**
- `features/event/hooks/useCreateEvent.ts`
- `features/event/utils/index.tsx` ⭐ **CRITICAL**
- `features/event/hooks/useEventDetail.ts`

**Test Scenarios:**

- [ ] Event creation with validation
- [ ] Event date/time validation
- [ ] Member invitation flow
- [ ] RSVP responses
- [ ] Squad selection logic
- [ ] Event reminders
- [ ] Event cancellation
- [ ] Concurrent event updates
- [ ] Event status mapping

**Priority:** ⭐⭐⭐⭐ (High - Core feature)

---

### 4. **Teams Management** 👥

**Location:** `app/teams/`, `features/teams/`

**Chức năng:**

- ✅ View Team Details
- ✅ Team Members List
- ✅ Add/Remove Members
- ✅ Team Admins Management
- ✅ Team Settings
- ✅ Team Events
- ✅ Team Payments
- ✅ Join Team Request

**Files chính:**

- `app/teams/[id]/index.tsx`
- `app/teams/[id]/admin/members.tsx`
- `app/teams/[id]/admin/add-members.tsx`
- `app/teams/[id]/admin/admins.tsx`
- `features/teams/hooks/useTeamMembers.ts`
- `features/teams/api/teamMember.ts`

**Test Scenarios:**

- [ ] Team member addition
- [ ] Member removal
- [ ] Admin role assignment
- [ ] Join request approval/rejection
- [ ] Team permissions
- [ ] Team data consistency

**Priority:** ⭐⭐⭐ (Medium)

---

### 5. **Clubs Management** 🏟️

**Location:** `app/clubs/`, `features/clubs/`

**Chức năng:**

- ✅ View Club Details
- ✅ Club Teams List
- ✅ Explore Clubs
- ✅ Save Clubs
- ✅ Club Search

**Files chính:**

- `app/clubs/[id]/index.tsx`
- `app/clubs/[id]/teams.tsx`
- `app/(app)/explore.tsx`
- `features/clubs/hooks/useClubs.ts`

**Test Scenarios:**

- [ ] Club discovery
- [ ] Club search functionality
- [ ] Club teams listing
- [ ] Save/unsave clubs

**Priority:** ⭐⭐ (Low - Simple CRUD)

---

### 6. **Notifications** 🔔

**Location:** `features/event/hooks/useNotification.ts`, `supabase/functions/send-*`

**Chức năng:**

- ✅ Push Notifications (FCM)
- ✅ Payment Notifications
- ✅ Event Notifications
- ✅ Payment Reminders
- ✅ Notification Preferences

**Files chính:**

- `features/event/hooks/useNotification.ts`
- `supabase/functions/send-fcm-notification/index.ts`
- `supabase/functions/send-payment-reminders/index.ts`
- `app/onboarding/notification-preferences.tsx`

**Test Scenarios:**

- [ ] Notification delivery
- [ ] Notification preferences
- [ ] Payment reminder scheduling
- [ ] Notification templates
- [ ] Error handling (FCM failures)

**Priority:** ⭐⭐⭐ (Medium - Important for UX)

---

### 7. **Onboarding** 🚀

**Location:** `app/onboarding/`

**Chức năng:**

- ✅ Build Profile
- ✅ Share Interests
- ✅ Location Preferences
- ✅ Notification Preferences
- ✅ Complete Account

**Files chính:**

- `app/onboarding/build-profile.tsx`
- `app/onboarding/share-interests.tsx`
- `app/onboarding/location-prefrences.tsx`
- `app/onboarding/notification-preferences.tsx`
- `app/onboarding/complete-account.tsx`

**Test Scenarios:**

- [ ] Onboarding flow completion
- [ ] Profile data validation
- [ ] Interest selection
- [ ] Location permissions

**Priority:** ⭐⭐ (Low - One-time flow)

---

## 👥 Phân Công Testing Cho 3 Thành Viên

### **Thành Viên 1: Payments & Core Utils** 💳

**Trách nhiệm:**

- Module 2: Payments (toàn bộ)
- Utility functions: `paymentCaculationiStripeFee.ts`, `paymentTransformers.ts`
- Stripe integration testing

**Files cần test:**

- `features/payments/utils/paymentCaculationiStripeFee.ts` ⭐⭐⭐⭐⭐
- `features/payments/utils/paymentTransformers.ts` ⭐⭐⭐⭐⭐
- `features/payments/utils/paymentFilters.ts`
- `app/payments/create-payment.tsx` (logic only)
- `supabase/functions/stripe-create-payment/index.ts` (Deno tests)

**Estimated:** 40% workload

---

### **Thành Viên 2: Events & Teams** 📅👥

**Trách nhiệm:**

- Module 3: Events Management (toàn bộ)
- Module 4: Teams Management
- Utility functions: `features/event/utils/index.tsx`

**Files cần test:**

- `features/event/api/event.ts` ⭐⭐⭐⭐
- `features/event/utils/index.tsx` ⭐⭐⭐⭐
- `features/event/hooks/useCreateEvent.ts`
- `features/teams/api/teamMember.ts`
- `features/teams/hooks/useTeamMembers.ts`

**Estimated:** 35% workload

---

### **Thành Viên 3: Auth, Clubs, Notifications & Onboarding** 🔐🏟️🔔

**Trách nhiệm:**

- Module 1: Authentication & User Management
- Module 5: Clubs Management
- Module 6: Notifications
- Module 7: Onboarding

**Files cần test:**

- `lib/utils/logger.ts` ⭐⭐⭐
- `features/clubs/hooks/useClubs.ts`
- `features/event/hooks/useNotification.ts`
- Auth flows (integration tests)

**Estimated:** 25% workload

---

## 📊 Test Coverage Goals

### **Unit Tests (Target: 80%+)**

- ✅ Pure functions (calculations, transformers)
- ✅ Utility functions
- ✅ Business logic
- ✅ Data validation

### **Integration Tests (Target: 60%+)**

- ✅ API endpoints
- ✅ Database operations
- ✅ Stripe integration
- ✅ Supabase Edge Functions

### **E2E Tests (Target: Critical Paths Only)**

- ✅ Payment flow (create → pay → webhook)
- ✅ Event creation → invitation → RSVP
- ✅ User registration → onboarding

---

## 🎯 Priority Testing Order

1. **Week 1-2: Critical Functions**
   - `paymentCaculationiStripeFee.ts` ⭐⭐⭐⭐⭐
   - `paymentTransformers.ts` ⭐⭐⭐⭐⭐
   - `event/utils/index.tsx` ⭐⭐⭐⭐

2. **Week 3-4: API Functions**
   - `features/event/api/event.ts`
   - `features/payments/apis/paymentRequest.ts`
   - `features/teams/api/teamMember.ts`

3. **Week 5-6: Hooks & Components Logic**
   - Custom hooks
   - Form validation
   - State management

---

## 📝 Notes

- **Money-related functions** (Payments) cần test coverage 100%
- **Event management** cần test các edge cases (concurrent updates, invalid dates)
- **Auth flows** cần integration tests với Supabase
- **Stripe functions** cần test với Deno (không phải Jest)
