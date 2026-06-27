const fs = require('fs');
const path = require('path');

describe('Staging Deployment Pipeline', () => {
  const repoRoot = path.resolve(__dirname, '../..');

  test('.github/workflows/deploy-staging.yml exists', () => {
    const f = path.join(repoRoot, '.github/workflows/deploy-staging.yml');
    expect(fs.existsSync(f)).toBe(true);
  });

  test('deploy-staging.yml triggers on push to dev branch', () => {
    const f = path.join(repoRoot, '.github/workflows/deploy-staging.yml');
    const content = fs.readFileSync(f, 'utf8');
    expect(content).toContain('push');
    expect(content).toContain('branches: [ dev ]');
  });

  test('deploy-staging.yml builds Docker image and pushes to GHCR', () => {
    const f = path.join(repoRoot, '.github/workflows/deploy-staging.yml');
    const content = fs.readFileSync(f, 'utf8');
    expect(content).toContain('docker/build-push-action');
    expect(content).toContain('ghcr.io');
  });

  test('deploy-staging.yml deploys to staging server via SSH', () => {
    const f = path.join(repoRoot, '.github/workflows/deploy-staging.yml');
    const content = fs.readFileSync(f, 'utf8');
    expect(content).toContain('ssh');
  });
});
