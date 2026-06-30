import { test, expect } from '@playwright/test';

test.describe('Visual regression', () => {
  test('login page matches baseline', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('button, [type="submit"]', { timeout: 10000 });
    await expect(page).toHaveScreenshot('login-page.png', { maxDiffPixels: 100 });
  });

  test('dashboard page matches baseline', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('main', { timeout: 15000 });
    await expect(page).toHaveScreenshot('dashboard-page.png', { maxDiffPixels: 200 });
  });
});
