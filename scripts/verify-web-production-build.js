const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_WEB_APP_DIR = 'apps/web';
const SERVER_CHUNK_PATTERN = /["'](vendor-chunks\/[^"']+)["']/g;

function resolveAppDir(inputPath = DEFAULT_WEB_APP_DIR, cwd = process.cwd()) {
  return path.resolve(cwd, inputPath);
}

function toRepoPath(filePath, appDir) {
  return path.relative(appDir, filePath).replace(/\\/g, '/');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

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

function validateBuildManifest(appDir, findings) {
  const manifestPath = path.join(appDir, '.next/build-manifest.json');

  if (!fs.existsSync(manifestPath)) {
    findings.push({
      file: '.next/build-manifest.json',
      reason: 'missing Next build manifest; run next build before next start',
    });
    return;
  }

  const manifest = readJson(manifestPath);
  if (Array.isArray(manifest.devFiles) && manifest.devFiles.length > 0) {
    findings.push({
      file: '.next/build-manifest.json',
      reason: 'manifest contains devFiles; run next build before next start',
    });
  }

  if (JSON.stringify(manifest).includes('static/development')) {
    findings.push({
      file: '.next/build-manifest.json',
      reason: 'manifest references static/development assets; this is not a production build',
    });
  }
}

function validateServerChunks(appDir, findings) {
  const serverDir = path.join(appDir, '.next/server');
  const serverFiles = walkFiles(serverDir).filter((filePath) => filePath.endsWith('.js'));

  for (const filePath of serverFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('isDev=true')) {
      findings.push({
        file: toRepoPath(filePath, appDir),
        reason: 'server bundle was generated in dev mode; run next build before next start',
      });
    }

    const missingChunks = new Set();
    for (const match of content.matchAll(SERVER_CHUNK_PATTERN)) {
      const relativeChunkPath = `.next/server/${match[1]}.js`;
      const chunkPath = path.join(appDir, relativeChunkPath);
      if (!fs.existsSync(chunkPath)) {
        missingChunks.add(relativeChunkPath.replace(/\\/g, '/'));
      }
    }

    for (const missingChunk of missingChunks) {
      findings.push({
        file: toRepoPath(filePath, appDir),
        reason: `references missing server chunk ${missingChunk}`,
      });
    }
  }
}

function validateProductionBuild(appDirInput = DEFAULT_WEB_APP_DIR) {
  const appDir = resolveAppDir(appDirInput);
  const findings = [];
  const buildIdPath = path.join(appDir, '.next/BUILD_ID');

  if (!fs.existsSync(buildIdPath)) {
    findings.push({
      file: '.next/BUILD_ID',
      reason: 'missing production build id; run next build before next start',
    });
  }

  validateBuildManifest(appDir, findings);
  validateServerChunks(appDir, findings);

  return findings;
}

function main(argv = process.argv) {
  const appDir = argv[2] || DEFAULT_WEB_APP_DIR;
  const findings = validateProductionBuild(appDir);

  if (findings.length > 0) {
    console.error('Web production build verification failed.');
    console.error('The .next artifact is not safe for next start.');
    for (const finding of findings) {
      console.error(`- ${finding.file}: ${finding.reason}`);
    }
    return 1;
  }

  console.log('Web production build verification passed.');
  return 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = {
  validateProductionBuild,
};
