const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

function flattenBuilds(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.builds)) return value.builds;
  if (Array.isArray(value?.data)) return value.data;
  return value ? [value] : [];
}

function getArtifactUrl(build) {
  return (
    build?.artifacts?.buildUrl ||
    build?.artifacts?.applicationArchiveUrl ||
    build?.artifactUrl ||
    build?.buildUrl ||
    null
  );
}

function getPlatform(build) {
  return String(build?.platform || build?.job?.platform || '').toLowerCase();
}

function extensionForPlatform(platform, url) {
  const urlPath = new URL(url).pathname.toLowerCase();
  const ext = path.extname(urlPath);
  if (['.apk', '.aab', '.ipa'].includes(ext)) return ext;
  if (platform === 'ios') return '.ipa';
  if (platform === 'android') return '.apk';
  return '.bin';
}

function extractEasArtifactDownloads(metadata) {
  return flattenBuilds(metadata)
    .map((build) => {
      const platform = getPlatform(build);
      const url = getArtifactUrl(build);
      if (!platform || !url) return null;

      return {
        platform,
        url,
        filename: `${platform}${extensionForPlatform(platform, url)}`,
      };
    })
    .filter(Boolean);
}

function downloadFile(url, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });

  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode || 0) && response.headers.location) {
        response.resume();
        downloadFile(response.headers.location, destination).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Download failed with HTTP ${response.statusCode}: ${url}`));
        return;
      }

      const file = fs.createWriteStream(destination);
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });

    request.on('error', reject);
  });
}

async function main(args = process.argv.slice(2)) {
  const [metadataPath, outputRoot = 'artifacts'] = args;
  if (!metadataPath) {
    console.error('Usage: node scripts/download-eas-artifacts.js <eas-json-file> [output-root]');
    return 1;
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const downloads = extractEasArtifactDownloads(metadata);
  if (downloads.length === 0) {
    console.error(`No downloadable EAS artifacts found in ${metadataPath}`);
    return 1;
  }

  for (const download of downloads) {
    const destination = path.join(outputRoot, download.platform, download.filename);
    console.log(`Downloading ${download.platform} artifact to ${destination}`);
    await downloadFile(download.url, destination);
  }

  return 0;
}

if (require.main === module) {
  main().then((code) => process.exit(code), (error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  extractEasArtifactDownloads,
  flattenBuilds,
  getArtifactUrl,
};
