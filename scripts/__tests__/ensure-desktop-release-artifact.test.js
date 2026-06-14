const { hasWindowsArtifact } = require('../ensure-desktop-release-artifact');

describe('desktop release artifact gate', () => {
  it('can inspect the current workspace for a signed Windows artifact', () => {
    expect(typeof hasWindowsArtifact()).toBe('boolean');
  });
});
