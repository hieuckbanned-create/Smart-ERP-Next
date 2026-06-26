#!/bin/sh
set -e

echo "============================================"
echo "  Smart ERP Next — Starting..."
echo "============================================"

# Run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  if command -v npx >/dev/null 2>&1 && [ -f "packages/database/drizzle.config.ts" ]; then
    echo "Running database migrations..."
    npx drizzle-kit migrate --config=packages/database/drizzle.config.ts || echo "⚠️  Migration failed"
  fi

  # Auto-seed demo data if database is empty
  if command -v node >/dev/null 2>&1 && [ -f "apps/api/dist/apps/api/src/common/seeds/main.seed.js" ]; then
    USER_COUNT=$(node -e "
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      pool.query('SELECT COUNT(*)::int as cnt FROM users WHERE email = \$1', ['admin@smarterp.vn'])
        .then(r => { console.log(r.rows[0].cnt); pool.end(); })
        .catch(() => { console.log('0'); pool.end(); });
    " 2>/dev/null || echo "0")

    if [ "$USER_COUNT" = "0" ]; then
      echo "Seeding demo data..."
      node apps/api/dist/apps/api/src/common/seeds/main.seed.js && echo "Demo data seeded" || echo "⚠️  Seed failed"
    else
      echo "Database already populated, skipping seed"
    fi
  fi
else
  echo ""
  echo "============================================"
  echo "  ⚠️  DATABASE_URL not set"
  echo ""
  echo "  Easiest: use docker compose (recommended)"
  echo "    docker compose up -d"
  echo ""
  echo "  Or one-liner with postgres container:"
  echo '    docker run -d --name pg -e POSTGRES_PASSWORD=smart_erp -e POSTGRES_DB=smart_erp postgres:16-alpine'
  echo '    PG_IP=$(docker inspect -f "{{.NetworkSettings.IPAddress}}" pg)'
  echo '    docker run -d --name app -p 3456:3456 -p 3457:3457 \'
  echo '      -e DATABASE_URL="postgresql://postgres:smart_erp@${PG_IP}:5432/smart_erp" \'
  echo "      ghcr.io/hieuck/smart-erp-next:\${TAG:-latest}"
  echo ""
  echo "  Exiting. Set DATABASE_URL and restart."
  echo "============================================"
  echo ""
  exit 1
fi

# Start API server
echo "Starting API server on port ${PORT:-3456}..."
node apps/api/dist/apps/api/src/main.js &

# Start Web server if present
if [ -f "apps/web/.next/standalone/server.js" ]; then
  echo "Starting Web server (standalone) on port ${WEB_PORT:-3457}..."
  cd apps/web && PORT="${WEB_PORT:-3457}" node .next/standalone/server.js &
  cd /app
elif [ -f "apps/web/.next/standalone/apps/web/server.js" ]; then
  echo "Starting Web server (standalone, monorepo path) on port ${WEB_PORT:-3457}..."
  cd apps/web && PORT="${WEB_PORT:-3457}" node .next/standalone/apps/web/server.js &
  cd /app
elif [ -f "apps/web/node_modules/.bin/next" ] && [ -d "apps/web/.next" ]; then
  echo "Starting Web server (next start) on port ${WEB_PORT:-3457}..."
  cd apps/web && PORT="${WEB_PORT:-3457}" node_modules/.bin/next start &
  cd /app
fi

echo "============================================"
echo "  API: http://localhost:${PORT:-3456}"
echo "  Web: http://localhost:${WEB_PORT:-3457}"
echo "  Login: admin@smarterp.vn / admin123"
echo "============================================"

# Wait for any child to exit
wait -n
exit $?
