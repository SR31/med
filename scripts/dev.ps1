Write-Host "Запуск PostgreSQL в Docker..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml up -d

Write-Host "Ожидание готовности базы..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    $result = docker exec med-postgres-dev pg_isready -U med 2>$null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 1
}
if (-not $ready) {
    Write-Host "База не запустилась за 30 секунд" -ForegroundColor Red
    exit 1
}

Write-Host "Запуск всех сервисов в режиме разработки..." -ForegroundColor Green
npm run dev
