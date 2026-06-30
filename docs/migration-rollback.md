# Migration Rollback Guide

## Overview

This document outlines the rollback process for database migrations. The project uses Drizzle ORM with PostgreSQL. Each migration is reversible if proper rollback scripts are maintained.

## Prerequisites

- `drizzle-kit` installed (available via pnpm)
- Access to the target database
- The migration file to be rolled back

## Rollback Process

### Step 1: Identify the migration

```bash
# List all applied migrations
cd packages/database
pnpm exec drizzle-kit migrate:status
```

### Step 2: Generate rollback SQL

Drizzle generates both `up` and `down` SQL files. If a rollback file doesn't exist:

```bash
# Create a manual rollback migration
pnpm exec drizzle-kit generate --custom
```

Edit the generated file to include both `up` (revert) and `down` (restore) sections.

### Step 3: Apply rollback

```bash
# Apply rollback manually via psql
psql $DATABASE_URL -f packages/database/drizzle/rollback-<name>.sql

# Or use the rollback script
pnpm db:rollback
```

### Step 4: Update migration tracking

Drizzle tracks applied migrations in the `__drizzle_migrations` table. After rollback:

```sql
DELETE FROM "__drizzle_migrations" WHERE hash = '<rolled-back-hash>';
```

## CI/CD Integration

In CI, migrations are automatically applied. If a deployment fails:

1. **Do NOT** automatically rollback in CI — this requires human judgment
2. Instead, deploy the previous working version and run the rollback manually
3. Document the incident in the release notes

## Best Practices

1. **Never modify an applied migration** — always create a new migration to revert
2. **Test rollback locally** before deploying
3. **Keep backward compatibility** — don't remove columns that might still be referenced
4. **Use `ALTER TABLE ... IF EXISTS`** in rollback scripts to handle partial states
5. **Commit rollback scripts** alongside the original migration

## Rollback Script Template

```sql
-- rollback-<name>.sql
-- Reverts migration: <description>

BEGIN;

-- Example: restore a dropped column
ALTER TABLE IF EXISTS <table_name>
ADD COLUMN IF NOT EXISTS <column_name> <type>;

-- Example: restore a removed constraint
ALTER TABLE IF EXISTS <table_name>
ADD CONSTRAINT <constraint_name> <definition>;

-- Remove the migration tracking record
DELETE FROM "__drizzle_migrations"
WHERE hash = '<migration-hash>';

COMMIT;
```
