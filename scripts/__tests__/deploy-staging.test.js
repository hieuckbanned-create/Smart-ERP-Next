const fs = require('fs');
const path = require('path');

describe('Staging Deployment Pipeline', () => {
  const repoRoot = path.resolve(__dirname, '../..');

  test('deploy-staging.yml was removed (waiting for VPS setup)', () => {
    const f = path.join(repoRoot, '.github/workflows/deploy-staging.yml');
    expect(fs.existsSync(f)).toBe(false);
  });

  test('auto-deploy can be re-enabled by creating .github/workflows/deploy-staging.yml', () => {
    const example = path.join(repoRoot, 'docker-compose.prod.yml');
    expect(fs.existsSync(example)).toBe(true);
  });
});
