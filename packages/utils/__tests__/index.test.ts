import * as utils from '../src/index';

describe('utils index exports', () => {
  it('should export all utility modules correctly', () => {
    expect(utils).toBeDefined();
    expect(utils.slugify).toBeDefined();
    expect(utils.formatVND).toBeDefined();
    expect(utils.formatDate).toBeDefined();
    expect(utils.formatCompact).toBeDefined();
  });
});
