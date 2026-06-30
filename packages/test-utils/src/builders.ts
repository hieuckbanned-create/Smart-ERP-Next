import { randomUUID } from 'crypto';

let counter = 0;
const inc = () => ++counter;

export function buildUser(overrides: Record<string, any> = {}) {
  const id = randomUUID();
  const n = inc();
  return {
    id,
    email: `user${n}@test.com`,
    name: `Test User ${n}`,
    passwordHash: '$2b$10$hashed',
    role: 'user',
    tenantId: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildProduct(overrides: Record<string, any> = {}) {
  const n = inc();
  return {
    id: randomUUID(),
    sku: `SKU-${n.toString().padStart(6, '0')}`,
    name: `Test Product ${n}`,
    price: 100_000,
    cost: 60_000,
    stock: 100,
    unit: 'piece',
    tenantId: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildCustomer(overrides: Record<string, any> = {}) {
  const n = inc();
  return {
    id: randomUUID(),
    name: `Customer ${n}`,
    email: `cust${n}@test.com`,
    phone: `090${n.toString().padStart(7, '0')}`,
    tenantId: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildOrder(overrides: Record<string, any> = {}) {
  const n = inc();
  return {
    id: randomUUID(),
    code: `DH-${n.toString().padStart(6, '0')}`,
    status: 'draft',
    total: 500_000,
    subtotal: 500_000,
    paidAmount: 0,
    debtAmount: 500_000,
    tenantId: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
