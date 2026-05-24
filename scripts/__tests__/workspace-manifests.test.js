const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..', '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

describe('workspace package manifests', () => {
  it('declares Node types for workspace tests that use Node globals', () => {
    const manifest = readJson('packages/hooks/package.json');

    expect(manifest.devDependencies).toHaveProperty('@types/node');
  });
});
