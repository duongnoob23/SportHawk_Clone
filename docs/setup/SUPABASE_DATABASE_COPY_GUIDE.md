# Hướng Dẫn Sao Chép Database Supabase

## 🎯 Mục Đích

Tạo một bản sao chép database từ **Production** (tài khoản khách hàng) sang **Development** (tài khoản của bạn) để test mà không ảnh hưởng đến dữ liệu thật.

---

## 📋 Yêu Cầu

1. **Supabase CLI** đã cài đặt
2. **Access token** của cả 2 tài khoản Supabase
3. **PostgreSQL client** (pg_dump/pg_restore) - đã có sẵn trong Supabase CLI

---

## 🚀 Các Bước Thực Hiện

### **Bước 1: Cài Đặt Supabase CLI** (Nếu chưa có)

```bash
# Windows (PowerShell)
winget install Supabase.CLI

# Hoặc dùng npm
npm install -g supabase

# Kiểm tra version
supabase --version
```

---

### **Bước 2: Lấy Thông Tin Production Database**

#### 2.1. Lấy Access Token từ Production Supabase

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com) (tài khoản production)
2. Vào **Settings** → **Access Tokens**
3. Tạo token mới hoặc copy token hiện có
4. Lưu lại token: `PROD_ACCESS_TOKEN`

#### 2.2. Lấy Project Reference ID

1. Vào **Settings** → **General**
2. Copy **Reference ID** (ví dụ: `abcdefghijklmnop`)
3. Lưu lại: `PROD_PROJECT_REF`

#### 2.3. Lấy Database Password

1. Vào **Settings** → **Database**
2. Copy **Database Password** (hoặc reset nếu cần)
3. Lưu lại: `PROD_DB_PASSWORD`

---

### **Bước 3: Tạo Development Project Mới**

#### 3.1. Tạo Project trên Supabase

1. Đăng nhập vào Supabase Dashboard (tài khoản của bạn)
2. Click **New Project**
3. Đặt tên: `SportHawk Development` (hoặc tên khác)
4. Chọn region gần bạn
5. Đặt database password (lưu lại: `DEV_DB_PASSWORD`)
6. Chờ project được tạo (5-10 phút)

#### 3.2. Lấy Thông Tin Development Project

1. Vào **Settings** → **General**
2. Copy **Reference ID**: `DEV_PROJECT_REF`
3. Vào **Settings** → **Access Tokens**
4. Tạo token mới: `DEV_ACCESS_TOKEN`

---

### **Bước 4: Dump Database từ Production**

#### 4.1. Link với Production Project

```bash
# Đăng nhập với production token
supabase login --token PROD_ACCESS_TOKEN

# Link với production project
supabase link --project-ref PROD_PROJECT_REF
```

#### 4.2. Dump Database Schema (Structure)

```bash
# Dump schema (tables, functions, triggers, etc.)
supabase db dump --schema public -f supabase/backups/prod-schema.sql
```

#### 4.3. Dump Database Data

```bash
# Dump data (dữ liệu trong tables)
supabase db dump --data-only -f supabase/backups/prod-data.sql

# Hoặc dump cả schema + data
supabase db dump -f supabase/backups/prod-full.sql
```

**Lưu ý:** File dump có thể rất lớn nếu có nhiều dữ liệu. Có thể cần thời gian.

---

### **Bước 5: Restore Database vào Development**

#### 5.1. Link với Development Project

```bash
# Đăng xuất và đăng nhập lại với dev token
supabase logout
supabase login --token DEV_ACCESS_TOKEN

# Link với development project
supabase link --project-ref DEV_PROJECT_REF
```

#### 5.2. Restore Schema

```bash
# Restore schema trước
supabase db reset --db-url "postgresql://postgres:DEV_DB_PASSWORD@db.DEV_PROJECT_REF.supabase.co:5432/postgres" < supabase/backups/prod-schema.sql
```

#### 5.3. Restore Data

```bash
# Restore data
psql "postgresql://postgres:DEV_DB_PASSWORD@db.DEV_PROJECT_REF.supabase.co:5432/postgres" < supabase/backups/prod-data.sql
```

**Hoặc dùng Supabase CLI:**

```bash
# Restore full backup
supabase db push --db-url "postgresql://postgres:DEV_DB_PASSWORD@db.DEV_PROJECT_REF.supabase.co:5432/postgres" < supabase/backups/prod-full.sql
```

---

## 🔄 Cách 2: Sử Dụng pg_dump/pg_restore (Nhanh Hơn)

### **Bước 1: Dump từ Production**

```bash
# Lấy connection string từ Production Dashboard
# Settings → Database → Connection string → URI

# Dump schema + data
pg_dump "postgresql://postgres:PROD_DB_PASSWORD@db.PROD_PROJECT_REF.supabase.co:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-acl \
  -f supabase/backups/prod-backup.sql
```

### **Bước 2: Restore vào Development**

```bash
# Restore vào development
psql "postgresql://postgres:DEV_DB_PASSWORD@db.DEV_PROJECT_REF.supabase.co:5432/postgres" \
  < supabase/backups/prod-backup.sql
```

---

## 🔧 Cấu Hình Environment Variables

### **Tạo File .env.development**

