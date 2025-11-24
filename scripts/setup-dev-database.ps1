# Script đơn giản để setup development database từ migrations
# Usage: .\scripts\setup-dev-database.ps1

Write-Host "`n🚀 Setup Development Database từ Migrations" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Kiểm tra Supabase CLI
Write-Host "`n📦 Kiểm tra Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Supabase CLI chưa được cài đặt"
    }
    Write-Host "✅ Supabase CLI: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI chưa được cài đặt!" -ForegroundColor Red
    Write-Host "📝 Cài đặt: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Hướng dẫn
Write-Host "`n📋 Các bước:" -ForegroundColor Cyan
Write-Host "1. Tạo Supabase project mới tại: https://app.supabase.com" -ForegroundColor White
Write-Host "2. Lấy Project Reference ID từ Settings → General" -ForegroundColor White
Write-Host "3. Login vào Supabase CLI" -ForegroundColor White
Write-Host "4. Link với project mới" -ForegroundColor White
Write-Host "5. Chạy migrations" -ForegroundColor White

$continue = Read-Host "`nBạn đã tạo project mới chưa? (yes/no)"
if ($continue -ne "yes") {
    Write-Host "`n👉 Hãy tạo project mới trước:" -ForegroundColor Yellow
    Write-Host "   https://app.supabase.com → New Project" -ForegroundColor White
    exit 0
}

# Login
Write-Host "`n🔐 Đăng nhập Supabase..." -ForegroundColor Yellow
$loginChoice = Read-Host "Bạn đã login chưa? (yes/no)"
if ($loginChoice -ne "yes") {
    Write-Host "Mở browser để login..." -ForegroundColor Yellow
    supabase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login thất bại!" -ForegroundColor Red
        exit 1
    }
}

# Link project
Write-Host "`n🔗 Link với project..." -ForegroundColor Yellow
$projectRef = Read-Host "Nhập Project Reference ID"

try {
    supabase link --project-ref $projectRef
    if ($LASTEXITCODE -ne 0) {
        throw "Link failed"
    }
    Write-Host "✅ Đã link với project: $projectRef" -ForegroundColor Green
} catch {
    Write-Host "❌ Link thất bại! Kiểm tra lại Project Reference ID" -ForegroundColor Red
    exit 1
}

# Chạy migrations
Write-Host "`n🔄 Chạy migrations..." -ForegroundColor Yellow
$confirm = Read-Host "Bạn có chắc muốn chạy migrations? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Đã hủy" -ForegroundColor Yellow
    exit 0
}

try {
    supabase db push
    if ($LASTEXITCODE -ne 0) {
        throw "Migration failed"
    }
    Write-Host "✅ Migrations đã chạy thành công!" -ForegroundColor Green
} catch {
    Write-Host "❌ Migration thất bại!" -ForegroundColor Red
    exit 1
}

# Seed data (nếu có)
if (Test-Path "supabase/seed.sql") {
    Write-Host "`n🌱 Chạy seed data..." -ForegroundColor Yellow
    $seedChoice = Read-Host "Bạn có muốn chạy seed data? (yes/no)"
    if ($seedChoice -eq "yes") {
        try {
            supabase db reset
            Write-Host "✅ Seed data đã chạy thành công!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Seed data có lỗi, nhưng migrations đã chạy thành công" -ForegroundColor Yellow
        }
    }
}

# Lấy thông tin project
Write-Host "`n📝 Lấy thông tin project..." -ForegroundColor Yellow
try {
    $projectInfo = supabase projects list --json | ConvertFrom-Json
    $currentProject = $projectInfo | Where-Object { $_.id -eq $projectRef }
    
    if ($currentProject) {
        Write-Host "`n✅ Setup hoàn tất!" -ForegroundColor Green
        Write-Host "`n📋 Thông tin project:" -ForegroundColor Cyan
        Write-Host "   Project ID: $($currentProject.id)" -ForegroundColor White
        Write-Host "   URL: https://$($currentProject.id).supabase.co" -ForegroundColor White
        Write-Host "`n💡 Lấy API keys tại:" -ForegroundColor Yellow
        Write-Host "   https://app.supabase.com/project/$($currentProject.id)/settings/api" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️  Không thể lấy thông tin project tự động" -ForegroundColor Yellow
    Write-Host "💡 Lấy API keys tại: https://app.supabase.com/project/$projectRef/settings/api" -ForegroundColor White
}

Write-Host "`n🎉 Hoàn tất! Database đã sẵn sàng để test." -ForegroundColor Green

