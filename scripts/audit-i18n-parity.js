#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const localeRoot = path.join(repoRoot, 'apps/web/src/lib/locales');
const requiredLocales = ['vi', 'en'];
const suspiciousVietnamesePattern = /\?(?!\s*$)/;

function readLocale(locale) {
  return JSON.parse(fs.readFileSync(path.join(localeRoot, locale, 'common.json'), 'utf8'));
}

function flatten(value, prefix = '', output = {}) {
  if (typeof value === 'string') {
    output[prefix] = value;
    return output;
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, nestedValue] of Object.entries(value)) {
      flatten(nestedValue, prefix ? `${prefix}.${key}` : key, output);
    }
  }

  return output;
}

function findI18nParityFindings() {
  const locales = Object.fromEntries(requiredLocales.map((locale) => [locale, flatten(readLocale(locale))]));
  const allKeys = [...new Set(Object.values(locales).flatMap((entries) => Object.keys(entries)))].sort();
  const missingKeys = [];
  const suspiciousVietnamese = [];

  for (const key of allKeys) {
    for (const locale of requiredLocales) {
      if (!(key in locales[locale])) missingKeys.push({ locale, key });
    }
  }

  for (const [key, value] of Object.entries(locales.vi)) {
    if (suspiciousVietnamesePattern.test(value)) suspiciousVietnamese.push({ key, value });
  }

  return { missingKeys, suspiciousVietnamese };
}

function main() {
  const findings = findI18nParityFindings();
  if (findings.missingKeys.length || findings.suspiciousVietnamese.length) {
    console.error('i18n parity audit failed.');
    for (const finding of findings.missingKeys) {
      console.error(`- Missing ${finding.locale}.${finding.key}`);
    }
    for (const finding of findings.suspiciousVietnamese) {
      console.error(`- Suspicious vi.${finding.key}: ${finding.value}`);
    }
    return 1;
  }

  console.log('i18n parity audit passed.');
  return 0;
}

if (require.main === module) process.exit(main());

module.exports = { findI18nParityFindings, flatten };
