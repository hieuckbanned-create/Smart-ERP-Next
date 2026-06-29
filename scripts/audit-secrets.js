#!/usr/bin/env node
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const ignoredSuffixes = [
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  '.tsbuildinfo',
];
const ignoredSegments = new Set(['.git', 'node_modules', 'coverage', 'dist', 'build', '.next', '.next-dev']);

const findings = [];
const patterns = [
  { id: 'private-key', regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { id: 'aws-access-key', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: 'github-token', regex: /\bgh[pousr]_[A-Za-z0-9_]{36,255}\b/ },
  { id: 'slack-token', regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { id: 'jwt-secret-literal', regex: /\bJWT_SECRET\s*[:=]\s*['\"](?!(?:changeme|change-me|ci-|test-|your-|dev-|local-|example|placeholder|replace-|secret$|.*\$\{))[A-Za-z0-9+/=_-]{16,}['\"]/i },
  { id: 'database-url-password', regex: /postgres(?:ql)?:\/\/[^\s:@]+:(?!(?:postgres|smart_erp|password|changeme|change-me|example|your-|test|dev|local|ci-|\$\{))[^\s:@]{8,}@/i },
];

function isIgnored(file) {
  const normalized = file.split(path.sep).join('/');
  if (ignoredSuffixes.some((suffix) => normalized.endsWith(suffix))) return true;
  return normalized.split('/').some((segment) => ignoredSegments.has(segment));
}

function trackedFiles() {
  const output = execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot });
  return output.toString('utf8').split('\0').filter(Boolean).filter((file) => !isIgnored(file));
}

function scanFile(file) {
  const absolute = path.join(repoRoot, file);
  let content;
  try {
    content = fs.readFileSync(absolute, 'utf8');
  } catch (error) {
    if (error.code === 'EISDIR') return;
    throw error;
  }

  content.split(/\r?\n/).forEach((line, index) => {
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        findings.push({ file, line: index + 1, id: pattern.id });
      }
      pattern.regex.lastIndex = 0;
    }
  });
}

for (const file of trackedFiles()) scanFile(file);

if (findings.length > 0) {
  console.error('Potential committed secrets found:');
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} (${finding.id})`);
  }
  process.exit(1);
}

console.log('Secret audit passed: no high-confidence committed secrets found.');
