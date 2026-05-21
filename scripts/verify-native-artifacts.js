const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');

const SEARCH_ROOTS = [
  'artifacts',
  'dist',
  'apps/mobile',
  'apps/desktop/src-tauri/target/release/bundle',
].map((relativePath) => path.join(REPO_ROOT, relativePath));

const REQUIRED_ARTIFACTS = [
  {
    platform: 'android',
    extensions: ['.apk', '.aab'],
  },
  {
    platform: 'ios',
    extensions: ['.ipa'],
  },
  {
    platform: 'windows',
    extensions: ['.msi', '.exe'],
  },
];

function walkFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function findNativeArtifacts() {
  const files = SEARCH_ROOTS.flatMap((root) => walkFiles(root));

  return REQUIRED_ARTIFACTS.map((requirement) => {
    const matches = files.filter((filePath) => {
      const extension = path.extname(filePath).toLowerCase();
      return requirement.extensions.includes(extension);
    });

    return {
      ...requirement,
      matches,
    };
  });
}

function main() {
  const artifacts = findNativeArtifacts();
  const missing = artifacts.filter((artifact) => artifact.matches.length === 0);

  if (missing.length > 0) {
    console.error('Native artifact gate failed.');
    console.error('Release certification requires generated installable artifacts, not only source tests.');
    for (const artifact of missing) {
      console.error(`- Missing ${artifact.platform}: ${artifact.extensions.join(' or ')}`);
    }
    return 1;
  }

  console.log('Native artifacts verified:');
  for (const artifact of artifacts) {
    console.log(`- ${artifact.platform}: ${artifact.matches[0]}`);
  }

  return 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = {
  findNativeArtifacts,
  main,
};
