@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Smart ERP Next Dev

if not exist .env (
  echo Tao .env tu .env.example...
  copy .env.example .env >nul
)

echo Kiem tra PostgreSQL...
docker compose ps postgres --format "{{.Status}}" 2>nul | findstr /i "healthy" >nul
if errorlevel 1 (
  echo Dang khoi dong PostgreSQL...
  docker compose up -d postgres
  :waitpg
  timeout /t 2 /nobreak >nul
  docker compose exec postgres pg_isready -U smart_erp 2>nul | findstr "accept" >nul
  if errorlevel 1 goto waitpg
  echo PostgreSQL san sang
)

echo Dang chay database migrations...
pnpm exec drizzle-kit migrate --config=packages/database/drizzle.config.ts 2>nul

echo.
echo ============================================
echo  Smart ERP Next — Dev Server
echo ============================================
echo  API: http://localhost:3456
echo  Web: http://localhost:3457
echo ============================================
echo.

start "API" cmd /c "pnpm --filter @smart-erp/api dev"
start "Web" cmd /c "pnpm --filter @smart-erp/web dev"

echo Nhan phim bat ky de dung tat ca servers...
pause >nul
taskkill /f /fi "WINDOWTITLE eq API" >nul 2>nul
taskkill /f /fi "WINDOWTITLE eq Web" >nul 2>nul
echo Da dung.
