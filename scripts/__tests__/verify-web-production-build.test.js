const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  validateProductionBuild,
} = require('../verify-web-production-build');

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

describe('web production build verifier', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smart-erp-web-build-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('flags a dev Next artifact before next start can crash at runtime', () => {
    writeFile(path.join(tempDir, '.next/BUILD_ID'), 'dev-build-id');
    writeJson(path.join(tempDir, '.next/build-manifest.json'), {
      devFiles: ['static/chunks/react-refresh.js'],
      lowPriorityFiles: ['static/development/_buildManifest.js'],
      pages: {},
    });

    expect(validateProductionBuild(tempDir)).toEqual([
      {
        file: '.next/build-manifest.json',
        reason: 'manifest contains devFiles; run next build before next start',
      },
      {
        file: '.next/build-manifest.json',
        reason: 'manifest references static/development assets; this is not a production build',
      },
    ]);
  });

  it('flags server chunks that reference missing vendor chunk files', () => {
    writeFile(path.join(tempDir, '.next/BUILD_ID'), 'prod-build-id');
    writeJson(path.join(tempDir, '.next/build-manifest.json'), {
      devFiles: [],
      lowPriorityFiles: ['static/prod/_buildManifest.js'],
      pages: {},
    });
    writeFile(
      path.join(tempDir, '.next/server/app/login/page.js'),
      '__webpack_require__.X(0, ["vendor-chunks/axios@1.16.0"], () => null);',
    );

    expect(validateProductionBuild(tempDir)).toEqual([
      {
        file: '.next/server/app/login/page.js',
        reason: 'references missing server chunk .next/server/vendor-chunks/axios@1.16.0.js',
      },
    ]);
  });

  it('accepts a production build without dev artifacts or missing chunk references', () => {
    writeFile(path.join(tempDir, '.next/BUILD_ID'), 'prod-build-id');
    writeJson(path.join(tempDir, '.next/build-manifest.json'), {
      devFiles: [],
      lowPriorityFiles: ['static/prod/_buildManifest.js'],
      pages: {},
    });
    writeFile(
      path.join(tempDir, '.next/server/app/login/page.js'),
      '__webpack_require__.X(0, ["vendor-chunks/axios@1.16.0"], () => null);',
    );
    writeFile(path.join(tempDir, '.next/server/vendor-chunks/axios@1.16.0.js'), 'module.exports = {};');

    expect(validateProductionBuild(tempDir)).toEqual([]);
  });
});
