#!/bin/sh
set -e

# Run database migrations (idempotent)
if command -v npx >/dev/null 2>&1 && [ -f "packages/database/drizzle.config.ts" ]; then
  echo "Running database migrations..."
  npx drizzle-kit migrate --config=packages/database/drizzle.config.ts 2>/dev/null || echo "Migration skipped (may already be up to date)"
fi

# Start API server
echo "Starting API server on port ${PORT:-3456}..."
node apps/api/dist/apps/api/src/main.js &

# Start Web server if present
if [ -f "apps/web/node_modules/.bin/next" ] && [ -d "apps/web/.next" ]; then
  echo "Starting Web server on port ${WEB_PORT:-3457}..."
  PORT="${WEB_PORT:-3457}" node apps/web/node_modules/.bin/next start apps/web &
fi

# Wait for any child to exit
wait -n
exit $?
