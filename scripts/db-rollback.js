/**
 * Database Migration Rollback Helper
 *
 * Usage: node scripts/db-rollback.js <migration-name>
 *
 * Applies the down migration SQL file for a given migration.
 * The rollback SQL file should be located at:
 *   packages/database/drizzle/rollback-<name>.sql
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const migrationName = process.argv[2];
if (!migrationName) {
  console.error('Usage: node scripts/db-rollback.js <migration-name>');
  process.exit(1);
}

const rollbackPath = join(__dirname, '..', 'packages', 'database', 'drizzle', `rollback-${migrationName}.sql`);

if (!existsSync(rollbackPath)) {
  console.error(`Rollback script not found: ${rollbackPath}`);
  console.error('Create a rollback SQL file first.');
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

console.log(`Applying rollback: ${migrationName}`);
try {
  execSync(`psql "${databaseUrl}" -f "${rollbackPath}"`, { stdio: 'inherit' });
  console.log('Rollback applied successfully');
} catch (error) {
  console.error('Rollback failed:', error.message);
  process.exit(1);
}
