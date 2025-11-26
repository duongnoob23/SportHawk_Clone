# Real Database Tests - Hướng Dẫn Chạy Test

## ⚠️ QUAN TRỌNG

Test này sử dụng **DATABASE THẬT**, không phải mock!

- Tất cả test sẽ tạo và xóa data thật trong database
- Đảm bảo bạn đang dùng **TEST DATABASE**, không phải production!

---

## 📋 Bước 1: Setup Environment Variables

### Cách 1: Tạo file `.env.test` (Khuyến nghị)

Tạo file `.env.test` trong root directory:

```bash
# Test Database URL
TEST_SUPABASE_URL=https://your-test-project.supabase.co

# Service Role Key (có quyền cao hơn, bypass RLS)
TEST_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Cách 2: Set trong Terminal (Windows PowerShell)

```powershell
$env:TEST_SUPABASE_URL="https://your-test-project.supabase.co"
$env:TEST_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### Cách 3: Set trong Terminal (Windows CMD)

```cmd
set TEST_SUPABASE_URL=https://your-test-project.supabase.co
set TEST_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Cách 4: Dùng existing variables

Nếu bạn đã có `.env` file với:

- `EXPO_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Test sẽ tự động dùng các biến này nếu không tìm thấy `TEST_*` variables.

---

## 📋 Bước 2: Đảm Bảo Database Có Test Data

Database cần có ít nhất:

- ✅ 1 team (trong bảng `teams`)
- ✅ 1 user (trong bảng `profiles`)

Hoặc test sẽ tự động lấy team/user đầu tiên từ database.

---

## 🚀 Bước 3: Chạy Test

### Chạy tất cả Real Database Tests:

```bash
npm run test:real-db
```

### Chạy test với watch mode (tự động chạy lại khi code thay đổi):

```bash
npm run test:real-db:watch
```

### Chạy test cụ thể:

```bash
# Chạy test file cụ thể
npx jest tests/TestRealDatabase/createEvent.real.test.ts --verbose

# Chạy test case cụ thể
npx jest tests/TestRealDatabase/createEvent.real.test.ts -t "createEvent_WhenValidInput_ReturnsSuccess"
```

### Chạy với environment variables inline (Windows PowerShell):

```powershell
$env:TEST_SUPABASE_URL="https://your-project.supabase.co"; $env:TEST_SUPABASE_SERVICE_ROLE_KEY="your-key"; npm run test:real-db
```

---

## 🔍 Kiểm Tra Kết Quả

Test sẽ:

- ✅ Tạo event thật trong database
- ✅ Kiểm tra event được tạo đúng
- ✅ Kiểm tra invitations được tạo
- ✅ Kiểm tra participants được tạo
- ✅ **Tự động xóa tất cả test data sau mỗi test**

---

## ❌ Troubleshooting

### Lỗi: "Missing Supabase credentials"

```
❌ Missing Supabase credentials for real database tests!
Please set TEST_SUPABASE_URL and TEST_SUPABASE_SERVICE_ROLE_KEY
```

**Giải pháp:** Set environment variables như hướng dẫn ở Bước 1.

### Lỗi: "No existing team or user found"

```
❌ No existing team or user found in database.
```

**Giải pháp:** Đảm bảo database có ít nhất 1 team và 1 user.

### Lỗi: Foreign key constraint violation

```
insert or update on table "events" violates foreign key constraint
```

**Giải pháp:**

- Kiểm tra `team_id` trong test có tồn tại trong database
- Kiểm tra các `user_id` trong `selected_members`/`selected_leaders` có tồn tại

### Lỗi: RLS (Row Level Security) policy violation

**Giải pháp:** Dùng **Service Role Key** thay vì Anon Key để bypass RLS.

---

## 📝 Lưu Ý

1. **KHÔNG chạy test trên Production Database!**
   - Luôn dùng test database riêng
   - Test sẽ tạo và xóa data thật

2. **Service Role Key**
   - Có quyền cao hơn, bypass RLS
   - Lấy từ: Supabase Dashboard → Settings → API → service_role key

3. **Cleanup tự động**
   - Tất cả test data sẽ được xóa sau mỗi test
   - Nếu test bị interrupt, có thể cần cleanup thủ công

---

## 🎯 So Sánh với Mock Tests

| Khía cạnh     | Mock Tests                     | Real DB Tests            |
| ------------- | ------------------------------ | ------------------------ |
| Command       | `npm run test:event`           | `npm run test:real-db`   |
| Tốc độ        | ⚡⚡⚡⚡ Rất nhanh             | ⚡⚡ Chậm hơn            |
| Phát hiện lỗi | ❌ Không phát hiện lỗi thực tế | ✅ Phát hiện lỗi thực tế |
| Setup         | ✅ Đơn giản                    | ⚠️ Cần database thật     |
