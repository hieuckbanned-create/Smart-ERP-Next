import { test, expect } from '@playwright/test';

const API = 'http://localhost:3456';
let token = '';

function h() { return { Authorization: `Bearer ${token}` }; }
function u(d: any): any { return d && d.success === true ? d.data : d; }

test.describe('POS Checkout Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, { data: { email: 'admin@demo.vn', password: 'admin123' } });
    const body = await res.json();
    token = body.access_token || body.data?.access_token || '';
  });

  test('search products and verify at least one exists', async ({ request }) => {
    const res = await request.get(`${API}/products?limit=5`, { headers: h() });
    expect(res.ok()).toBeTruthy();
    const body = u(await res.json());
    const items = Array.isArray(body) ? body : body.items || body.data || [];
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty('id');
    expect(items[0]).toHaveProperty('name');
    expect(items[0]).toHaveProperty('price');
  });

  test('create a POS order with cash payment', async ({ request }) => {
    const products = u(await (await request.get(`${API}/products?limit=1`, { headers: h() })).json());
    const items = Array.isArray(products) ? products : products.items || products.data || [];
    expect(items.length).toBeGreaterThan(0);

    const product = items[0];
    const orderRes = await request.post(`${API}/orders`, {
      headers: h(),
      data: {
        channel: 'pos',
        paymentMethod: 'cash',
        items: [{ productId: product.id, quantity: 2, unitPrice: parseFloat(product.price) }],
      },
    });
    expect(orderRes.ok()).toBeTruthy();
    const order = u(await orderRes.json());
    expect(order).toHaveProperty('id');
    expect(order).toHaveProperty('code');
    expect(order.channel).toBe('pos');
    expect(order.paymentMethod).toBe('cash');

    // Verify order is findable
    const found = u(await (await request.get(`${API}/orders/${order.id}`, { headers: h() })).json());
    expect(found.id).toBe(order.id);
  });
});
