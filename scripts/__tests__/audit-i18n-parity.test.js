const { findI18nParityFindings, flatten } = require('../audit-i18n-parity');

describe('i18n parity audit', () => {
  it('flattens nested locale keys', () => {
    expect(flatten({ common: { save: 'Save' }, title: 'Title' })).toEqual({
      'common.save': 'Save',
      title: 'Title',
    });
  });

  it('keeps Vietnamese and English locale keys in sync without suspicious Vietnamese mojibake', () => {
    const findings = findI18nParityFindings();

    expect(findings.missingKeys).toEqual([]);
    expect(findings.suspiciousVietnamese).toEqual([]);
  });
});
