const { spawnSync } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');

function buildTauriEnv(cwd = process.cwd()) {
  const pathKey = Object.keys(process.env).find((key) => key.toLowerCase() === 'path') || 'PATH';
  const pathSeparator = process.platform === 'win32' ? ';' : ':';
  const repoRoot = path.resolve(cwd, '..', '..');
  const shimDir = path.join(repoRoot, 'scripts', 'shims');
  const cargoDir = path.join(os.homedir(), '.cargo', 'bin');
  const currentPath = process.env[pathKey] || '';

  return {
    ...process.env,
    [pathKey]: [shimDir, cargoDir, currentPath].filter(Boolean).join(pathSeparator),
  };
}

function runTauriBuild(args = process.argv.slice(2), cwd = process.cwd()) {
  const result = spawnSync('tauri', ['build', ...args], {
    cwd,
    env: buildTauriEnv(cwd),
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  return result.status ?? 1;
}

if (require.main === module) {
  process.exit(runTauriBuild());
}

module.exports = {
  buildTauriEnv,
  runTauriBuild,
};
