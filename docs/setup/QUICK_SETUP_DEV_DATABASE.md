# Hướng Dẫn Nhanh: Setup Development Database

## 🎯 Mục Đích

Tạo một development database để test mà **không cần quyền admin** trên production database của khách hàng.

---

## ⚡ Cách Đơn Giản Nhất (5 Phút)

### **Bước 1: Tạo Supabase Project Mới**

1. Đăng ký/đăng nhập tại [https://app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Đặt tên: `SportHawk Dev` (hoặc tên khác)
4. Chọn region
5. Đặt database password (lưu lại!)
6. Chờ project được tạo (5-10 phút)

### **Bước 2: Chạy Script Setup**

```powershell
# Chạy script tự động
.\scripts\setup-dev-database.ps1
```

Script sẽ:

- ✅ Kiểm tra Supabase CLI
- ✅ Hướng dẫn login
- ✅ Link với project mới
- ✅ Chạy migrations tự động
- ✅ Hiển thị thông tin project

### **Bước 3: Lấy API Keys**

1. Vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project vừa tạo
3. Vào **Settings** → **API**
4. Copy:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (nếu cần)

### **Bước 4: Cấu Hình Environment Variables**

Tạo file `.env.local`:

```bash
# Development Database (của bạn)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Lưu ý:** File `.env.local` đã được ignore trong `.gitignore`, không lo commit nhầm.

---

## 🔄 Nếu Không Dùng Script

### **Cách Thủ Công:**

```bash
# 1. Cài Supabase CLI (nếu chưa có)
npm install -g supabase

# 2. Login
supabase login

# 3. Link với project mới
supabase link --project-ref YOUR_PROJECT_REF

# 4. Chạy migrations
supabase db push
```

---

## 📊 Kết Quả

Sau khi chạy migrations, bạn sẽ có:

✅ **Database structure** giống hệt production:

- Tất cả tables
- Functions
- Triggers
- RLS policies
- Indexes

❌ **KHÔNG có data** (chỉ có structure)

---

## 🌱 Tạo Dữ Liệu Test

Nếu cần dữ liệu để test, tạo file `supabase/seed.sql`:

```sql
-- Ví dụ: Tạo test users
INSERT INTO auth.users (id, email, encrypted_password) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', crypt('password123', gen_salt('bf')));

INSERT INTO profiles (id, email, first_name, last_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test', 'User');

-- Thêm dữ liệu test khác...
```

Sau đó chạy:

```bash
supabase db reset  # Sẽ chạy migrations + seed
```

---

## 🔄 Cập Nhật Database

Khi có migration mới:

```bash
# Pull migrations từ production (nếu có quyền)
supabase db pull

# Hoặc thêm migration file mới vào supabase/migrations/
# Sau đó chạy:
supabase db push
```

---

## ⚠️ Lưu Ý

1. **Không commit `.env.local`** - Đã có trong `.gitignore`
2. **Không commit API keys** - Bảo mật quan trọng
3. **Test trên dev database** - Không bao giờ test trên production
4. **Backup trước khi test** - Nếu có dữ liệu quan trọng

---

## 🆘 Troubleshooting

### **Lỗi: "Supabase CLI not found"**

```bash
npm install -g supabase
```

### **Lỗi: "Project not found"**

- Kiểm tra Project Reference ID
- Đảm bảo đã login đúng account

### **Lỗi: "Migration failed"**

- Kiểm tra file migration có lỗi syntax không
- Xem log chi tiết: `supabase db push --debug`

---

## 📚 Tài Liệu

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Hướng dẫn chi tiết](./SUPABASE_DATABASE_COPY_SIMPLE.md)
