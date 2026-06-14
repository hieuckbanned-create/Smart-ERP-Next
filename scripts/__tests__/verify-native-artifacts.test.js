const {
  getRequiredArtifacts,
  isInstallableArtifact,
  isTruthyEnv,
} = require('../verify-native-artifacts');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

describe('native artifact verifier', () => {
  it('requires iOS artifacts by default', () => {
    const platforms = getRequiredArtifacts({}).map((artifact) => artifact.platform);

    expect(platforms).toEqual(['android', 'ios', 'windows']);
  });

  it('allows iOS artifact checks to be intentionally skipped', () => {
    const platforms = getRequiredArtifacts({ SKIP_IOS_ARTIFACT: '1' }).map((artifact) => artifact.platform);

    expect(platforms).toEqual(['android', 'windows']);
  });

  it('accepts common truthy environment values', () => {
    expect(isTruthyEnv('1')).toBe(true);
    expect(isTruthyEnv('true')).toBe(true);
    expect(isTruthyEnv('yes')).toBe(true);
    expect(isTruthyEnv('on')).toBe(true);
    expect(isTruthyEnv('0')).toBe(false);
  });

  it('rejects placeholder files even when the extension matches', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'native-artifact-'));
    const fakeIpa = path.join(tempDir, 'fake.ipa');
    fs.writeFileSync(fakeIpa, 'not a real ipa');

    expect(isInstallableArtifact(fakeIpa, getRequiredArtifacts({})[1])).toBe(false);
  });

  it('accepts installable-looking archives with a valid zip signature', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'native-artifact-'));
    const ipa = path.join(tempDir, 'app.ipa');
    const payload = Buffer.alloc(2048);
    payload[0] = 0x50;
    payload[1] = 0x4b;
    fs.writeFileSync(ipa, payload);

    expect(isInstallableArtifact(ipa, getRequiredArtifacts({})[1])).toBe(true);
  });
});
