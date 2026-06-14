const { extractEasArtifactDownloads } = require('../download-eas-artifacts');

describe('EAS artifact metadata parser', () => {
  it('extracts Android and iOS artifact download URLs from EAS JSON', () => {
    expect(
      extractEasArtifactDownloads([
        { platform: 'ANDROID', artifacts: { buildUrl: 'https://example.com/app.apk' } },
        { platform: 'IOS', artifacts: { buildUrl: 'https://example.com/app.ipa' } },
      ]),
    ).toEqual([
      { filename: 'android.apk', platform: 'android', url: 'https://example.com/app.apk' },
      { filename: 'ios.ipa', platform: 'ios', url: 'https://example.com/app.ipa' },
    ]);
  });

  it('supports wrapped EAS metadata shapes', () => {
    expect(
      extractEasArtifactDownloads({
        data: [{ job: { platform: 'ios' }, artifacts: { applicationArchiveUrl: 'https://example.com/build' } }],
      }),
    ).toEqual([{ filename: 'ios.ipa', platform: 'ios', url: 'https://example.com/build' }]);
  });
});
