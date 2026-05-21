const {
  buildNextDevCommand,
} = require('../run-web-dev');

describe('web dev runner', () => {
  it('uses a separate Next dist directory for dev artifacts', () => {
    const command = buildNextDevCommand(['--port', '3000'], { EXISTING: '1' }, '/repo/node_modules/next/dist/bin/next');

    expect(command.file).toBe(process.execPath);
    expect(command.args).toEqual(['/repo/node_modules/next/dist/bin/next', 'dev', '--port', '3000']);
    expect(command.env).toMatchObject({
      EXISTING: '1',
      NEXT_DIST_DIR: '.next-dev',
    });
  });

  it('preserves an explicit dist directory override', () => {
    const command = buildNextDevCommand([], { NEXT_DIST_DIR: '.custom-next-dev' }, '/repo/node_modules/next/dist/bin/next');

    expect(command.file).toBe(process.execPath);
    expect(command.args).toEqual(['/repo/node_modules/next/dist/bin/next', 'dev']);
    expect(command.env.NEXT_DIST_DIR).toBe('.custom-next-dev');
  });
});