```bash
# Development Supabase
EXPO_PUBLIC_SUPABASE_URL=https://DEV_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=DEV_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=DEV_SERVICE_ROLE_KEY
```

### **Tạo File .env.production**

```bash
# Production Supabase
EXPO_PUBLIC_SUPABASE_URL=https://PROD_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=PROD_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=PROD_SERVICE_ROLE_KEY
```

### **Sử Dụng trong Code**

```typescript
// lib/supabase.ts
const isDevelopment = __DEV__; // hoặc process.env.NODE_ENV === 'development'

const supabaseUrl = isDevelopment
  ? process.env.EXPO_PUBLIC_SUPABASE_URL_DEV!
  : process.env.EXPO_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey = isDevelopment
  ? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY_DEV!
  : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

---

## 📝 Script Tự Động Hóa

Tạo file `scripts/copy-database.sh` (hoặc `.ps1` cho Windows):

```bash
#!/bin/bash

# Configuration
PROD_PROJECT_REF="your-prod-ref"
PROD_DB_PASSWORD="your-prod-password"
DEV_PROJECT_REF="your-dev-ref"
DEV_DB_PASSWORD="your-dev-password"

# Backup directory
BACKUP_DIR="./supabase/backups"
mkdir -p $BACKUP_DIR

echo "🔄 Dumping production database..."
pg_dump "postgresql://postgres:${PROD_DB_PASSWORD}@db.${PROD_PROJECT_REF}.supabase.co:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-acl \
  -f "${BACKUP_DIR}/prod-backup-$(date +%Y%m%d-%H%M%S).sql"

echo "✅ Dump completed!"

echo "🔄 Restoring to development database..."
psql "postgresql://postgres:${DEV_DB_PASSWORD}@db.${DEV_PROJECT_REF}.supabase.co:5432/postgres" \
  < "${BACKUP_DIR}/prod-backup-$(date +%Y%m%d-%H%M%S).sql"

echo "✅ Restore completed!"
```

**Windows PowerShell version** (`scripts/copy-database.ps1`):

```powershell
# Configuration
$PROD_PROJECT_REF = "your-prod-ref"
$PROD_DB_PASSWORD = "your-prod-password"
$DEV_PROJECT_REF = "your-dev-ref"
$DEV_DB_PASSWORD = "your-dev-password"

# Backup directory
$BACKUP_DIR = ".\supabase\backups"
New-Item -ItemType Directory -Force -Path $BACKUP_DIR

$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\prod-backup-$TIMESTAMP.sql"

Write-Host "🔄 Dumping production database..."
$PROD_CONNECTION = "postgresql://postgres:${PROD_DB_PASSWORD}@db.${PROD_PROJECT_REF}.supabase.co:5432/postgres"
pg_dump $PROD_CONNECTION --schema=public --no-owner --no-acl -f $BACKUP_FILE

Write-Host "✅ Dump completed!"

Write-Host "🔄 Restoring to development database..."
$DEV_CONNECTION = "postgresql://postgres:${DEV_DB_PASSWORD}@db.${DEV_PROJECT_REF}.supabase.co:5432/postgres"
Get-Content $BACKUP_FILE | psql $DEV_CONNECTION

Write-Host "✅ Restore completed!"
```

---

## ⚠️ Lưu Ý Quan Trọng

### **1. Bảo Mật**

- ❌ **KHÔNG commit** `.env` files vào git
- ❌ **KHÔNG commit** database passwords
- ✅ Thêm vào `.gitignore`:
  ```
  .env*
  supabase/backups/*.sql
  ```

### **2. Storage Buckets**

Database dump **KHÔNG bao gồm** Storage files (images, videos). Cần copy riêng:

```bash
# Sử dụng Supabase Dashboard hoặc API để copy storage
```

### **3. Row Level Security (RLS)**

RLS policies sẽ được copy, nhưng cần kiểm tra lại permissions.

### **4. Edge Functions**

Edge Functions cần deploy riêng:

```bash
# Deploy edge functions to dev
supabase functions deploy --project-ref DEV_PROJECT_REF
```

---

## 🔄 Cập Nhật Database Định Kỳ

Nếu muốn sync database thường xuyên:

```bash
# Chạy script mỗi tuần hoặc khi cần
./scripts/copy-database.sh
```

Hoặc tạo GitHub Action để tự động sync.

---

## 📊 Kiểm Tra Kết Quả

### **1. So Sánh Số Lượng Records**

```sql
-- Chạy trên cả 2 databases
SELECT
  schemaname,
  tablename,
  n_tup_ins - n_tup_del as row_count
FROM pg_stat_user_tables
ORDER BY tablename;
```

### **2. Kiểm Tra Schema**

```bash
# So sánh schema
supabase db diff --schema public
```

---

## 🆘 Troubleshooting

### **Lỗi: Connection timeout**

- Kiểm tra firewall settings
- Thử dùng connection pooler URL

### **Lỗi: Permission denied**

- Kiểm tra database password
- Đảm bảo có quyền admin trên cả 2 projects

### **Lỗi: Out of memory**

- Dump từng table một
- Hoặc filter data (chỉ copy một phần)

---

## 📚 Tài Liệu Tham Khảo

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Supabase Database Management](https://supabase.com/docs/guides/database)
