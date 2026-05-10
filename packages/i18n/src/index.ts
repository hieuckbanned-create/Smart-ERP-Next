import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import viCommon from './locales/vi/common.json';
import enCommon from './locales/en/common.json';

export const resources = {
  vi: { common: viCommon },
  en: { common: enCommon },
} as const;

export type Language = keyof typeof resources;
export type Namespace = keyof (typeof resources)[Language];

export const defaultNS = 'common';
export const fallbackLng: Language = 'vi';

export const initI18n = (lang: Language = fallbackLng) => {
  if (i18n.isInitialized) {
    // Already initialised — just change language if needed
    if (i18n.language !== lang) i18n.changeLanguage(lang);
    return Promise.resolve(i18n);
  }
  return i18n.use(initReactI18next).init({
    resources,
    lng: lang,
    fallbackLng,
    ns: [defaultNS],
    defaultNS,
    interpolation: { escapeValue: false },
    // Prevent console warnings in SSR
    react: { useSuspense: false },
  });
};

// Re-export hook for convenience
export { useTranslation, i18n };

/** Pure (non-hook) translation helper — useful in utils/services */
export const t = (key: string, lang: Language = fallbackLng): string => {
  const ns = defaultNS;
  const resource = resources[lang]?.[ns as keyof (typeof resources)[typeof lang]];
  if (resource && typeof resource === 'object') {
    // Support nested keys like "products.title"
    const parts = key.split('.');
    let current: any = resource;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return key;
      }
    }
    return typeof current === 'string' ? current : key;
  }
  return key;
};
