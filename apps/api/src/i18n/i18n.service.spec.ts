import { I18nService } from './i18n.service';

describe('I18nService', () => {
  const service = new I18nService();

  it('loads supported locales from the shared i18n package', () => {
    expect(service.getAvailableLocales().sort()).toEqual(['en', 'vi']);
  });

  it('translates nested keys and falls back to Vietnamese', () => {
    expect(service.t('actions.save', 'en')).toBe('Save');
    expect(service.t('actions.save', 'vi')).toBe('Lưu');
    expect(service.t('actions.save', 'missing-locale')).toBe('Lưu');
  });

  it('returns the key when no translation exists', () => {
    expect(service.t('missing.translation.key', 'en')).toBe('missing.translation.key');
  });

  it('interpolates known params and preserves missing params', () => {
    expect(service.t('validation.required', 'en', { field: 'Email' })).toBe('Email is required');
    expect(service.t('validation.required', 'en')).toBe('{{field}} is required');
  });
});
