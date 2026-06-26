const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const path = require('path');

const REPO = 'https://github.com/hieuck/Smart-ERP-Next';

function exec(cmd) {
  return execSync(cmd, { encoding: 'utf8', cwd: path.resolve(__dirname, '..') }).trim();
}

function parseType(commit) {
  const prefix = commit.match(/^(feat|fix|docs|test|refactor|ci|chore|style|perf)(\(.+\))?:/);
  if (!prefix) return { type: 'other', scope: '' };
  return { type: prefix[1], scope: (prefix[2] || '').replace(/[()]/g, '') };
}

function main() {
  const version = process.env.VERSION || exec('git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0"');
  const prevTag = exec(`git tag --sort=-creatordate | head -2 | tail -1 2>/dev/null || echo ""`);

  // Get commits since last tag
  const range = prevTag ? `${prevTag}..HEAD` : 'HEAD~20..HEAD';
  const log = exec(`git log ${range} --oneline --no-merges --format="%h|%s|%an"`);

  const commits = log.split('\n').filter(Boolean).map(line => {
    const [hash, ...rest] = line.split('|');
    return { hash: hash.trim(), message: rest.join('|'), author: rest.pop() };
  }).filter(c => c.hash && c.message);

  // Group by type
  const groups = { feat: [], fix: [], test: [], refactor: [], docs: [], ci: [], chore: [], other: [] };
  const labels = {
    feat: 'Features', fix: 'Bug Fixes', test: 'Tests', refactor: 'Refactors',
    docs: 'Documentation', ci: 'CI/CD', chore: 'Chores', other: 'Other',
  };

  commits.forEach(c => {
    const { type } = parseType(c.message);
    const msg = c.message.replace(/^(feat|fix|docs|test|refactor|ci|chore|style|perf)(\(.+\))?:\s*/i, '');
    const shortHash = c.hash.substring(0, 7);
    groups[type]?.push(`- ${msg} ([${shortHash}](${REPO}/commit/${c.hash}))`) ||
      groups.other.push(`- ${c.message} ([${shortHash}](${REPO}/commit/${c.hash}))`);
  });

  let notes = `# Smart ERP Next ${version}\n\n`;
  notes += `## Quick Start\n\`\`\`bash\ndocker compose up -d\n# Web: http://localhost:3457\n# Login: admin@smarterp.vn / admin123\n\`\`\`\n\n`;

  Object.entries(groups).forEach(([key, items]) => {
    if (items.length === 0) return;
    notes += `## ${labels[key]}\n\n${items.join('\n')}\n\n`;
  });

  const stats = exec(`git diff --shortstat ${prevTag || '4b825dc642cb6eb9a060e54bf899d153036e1e1b'}..HEAD 2>/dev/null || true`);
  notes += `---\n*${stats}*  \n*Generated from ${commits.length} commits*\n`;

  const outPath = path.resolve(__dirname, '..', 'release-notes.md');
  writeFileSync(outPath, notes, 'utf8');
  console.log(`Written to ${outPath}`);
}

main();
