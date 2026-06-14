const { spawnSync } = require('node:child_process');
const { findNativeArtifacts } = require('./verify-native-artifacts');

function hasWindowsArtifact() {
  const windowsArtifacts = findNativeArtifacts({ SKIP_IOS_ARTIFACT: '1' }).find(
    (artifact) => artifact.platform === 'windows',
  );

  return Boolean(windowsArtifacts?.matches.length);
}

function ensureDesktopReleaseArtifact() {
  if (process.platform === 'win32') {
    const result = spawnSync('pnpm', ['--filter', '@smart-erp/desktop', 'windows:build'], {
      shell: true,
      stdio: 'inherit',
    });

    return result.status ?? 1;
  }

  if (hasWindowsArtifact()) {
    console.log('Windows desktop installer verified from downloaded release artifacts.');
    return 0;
  }

  console.error('Windows desktop installer is missing.');
  console.error('Build it on Windows or download the windows-native-artifacts CI artifact before release certification.');
  return 1;
}

if (require.main === module) {
  process.exit(ensureDesktopReleaseArtifact());
}

module.exports = {
  ensureDesktopReleaseArtifact,
  hasWindowsArtifact,
};
