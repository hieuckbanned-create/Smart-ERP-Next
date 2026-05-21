const { spawn } = require('node:child_process');

function resolveNextBin(cwd = process.cwd()) {
  try {
    return require.resolve('next/dist/bin/next', { paths: [cwd] });
  } catch {
    return require.resolve('next/dist/bin/next');
  }
}

function buildNextDevCommand(argv = process.argv.slice(2), env = process.env, nextBin = resolveNextBin()) {
  return {
    file: process.execPath,
    args: [nextBin, 'dev', ...argv],
    env: {
      ...env,
      NEXT_DIST_DIR: env.NEXT_DIST_DIR || '.next-dev',
    },
  };
}

function main() {
  const command = buildNextDevCommand();
  const child = spawn(command.file, command.args, {
    env: command.env,
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  buildNextDevCommand,
  resolveNextBin,
};
