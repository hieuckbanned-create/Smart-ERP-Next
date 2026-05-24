const fs = require('node:fs');
const path = require('node:path');

const drizzleDir = path.join(__dirname, '..', '..', 'packages', 'database', 'drizzle');

function readOfficialMigrationSql() {
  const journal = JSON.parse(fs.readFileSync(path.join(drizzleDir, 'meta', '_journal.json'), 'utf8'));

  return journal.entries
    .map((entry) => fs.readFileSync(path.join(drizzleDir, `${entry.tag}.sql`), 'utf8'))
    .join('\n');
}

describe('database migrations', () => {
  it('keeps product catalog columns in the official Drizzle migration journal', () => {
    const sql = readOfficialMigrationSql();

    expect(sql).toContain('ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "image_url" text');
    expect(sql).toContain('ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category_id" uuid');
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS "products_category_id_idx"');
  });
});
