const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOTS = ['apps/web/src', 'apps/mobile/src', 'packages'];
const SOURCE_EXTENSIONS = /\.(tsx?|jsx?)$/;
const IGNORED_SEGMENTS = new Set(['node_modules', '.next', '.next-dev', 'dist', 'build', 'target', '.turbo']);
const TRANSLATION_CALL_PATTERN = /\bt\(\s*['"]([^'"{}$]+)['"]/g;
const MOJIBAKE_PATTERN = /(?:[\u00c2\u00c3\u00c4\u00c6][\u0080-\u00bf]|\u00e2[\u0080-\u00bf]{1,2}|\ufffd)/;

function walkSourceFiles(relativeDir, files = []) {
  const dir = path.join(REPO_ROOT, relativeDir);
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_SEGMENTS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(path.relative(REPO_ROOT, fullPath), files);
    } else if (
      SOURCE_EXTENSIONS.test(entry.name) &&
      !fullPath.includes(`${path.sep}__tests__${path.sep}`) &&
      !entry.name.includes('.coverage.')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractRuntimeKeys() {
  const keys = new Map();

  for (const root of SOURCE_ROOTS) {
    for (const filePath of walkSourceFiles(root)) {
      const content = fs.readFileSync(filePath, 'utf8');
      let match;
      while ((match = TRANSLATION_CALL_PATTERN.exec(content))) {
        const key = match[1];
        if (!keys.has(key)) keys.set(key, new Set());
        keys.get(key).add(path.relative(REPO_ROOT, filePath));
      }
    }
  }

  return keys;
}

function getNestedValue(resource, key) {
  return key.split('.').reduce((current, part) => {
    if (!current || typeof current !== 'object') return undefined;
    return current[part];
  }, resource);
}

function isResolvable(value) {
  return typeof value === 'string' || (value && typeof value === 'object' && typeof value.title === 'string');
}

function flattenStringValues(value, prefix = '') {
  if (typeof value === 'string') return [{ path: prefix, value }];
  if (!value || typeof value !== 'object') return [];

  return Object.entries(value).flatMap(([key, nestedValue]) =>
    flattenStringValues(nestedValue, prefix ? `${prefix}.${key}` : key),
  );
}

function findSourceMojibakeFindings() {
  const findings = [];

  for (const root of SOURCE_ROOTS) {
    for (const filePath of walkSourceFiles(root)) {
      const relativePath = path.relative(REPO_ROOT, filePath);
      const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
      lines.forEach((line, index) => {
        if (MOJIBAKE_PATTERN.test(line)) {
          findings.push({
            file: relativePath,
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }
  }

  return findings;
}

function findI18nFindings() {
  const vi = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'packages/i18n/src/locales/vi/common.json'), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'packages/i18n/src/locales/en/common.json'), 'utf8'));
  const keys = extractRuntimeKeys();
  const missingRuntimeKeys = [];

  for (const [key, files] of [...keys.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    if (!isResolvable(getNestedValue(vi, key)) && !isResolvable(getNestedValue(en, key))) {
      missingRuntimeKeys.push({ key, files: [...files].sort() });
    }
  }

  const mojibakeStrings = [
    ...flattenStringValues(vi).map((entry) => ({ ...entry, locale: 'vi' })),
    ...flattenStringValues(en).map((entry) => ({ ...entry, locale: 'en' })),
  ].filter(({ value }) => MOJIBAKE_PATTERN.test(value));

  return {
    missingRuntimeKeys,
    mojibakeStrings,
    sourceMojibake: findSourceMojibakeFindings(),
  };
}

function main() {
  const findings = findI18nFindings();
  if (findings.missingRuntimeKeys.length || findings.mojibakeStrings.length || findings.sourceMojibake.length) {
    console.error('i18n runtime audit failed.');
    for (const finding of findings.missingRuntimeKeys) {
      console.error(`- Missing runtime key ${finding.key}: ${finding.files.join(', ')}`);
    }
    for (const finding of findings.mojibakeStrings) {
      console.error(`- Mojibake ${finding.locale}.${finding.path}: ${finding.value}`);
    }
    for (const finding of findings.sourceMojibake) {
      console.error(`- Mojibake source ${finding.file}:${finding.line}: ${finding.text}`);
    }
    return 1;
  }

  console.log('i18n runtime audit passed.');
  return 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = {
  extractRuntimeKeys,
  findI18nFindings,
  findSourceMojibakeFindings,
  getNestedValue,
  isResolvable,
};
