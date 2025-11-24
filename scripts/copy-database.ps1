# Script để copy database từ Production sang Development
# Usage: .\scripts\copy-database.ps1

param(
    [string]$ProdProjectRef = "",
    [string]$ProdDbPassword = "",
    [string]$DevProjectRef = "",
    [string]$DevDbPassword = ""
)

# Kiểm tra tham số
if ([string]::IsNullOrEmpty($ProdProjectRef)) {
    $ProdProjectRef = Read-Host "Nhập Production Project Reference ID"
}

if ([string]::IsNullOrEmpty($ProdDbPassword)) {
    $ProdDbPassword = Read-Host "Nhập Production Database Password" -AsSecureString
    $ProdDbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ProdDbPassword)
    )
}

if ([string]::IsNullOrEmpty($DevProjectRef)) {
    $DevProjectRef = Read-Host "Nhập Development Project Reference ID"
}

if ([string]::IsNullOrEmpty($DevDbPassword)) {
    $DevDbPassword = Read-Host "Nhập Development Database Password" -AsSecureString
    $DevDbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DevDbPassword)
    )
}

# Backup directory
$BACKUP_DIR = ".\supabase\backups"
New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null

$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\prod-backup-$TIMESTAMP.sql"

Write-Host "`n🔄 Bắt đầu dump database từ Production..." -ForegroundColor Cyan

# Dump từ Production
$PROD_CONNECTION = "postgresql://postgres:$ProdDbPassword@db.$ProdProjectRef.supabase.co:5432/postgres"

try {
    pg_dump $PROD_CONNECTION `
        --schema=public `
        --no-owner `
        --no-acl `
        --verbose `
        -f $BACKUP_FILE

    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }

    $fileSize = (Get-Item $BACKUP_FILE).Length / 1MB
    Write-Host "✅ Dump completed! File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
    Write-Host "📁 Backup saved to: $BACKUP_FILE" -ForegroundColor Green
} catch {
    Write-Host "❌ Error dumping database: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔄 Bắt đầu restore database vào Development..." -ForegroundColor Cyan

# Restore vào Development
$DEV_CONNECTION = "postgresql://postgres:$DevDbPassword@db.$DevProjectRef.supabase.co:5432/postgres"

try {
    # Xác nhận trước khi restore
    $confirm = Read-Host "⚠️  Bạn có chắc muốn restore vào Development? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "❌ Đã hủy restore" -ForegroundColor Yellow
        exit 0
    }

    Get-Content $BACKUP_FILE | psql $DEV_CONNECTION

    if ($LASTEXITCODE -ne 0) {
        throw "psql restore failed with exit code $LASTEXITCODE"
    }

    Write-Host "✅ Restore completed!" -ForegroundColor Green
    Write-Host "`n🎉 Database đã được copy thành công!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error restoring database: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n📝 Lưu ý:" -ForegroundColor Yellow
Write-Host "   - Storage buckets cần copy riêng" -ForegroundColor Yellow
Write-Host "   - Edge Functions cần deploy riêng" -ForegroundColor Yellow
Write-Host "   - Kiểm tra RLS policies sau khi restore" -ForegroundColor Yellow

