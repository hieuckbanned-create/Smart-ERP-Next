#!/bin/sh
set -e

echo "Running database migrations..."
node apps/api/dist/apps/api/src/common/migrations/run-migrations.js 2>/dev/null || true

echo "Running database seed..."
node apps/api/dist/packages/database/src/seed.js 2>/dev/null || true

echo "Starting API server..."
exec node apps/api/dist/apps/api/src/main.js
