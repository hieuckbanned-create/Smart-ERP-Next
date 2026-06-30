/**
 * Database Migration Test
 *
 * Tests that drizzle-kit migrations can run successfully against a database.
 * Usage: node scripts/test-migration.js
 *
 * Prerequisites: DATABASE_URL must point to a test database
 */

const { execSync } = require('child_process');
const path = require('path');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const drizzleDir = path.join(__dirname, '..', 'packages', 'database');
let exitCode = 0;

console.log('Testing database migrations...\n');

// Step 1: Generate migration (dry run)
console.log('1. Generating migration (dry run)...');
try {
  execSync('pnpm exec drizzle-kit generate --custom', { cwd: drizzleDir, stdio: 'pipe' });
  console.log('   ✅ Migration generation successful');
} catch (err) {
  console.error('   ❌ Migration generation failed');
  exitCode = 1;
}

// Step 2: Apply migration
console.log('2. Applying migration...');
try {
  execSync('pnpm exec drizzle-kit migrate', { cwd: drizzleDir, stdio: 'pipe' });
  console.log('   ✅ Migration applied successfully');
} catch (err) {
  console.error('   ❌ Migration apply failed');
  exitCode = 1;
}

process.exit(exitCode);
