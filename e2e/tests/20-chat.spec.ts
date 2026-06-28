import { test, expect } from '@playwright/test';

const API = 'http://localhost:3456';
let token = '';

function h() { return { Authorization: `Bearer ${token}` }; }
function u(d: any): any { return d && d.success === true ? d.data : d; }

test.describe('Chat', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, { data: { email: 'admin@demo.vn', password: 'admin123' } });
    const body = await res.json();
    token = body.access_token || body.data?.access_token || '';
  });

  test('GET /chat/conversation returns messages', async ({ request }) => {
    const usersRes = await request.get(`${API}/users`, { headers: h() });
    const usersRaw = await usersRes.json();
    const usersBody = usersRaw.success === true ? usersRaw.data : usersRaw;
    const users = Array.isArray(usersBody) ? usersBody : usersBody.items || usersBody.data || [];
    if (users.length < 2) { return; }
    const otherUserId = users.find((u: any) => u.id)?.id;
    const res = await request.get(`${API}/chat/conversation?userId=${otherUserId}`, { headers: h() });
    expect(res.ok()).toBeTruthy();
  });
});
