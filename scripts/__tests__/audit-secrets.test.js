const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.join(__dirname, '..', '..');

describe('secret audit', () => {
  it('passes on the tracked repository contents', () => {
    const result = spawnSync('node', ['scripts/audit-secrets.js'], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Secret audit passed');
  });
});
