const fs = require('fs');
const path = require('path');

describe('Load Test Infrastructure', () => {
  const repoRoot = path.resolve(__dirname, '../..');

  test('load-test.mjs exists', () => {
    expect(fs.existsSync(path.join(repoRoot, 'scripts', 'load-test.mjs'))).toBe(true);
  });

  test('load-test.mjs contains fetchWithTiming function', () => {
    const content = fs.readFileSync(path.join(repoRoot, 'scripts', 'load-test.mjs'), 'utf8');
    expect(content).toContain('fetchWithTiming');
    expect(content).toContain('simulateUser');
  });
});
