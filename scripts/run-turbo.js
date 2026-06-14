const { spawnSync } = require('node:child_process');
const path = require('node:path');

function buildTurboEnv(cwd = process.cwd()) {
  const pathKey = Object.keys(process.env).find((key) => key.toLowerCase() === 'path') || 'PATH';
  const pathSeparator = process.platform === 'win32' ? ';' : ':';
  const shimDir = path.join(cwd, 'scripts', 'shims');
  const currentPath = process.env[pathKey] || '';

  return {
    ...process.env,
    [pathKey]: [shimDir, currentPath].filter(Boolean).join(pathSeparator),
  };
}

function runTurbo(args = process.argv.slice(2), cwd = process.cwd()) {
  const result = spawnSync('turbo', args, {
    cwd,
    env: buildTurboEnv(cwd),
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  return result.status ?? 1;
}

if (require.main === module) {
  process.exit(runTurbo());
}

module.exports = {
  buildTurboEnv,
  runTurbo,
};
