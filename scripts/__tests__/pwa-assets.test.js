const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..', '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

describe('web PWA assets', () => {
  it('publishes an installable manifest with offline scope metadata', () => {
    const manifest = JSON.parse(read('apps/web/public/manifest.json'));

    expect(manifest.name).toBe('Smart ERP Next');
    expect(manifest.start_url).toContain('/login');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  it('registers the production service worker from the app shell', () => {
    const layout = read('apps/web/src/app/layout.tsx');
    const provider = read('apps/web/src/components/providers/ServiceWorkerProvider.tsx');

    expect(layout).toContain('ServiceWorkerProvider');
    expect(provider).toContain("navigator.serviceWorker.register('/sw.js'");
    expect(provider).toContain("process.env.NODE_ENV !== 'production'");
  });

  it('caches an offline fallback page from the service worker', () => {
    const serviceWorker = read('apps/web/public/sw.js');
    const offline = read('apps/web/public/offline.html');

    expect(serviceWorker).toContain("const OFFLINE_URL = '/offline.html'");
    expect(serviceWorker).toContain('caches.open(STATIC_CACHE)');
    expect(serviceWorker).toContain('networkFirst(request)');
    expect(offline).toContain('Bạn đang offline');
  });
});
