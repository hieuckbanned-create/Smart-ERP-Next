const os = require('node:os');
const path = require('node:path');
const { buildTauriEnv } = require('../run-tauri-build');

describe('run-tauri-build wrapper', () => {
  it('prepends repo shims and Cargo bin for Tauri release builds', () => {
    const env = buildTauriEnv('E:\\GitHub\\smart-erp-next\\apps\\desktop');
    const pathKey = Object.keys(env).find((key) => key.toLowerCase() === 'path') || 'PATH';
    const entries = env[pathKey].split(process.platform === 'win32' ? ';' : ':');

    expect(entries[0]).toBe('E:\\GitHub\\smart-erp-next\\scripts\\shims');
    expect(entries[1]).toBe(path.join(os.homedir(), '.cargo', 'bin'));
  });
});
