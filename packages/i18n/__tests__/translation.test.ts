import { defaultNS, fallbackLng, i18n, initI18n, resources, t } from '../src';

describe('i18n resources and helpers', () => {
  afterEach(() => {
    if (i18n.isInitialized && i18n.language !== fallbackLng) {
      i18n.changeLanguage(fallbackLng);
    }
  });

  it('ships Vietnamese and English common resources', () => {
    expect(defaultNS).toBe('common');
    expect(fallbackLng).toBe('vi');
    expect(resources.vi.common.appName).toBe('Smart ERP Next');
    expect(resources.en.common.tagline).toBe('Intelligent Business Management System');
  });

  it('translates nested keys without initializing React i18next', () => {
    expect(t('actions.save', 'vi')).toBe('Lưu');
    expect(t('actions.save', 'en')).toBe('Save');
    expect(t('actions.search.placeholder', 'en')).toBe('Search products, orders, customers...');
  });

  it('returns the key when a nested translation is missing or non-string', () => {
    expect(t('actions.not_real', 'vi')).toBe('actions.not_real');
    expect(t('actions.search', 'en')).toBe('actions.search');
  });

  it('initializes i18next once and changes language on later calls', async () => {
    await initI18n('vi');
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBe('vi');

    await initI18n('en');
    expect(i18n.language).toBe('en');
  });
});
