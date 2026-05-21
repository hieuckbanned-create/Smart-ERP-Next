const {
  buildNextStartCommand,
} = require('../run-web-start');

describe('web production start runner', () => {
  it('strips pnpm argument separator before forwarding args to next start', () => {
    const command = buildNextStartCommand(['--', '-p', '3109'], '/repo/node_modules/next/dist/bin/next');

    expect(command.file).toBe(process.execPath);
    expect(command.args).toEqual(['/repo/node_modules/next/dist/bin/next', 'start', '-p', '3109']);
  });

  it('keeps normal next start args unchanged', () => {
    const command = buildNextStartCommand(['-H', '127.0.0.1'], '/repo/node_modules/next/dist/bin/next');

    expect(command.file).toBe(process.execPath);
    expect(command.args).toEqual(['/repo/node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1']);
  });
});
