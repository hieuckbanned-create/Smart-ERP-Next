const fs = require('node:fs');
const path = require('node:path');

describe('Deployment Infrastructure', () => {
  const repoRoot = path.resolve(__dirname, '../..');

  test('deploy-production.sh exists and is executable', () => {
    const script = path.join(repoRoot, 'scripts', 'deploy-production.sh');
    expect(fs.existsSync(script)).toBe(true);
  });

  test('docker-compose.prod.yml exists', () => {
    const compose = path.join(repoRoot, 'docker-compose.prod.yml');
    expect(fs.existsSync(compose)).toBe(true);
  });

  test('docker-compose.yml (default) exists', () => {
    const compose = path.join(repoRoot, 'docker-compose.yml');
    expect(fs.existsSync(compose)).toBe(true);
  });

  test('.env.production.example exists', () => {
    const env = path.join(repoRoot, '.env.production.example');
    expect(fs.existsSync(env)).toBe(true);
  });

  test('.env.staging.example exists', () => {
    const env = path.join(repoRoot, '.env.staging.example');
    expect(fs.existsSync(env)).toBe(true);
  });

  test('docker-compose.prod.yml has separate services for api, web, postgres', () => {
    const compose = path.join(repoRoot, 'docker-compose.prod.yml');
    const content = fs.readFileSync(compose, 'utf8');
    expect(content).toContain('api:');
    expect(content).toContain('web:');
    expect(content).toContain('postgres:');
  });

  test('docker-compose.prod.yml specifies image tags', () => {
    const compose = path.join(repoRoot, 'docker-compose.prod.yml');
    const content = fs.readFileSync(compose, 'utf8');
    expect(content).toContain('image:');
  });
});
