const { test, expect } = require('@playwright/test');

test.describe('Smart ERP Smoke Tests', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/login/);
  });
});
