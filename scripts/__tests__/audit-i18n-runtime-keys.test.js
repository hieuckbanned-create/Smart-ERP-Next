const { findI18nFindings, getNestedValue, isResolvable } = require('../audit-i18n-runtime-keys');

describe('i18n runtime key audit', () => {
  it('treats string values and titled objects as resolvable', () => {
    expect(isResolvable('Save')).toBe(true);
    expect(isResolvable({ title: 'Search' })).toBe(true);
    expect(isResolvable({ subtitle: 'Search' })).toBe(false);
  });

  it('reads nested translation values', () => {
    expect(getNestedValue({ a: { b: 'value' } }, 'a.b')).toBe('value');
    expect(getNestedValue({ a: {} }, 'a.b')).toBeUndefined();
  });

  it('has no unresolved runtime translation keys or mojibake resources', () => {
    expect(findI18nFindings()).toEqual({
      missingRuntimeKeys: [],
      mojibakeStrings: [],
      sourceMojibake: [],
    });
  });
});
