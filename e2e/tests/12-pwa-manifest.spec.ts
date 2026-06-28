import { test, expect } from '@playwright/test';

test.describe('PWA Manifest', () => {
  test('manifest.json exists and has required fields', async ({ request }) => {
    const res = await request.get('http://localhost:3457/manifest.json');
    expect(res.ok()).toBeTruthy();
    const manifest = await res.json();
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('display', 'standalone');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('icons');
    expect(Array.isArray(manifest.icons)).toBe(true);
  });

  test('favicon.svg is accessible', async ({ request }) => {
    const res = await request.get('http://localhost:3457/favicon.svg');
    expect(res.ok()).toBeTruthy();
  });
});
