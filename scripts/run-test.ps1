# Script helper để chạy tests với output rõ ràng

param(
    [string]$TestPath = "",
    [switch]$Watch = $false,
    [switch]$Coverage = $false
)

Write-Host "`n🧪 Running Tests..." -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

if ($TestPath) {
    Write-Host "📁 Test Path: $TestPath" -ForegroundColor Yellow
} else {
    Write-Host "📁 Running all tests" -ForegroundColor Yellow
}

if ($Watch) {
    Write-Host "👀 Watch mode: ON" -ForegroundColor Green
    if ($TestPath) {
        npm run test:watch -- $TestPath
    } else {
        npm run test:watch
    }
} elseif ($Coverage) {
    Write-Host "📊 Coverage mode: ON" -ForegroundColor Green
    if ($TestPath) {
        npm run test:coverage -- $TestPath
    } else {
        npm run test:coverage
    }
} else {
    Write-Host "▶️  Running tests..." -ForegroundColor Green
    if ($TestPath) {
        npm test -- $TestPath --verbose
    } else {
        npm test
    }
}

Write-Host "`n✅ Done!" -ForegroundColor Green

