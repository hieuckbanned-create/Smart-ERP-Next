import { test, expect } from '@playwright/test';

const API = 'http://localhost:3456';
let token = '';

function h() { return { Authorization: `Bearer ${token}` }; }
function u(d: any): any { return d && d.success === true ? d.data : d; }

test.describe('Approvals', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, { data: { email: 'admin@demo.vn', password: 'admin123' } });
    const body = await res.json();
    token = body.access_token || body.data?.access_token || '';
  });

  test('GET /approvals returns pending approvals', async ({ request }) => {
    const res = await request.get(`${API}/approvals`, { headers: h() });
    expect(res.ok()).toBeTruthy();
    const raw = await res.json();
    const body = raw.success === true ? raw.data : raw;
    const items = Array.isArray(body) ? body : body.items || body.data || [];
    expect(Array.isArray(items)).toBe(true);
  });
});
