import { buildUser, buildProduct, buildOrder, buildCustomer } from './builders';

describe('Test data builders', () => {
  describe('buildUser', () => {
    it('creates a user with default values', () => {
      const user = buildUser();
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
      expect(user.role).toBe('user');
    });

    it('overrides default values', () => {
      const user = buildUser({ email: 'admin@test.com', role: 'admin' });
      expect(user.email).toBe('admin@test.com');
      expect(user.role).toBe('admin');
    });

    it('generates unique email per call', () => {
      const u1 = buildUser();
      const u2 = buildUser();
      expect(u1.email).not.toBe(u2.email);
    });
  });

  describe('buildProduct', () => {
    it('creates a product with valid defaults', () => {
      const product = buildProduct();
      expect(product).toHaveProperty('sku');
      expect(product).toHaveProperty('name');
      expect(product.price).toBeGreaterThan(0);
    });

    it('applies overrides', () => {
      const product = buildProduct({ price: 99.99, stock: 50 });
      expect(product.price).toBe(99.99);
      expect(product.stock).toBe(50);
    });
  });

  describe('buildCustomer', () => {
    it('creates a customer with tenant scoping', () => {
      const customer = buildCustomer({ tenantId: 't1' });
      expect(customer.tenantId).toBe('t1');
    });
  });

  describe('buildOrder', () => {
    it('creates an order with line items', () => {
      const order = buildOrder({ total: 250 });
      expect(order.total).toBe(250);
      expect(order.status).toBe('draft');
    });
  });
});
