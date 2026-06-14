const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  findIosPrereqFindings,
  hasAscApiKey,
  isTruthy,
} = require('../verify-ios-release-prereqs');

describe('iOS release preflight', () => {
  it('requires EAS identity and iOS signing proof', () => {
    expect(findIosPrereqFindings({})).toEqual({
      missing: ['EXPO_TOKEN', 'EAS_PROJECT_ID', 'iOS signing credentials'],
      warnings: [expect.stringContaining('EAS_IOS_CREDENTIALS_READY=true')],
    });
  });

  it('rejects non-UUID EAS project ids', () => {
    expect(
      findIosPrereqFindings({
        EAS_IOS_CREDENTIALS_READY: 'true',
        EAS_PROJECT_ID: 'placeholder',
        EXPO_TOKEN: 'token',
      }).missing,
    ).toEqual(['EAS_PROJECT_ID must be a UUID']);
  });

  it('accepts explicit EAS stored signing acknowledgement', () => {
    expect(
      findIosPrereqFindings({
        EAS_IOS_CREDENTIALS_READY: 'true',
        EAS_PROJECT_ID: '123e4567-e89b-42d3-a456-426614174000',
        EXPO_TOKEN: 'token',
      }),
    ).toEqual({ missing: [], warnings: [] });
  });

  it('accepts App Store Connect API key files', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asc-key-'));
    const keyPath = path.join(tempDir, 'AuthKey.p8');
    fs.writeFileSync(keyPath, 'key');

    expect(
      hasAscApiKey({
        ASC_API_KEY_ID: 'KEYID',
        ASC_API_KEY_ISSUER_ID: 'ISSUER',
        ASC_API_KEY_PATH: keyPath,
      }),
    ).toBe(true);
  });

  it('parses truthy values', () => {
    expect(isTruthy('yes')).toBe(true);
    expect(isTruthy('0')).toBe(false);
  });
});
