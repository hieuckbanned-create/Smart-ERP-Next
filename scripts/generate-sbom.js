/**
 * SBOM (Software Bill of Materials) Generator
 *
 * Parses pnpm-lock.yaml without external dependencies.
 * Usage: node scripts/generate-sbom.js [output-path]
 */

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const outputPath = process.argv[2] || join(__dirname, '..', 'sbom.json');

/** Extract dependency specs (lines like "ramda@0.27.1:") from lockfile */
function extractPackages(text) {
  const pkgs = [];
  const lines = text.split('\n');
  let inPackages = false;

  for (const line of lines) {
    if (line.startsWith('packages:')) { inPackages = true; continue; }
    if (!inPackages) continue;
    if (line.startsWith(' ') && line.trim().endsWith(':')) {
      const spec = line.trim().slice(0, -1);
      const atIdx = spec.lastIndexOf('@');
      if (atIdx > 0) {
        pkgs.push({ name: spec.slice(0, atIdx), version: spec.slice(atIdx + 1) });
      }
    }
  }
  return pkgs;
}

function generate() {
  const lockPath = join(__dirname, '..', 'pnpm-lock.yaml');
  const lockData = readFileSync(lockPath, 'utf8');
  const packages = extractPackages(lockData);

  const seen = new Set();
  const components = [];
  for (const pkg of packages) {
    const key = `${pkg.name}@${pkg.version}`;
    if (seen.has(key)) continue;
    seen.add(key);
    components.push({ type: 'library', name: pkg.name, version: pkg.version });
  }

  const sbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [{ vendor: 'SmartERP', name: 'sbom-generator', version: '1.0.0' }],
      component: { name: 'smart-erp-next', version: process.env.npm_package_version || '1.0.0', type: 'application' },
    },
    components,
  };

  writeFileSync(outputPath, JSON.stringify(sbom, null, 2));
  console.log(`SBOM generated: ${outputPath} (${components.length} components)`);
}

generate();
