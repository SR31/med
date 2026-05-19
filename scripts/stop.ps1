Write-Host "Остановка PostgreSQL..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml down
Write-Host "Готово." -ForegroundColor Green
