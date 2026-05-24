import { test, expect, type Page } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

let authState: { token: string; user: any };

const emailSelector = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
const passwordSelector = 'input[type="password"]';
const loginButtonSelector = 'button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login")';

async function authenticatePage(page: Page) {
  await page.context().addCookies([
    {
      name: 'access_token',
      value: authState.token,
      url: 'http://localhost:3000',
      sameSite: 'Lax',
    },
  ]);
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (user.tenantId) localStorage.setItem('tenant_id', user.tenantId);
  }, authState);
}

// ═══════════════════════════════════════════════════════════════════
// All Pages Navigation — every route in the app loads < 500
// ═══════════════════════════════════════════════════════════════════

test.describe('All Pages Navigation (Authenticated)', () => {
  test.beforeAll(async ({ request }) => {
    const response = await request.post('http://localhost:3001/auth/login', {
      data: { email: 'admin@smarterp.vn', password: 'admin123' },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.access_token).toBeTruthy();
    expect(body.user).toBeTruthy();
    authState = { token: body.access_token, user: body.user };
  });

  test.beforeEach(async ({ page }) => {
    await authenticatePage(page);
  });

  // --- Core Business ---
  const corePages = [
    '/dashboard',
    '/products',
    '/products/create',
    '/products/export',
    '/products/import',
    '/orders',
    '/customers',
    '/customers/create',
    '/inventory',
    '/payments',
    '/purchasing',
    '/purchasing/create',
    '/suppliers',
    '/suppliers/create',
    '/warehouses',
  ];

  for (const path of corePages) {
    test(`Core: ${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBeLessThan(500);
      await page.waitForLoadState('domcontentloaded');
      const body = await page.textContent('body');
      expect(body!.length).toBeGreaterThan(20);
    });
  }

  // --- HR Module ---
  const hrPages = [
    '/hr/employees',
    '/hr/payroll',
    '/hr/attendance',
  ];

  for (const path of hrPages) {
    test(`HR: ${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBeLessThan(500);
      await page.waitForLoadState('domcontentloaded');
    });
  }

  // --- Accounting & Finance ---
  const financePages = [
    '/accounting',
    '/e-invoice',
    '/fixed-assets',
  ];

  for (const path of financePages) {
    test(`Finance: ${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBeLessThan(500);
      await page.waitForLoadState('domcontentloaded');
    });
  }

  // --- CRM ---
  const crmPages = [
    '/crm',
  ];

  for (const path of crmPages) {
    test(`CRM: ${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBeLessThan(500);
      await page.waitForLoadState('domcontentloaded');
    });
  }

  // --- Manufacturing ---
  const mfgPages = [
    '/manufacturing/bom',
    '/manufacturing/mrp',
    '/manufacturing/production-orders',
    '/quality',
  ];

  for (const path of mfgPages) {
    test(`Manufacturing: ${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBeLessThan(500);
      await page.waitForLoadState('domcontentloaded');
    });
  }

  // --- Analytics & Reports ---
  const analyticsPages = [
    '/analytics-dashboard',
    '/analytics/forecast',
    '/analytics/churn',
    '/analytics/clv',
    '/reports',
    '/reports/advanced',
    '/reports/forecast',
    '/reports/cashflow-forecast',
    '/forecast/dashboard',
  ];

  for (const path of analyticsPages) {
    test(`Analytics: ${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBeLessThan(500);
      await page.waitForLoadState('domcontentloaded');
    });
  }

  // --- Admin ---
  const adminPages = [
    '/admin/activity-logs',
    '/admin/benchmarks',
    '/admin/performance',
  ];

  for (const path of adminPages) {
    test(`Admin: ${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBeLessThan(500);
      await page.waitForLoadState('domcontentloaded');
    });
  }

  // --- Helpdesk & Support ---
  const supportPages = [
    '/helpdesk/tickets',
    '/chat',
    '/omnichannel',
  ];

  for (const path of supportPages) {
    test(`Support: ${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBeLessThan(500);
      await page.waitForLoadState('domcontentloaded');
    });
  }

  // --- Loyalty ---
  const loyaltyPages = [
    '/loyalty/cards',
    '/loyalty/rewards',
  ];

  for (const path of loyaltyPages) {
    test(`Loyalty: ${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBeLessThan(500);
      await page.waitForLoadState('domcontentloaded');
    });
  }

  // --- Other ---
  const otherPages = [
    '/profile',
    '/users',
    '/settings',
    '/settings/ecommerce',
    '/settings/xero',
    '/approvals',
    '/automation',
    '/projects',
    '/pos',
    '/mvp',
  ];

  for (const path of otherPages) {
    test(`Other: ${path} loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBeLessThan(500);
      await page.waitForLoadState('domcontentloaded');
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Public pages — no auth required
// ═══════════════════════════════════════════════════════════════════

test.describe('Public Pages (No Auth)', () => {
  test('Login page renders form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    const emailInput = page.locator(emailSelector);
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    const passwordInput = page.locator(passwordSelector);
    await expect(passwordInput).toBeVisible();
    const submitBtn = page.locator(loginButtonSelector).first();
    await expect(submitBtn).toBeVisible();
  });

  test('Register page renders form', async ({ page }) => {
    const res = await page.goto('/register');
    expect(res!.status()).toBeLessThan(500);
    await page.waitForLoadState('domcontentloaded');
  });
});
