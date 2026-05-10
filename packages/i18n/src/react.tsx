"use client";

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from './index';

interface I18nProviderProps {
  children: React.ReactNode;
  locale?: 'vi';
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, locale = 'vi' }) => {
  const [i18nInstance, setI18nInstance] = useState<any>(null);

  useEffect(() => {
    initI18n(locale).then(setI18nInstance);
  }, [locale]);

  if (!i18nInstance) {
    return null;
  }

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};
