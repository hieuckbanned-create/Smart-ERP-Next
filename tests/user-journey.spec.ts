import { test, expect } from '@playwright/test';

test('smoke test: page loads', async ({ page }) => {
  // Just verify login page loads
  await page.goto('/');
  await expect(page).toHaveURL(/login/);

  // Check for login form elements
  const emailInput = page.locator('input[type="email"], input[name*="email" i]');
  const passwordInput = page.locator('input[type="password"], input[name*="password" i]');

  // At least one of them should exist
  const emailExists = await emailInput.count();
  const passwordExists = await passwordInput.count();

  expect(emailExists + passwordExists).toBeGreaterThan(0);
});