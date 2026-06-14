const { buildTurboEnv } = require('../run-turbo');

describe('run-turbo wrapper', () => {
  it('prepends repo-local pnpm shims for Turbo package manager discovery', () => {
    const env = buildTurboEnv('E:\\GitHub\\smart-erp-next');
    const pathKey = Object.keys(env).find((key) => key.toLowerCase() === 'path') || 'PATH';

    expect(env[pathKey].split(process.platform === 'win32' ? ';' : ':')[0]).toBe(
      'E:\\GitHub\\smart-erp-next\\scripts\\shims',
    );
  });
});
