# Smart ERP Next — One-Click Deployment Script (Windows PowerShell)
# Usage: .\deploy.ps1
# Requirements: Docker Desktop running, Git

param(
  [switch]$NoBuild,   # skip docker build (use cached images)
  [switch]$Logs       # tail logs after startup
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Smart ERP Next  v0.4.0  — Deploy       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check Docker ──────────────────────────────────────────────────────────
Write-Host "🔍 Checking Docker..." -ForegroundColor Blue
try {
  docker info | Out-Null
} catch {
  Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
  exit 1
}
Write-Host "   ✓ Docker is running" -ForegroundColor Green

# ── 2. Environment file ──────────────────────────────────────────────────────
if (-not (Test-Path .env)) {
  Write-Host ""
  Write-Host "⚠️  .env not found — creating from template..." -ForegroundColor Yellow
  Copy-Item .env.example .env
  Write-Host ""
  Write-Host "   ⚡ ACTION REQUIRED: Edit .env and set:" -ForegroundColor Yellow
  Write-Host "      DB_PASSWORD=<strong password>" -ForegroundColor Yellow
  Write-Host "      JWT_SECRET=<random 32+ char string>" -ForegroundColor Yellow
  Write-Host "      NEXT_PUBLIC_API_URL=http://<your-ip>:3000" -ForegroundColor Yellow
  Write-Host ""
  $confirm = Read-Host "   Press ENTER after editing .env to continue (or Ctrl+C to abort)"
}

# ── 3. Docker Compose up ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "🐳 Starting containers..." -ForegroundColor Blue

if ($NoBuild) {
  docker-compose up -d
} else {
  docker-compose up -d --build
}

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ docker-compose failed. Check logs: docker-compose logs" -ForegroundColor Red
  exit 1
}

# ── 4. Wait for API health ───────────────────────────────────────────────────
Write-Host ""
Write-Host "⏳ Waiting for API to be ready..." -ForegroundColor Blue
$maxWait = 60
$waited  = 0
do {
  Start-Sleep -Seconds 3
  $waited += 3
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($resp.StatusCode -eq 200) { break }
  } catch {}
  Write-Host "   ... ($waited s)" -ForegroundColor Gray
} while ($waited -lt $maxWait)

# ── 5. Done ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅  Smart ERP Next is running!          ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  🌐 Web Dashboard : http://localhost:3001 ║" -ForegroundColor Green
Write-Host "║  📡 API / Swagger : http://localhost:3000/api ║" -ForegroundColor Green
Write-Host "║  🤖 AI Forecast   : http://localhost:8000 ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Gray
Write-Host "  docker-compose logs -f          # view all logs" -ForegroundColor Gray
Write-Host "  docker-compose logs -f api      # API logs only" -ForegroundColor Gray
Write-Host "  docker-compose down             # stop everything" -ForegroundColor Gray
Write-Host "  docker-compose down -v          # stop + delete database" -ForegroundColor Gray
Write-Host ""

if ($Logs) {
  docker-compose logs -f
}
