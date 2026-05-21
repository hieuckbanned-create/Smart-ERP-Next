const { spawn } = require('node:child_process');
const {
  validateProductionBuild,
} = require('./verify-web-production-build');

function normalizeStartArgs(argv = process.argv.slice(2)) {
  return argv[0] === '--' ? argv.slice(1) : argv;
}

function resolveNextBin(cwd = process.cwd()) {
  try {
    return require.resolve('next/dist/bin/next', { paths: [cwd] });
  } catch {
    return require.resolve('next/dist/bin/next');
  }
}

function buildNextStartCommand(argv = process.argv.slice(2), nextBin = resolveNextBin()) {
  return {
    file: process.execPath,
    args: [nextBin, 'start', ...normalizeStartArgs(argv)],
  };
}

function printFindings(findings) {
  console.error('Web production build verification failed.');
  console.error('The .next artifact is not safe for next start.');
  for (const finding of findings) {
    console.error(`- ${finding.file}: ${finding.reason}`);
  }
}

function main() {
  const findings = validateProductionBuild(process.cwd());
  if (findings.length > 0) {
    printFindings(findings);
    process.exit(1);
  }

  console.log('Web production build verification passed.');
  const command = buildNextStartCommand();
  const child = spawn(command.file, command.args, {
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
  buildNextStartCommand,
  normalizeStartArgs,
  resolveNextBin,
};
