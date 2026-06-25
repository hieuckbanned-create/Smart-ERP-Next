# CI-equivalent local test using Docker for PostgreSQL
# Usage: .\scripts\ci-local.ps1
param(
    [string]$DB_NAME = "smart_erp_ci_test",
    [string]$DB_USER = "postgres",
    [string]$DB_PASS = "postgres",
    [int]$PORT = 5433
)

$ErrorActionPreference = "Stop"
$CONTAINER = "smart-erp-ci-pg"
$DATABASE_URL = "postgresql://${DB_USER}:${DB_PASS}@localhost:${PORT}/${DB_NAME}"
$env:JWT_SECRET = "ci-local-secret"

function pg { docker exec -i $CONTAINER psql -U $DB_USER -d $DB_NAME @args }

try {
    Write-Host "=== 1. Starting PostgreSQL container ==="
    docker rm -f $CONTAINER 2>$null
    docker run -d --name $CONTAINER -e POSTGRES_USER=$DB_USER -e POSTGRES_PASSWORD=$DB_PASS -e POSTGRES_DB=$DB_NAME -p ${PORT}:5432 postgres:16-alpine
    Write-Host "Waiting for postgres..."
    Start-Sleep 5
    $retries = 0
    do {
        $ready = docker exec $CONTAINER pg_isready -U $DB_USER 2>$null
        if ($ready -match "accepting connections") { break }
        Start-Sleep 2
        $retries++
    } while ($retries -lt 15)

    Write-Host "=== 2. Running migrations ==="
    Push-Location packages/database
    $env:DATABASE_URL = $DATABASE_URL
    pnpm exec drizzle-kit migrate
    Pop-Location

    Write-Host "=== 3. Running seed ==="
    $env:DATABASE_URL = $DATABASE_URL
    npx tsx apps/api/src/common/seeds/main.seed.ts

    Write-Host "=== 4. Quality gate ==="
    $env:DATABASE_URL = ""
    pnpm qa:commit

    Write-Host "=== 5. Build ==="
    $env:DATABASE_URL = ""
    pnpm build

    Write-Host "`n=== ALL PASSED ==="
} finally {
    Write-Host "=== Cleaning up ==="
    docker rm -f $CONTAINER 2>$null
}
