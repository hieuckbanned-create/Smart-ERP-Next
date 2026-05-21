const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');

function readWorkflow(name) {
  return fs.readFileSync(path.join(__dirname, '..', '..', '.github', 'workflows', name), 'utf8');
}

describe('GitHub workflow definitions', () => {
  it('keeps the release workflow valid YAML', () => {
    const workflow = readWorkflow('release.yml');
    const doc = YAML.parseDocument(workflow, { prettyErrors: true });

    expect(doc.errors).toEqual([]);
  });

  it('does not bypass release coverage or quality gate failures', () => {
    const workflow = readWorkflow('release.yml');

    expect(workflow).toContain('pnpm qa:release');
    expect(workflow).not.toMatch(/\|\|\s*echo/i);
    expect(workflow).not.toContain('continuing release build');
  });
});
