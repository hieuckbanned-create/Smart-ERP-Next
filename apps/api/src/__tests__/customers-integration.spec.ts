jest.mock('@smart-erp/database', () => {
  const db: any = () => db;
  const chainFn = jest.fn(() => db);

  db.select = chainFn;
  db.from = chainFn;
  db.where = chainFn;
  db.orderBy = chainFn;
  db.limit = chainFn;
  db.offset = chainFn;
  db.insert = chainFn;
  db.values = chainFn;
  db.update = chainFn;
  db.set = chainFn;
  db.delete = chainFn;
  db.returning = jest.fn();
  db.then = jest.fn();

  return { db };
});
jest.mock('@smart-erp/database/schema', () => ({ customers: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  ilike: jest.fn(),
  or: jest.fn(),
  sql: jest.fn(),
}));

import { db } from '@smart-erp/database';
import { CustomersService } from '../customers/customers.service';

describe('CustomersService (direct instantiation)', () => {
  let service: CustomersService;
  const mockActivityService = { log: jest.fn() };
  const TENANT_ID = 'tenant-1';
  const USER_ID = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then.mockImplementation((resolve: any) => resolve([]));
    (db as any).returning.mockReset();
    mockActivityService.log.mockResolvedValue(undefined);
    service = new (CustomersService as any)(mockActivityService);
  });

  describe('create', () => {
    const baseDto: any = { code: 'CUST-001', name: 'Test Customer', phone: '0900000000' };

    it('creates and returns a customer', async () => {
      const expected: any = {
        id: 'c-1', tenantId: TENANT_ID, code: 'CUST-001', name: 'Test Customer',
        phone: '0900000000', email: null, address: null, debtLimit: null,
        isActive: true, customerGroup: null,
      };
      (db as any).returning.mockResolvedValue([expected]);

      const result = await service.create(TENANT_ID, USER_ID, baseDto);

      expect(result).toEqual(expected);
      expect(db.insert).toHaveBeenCalled();
    });

    it('throws ConflictException when code already exists', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ id: 'existing' }]));

      await expect(service.create(TENANT_ID, USER_ID, baseDto))
        .rejects.toThrow('Customer code already exists');
    });

    it('logs activity after creation', async () => {
      const customer: any = { id: 'c-1', code: 'CUST-001', name: 'Test Customer', phone: '0900000000' };
      (db as any).returning.mockResolvedValue([{ ...customer, tenantId: TENANT_ID, debtLimit: null }]);

      await service.create(TENANT_ID, USER_ID, baseDto);

      expect(mockActivityService.log).toHaveBeenCalledWith(
        TENANT_ID, USER_ID, 'created', 'customer', 'c-1',
        { code: 'CUST-001', name: 'Test Customer', phone: '0900000000' },
      );
    });
  });

  describe('findAll', () => {
    const customers = [
      { id: 'c-1', code: 'CUST-001', name: 'Alpha', phone: '0900000000', tenantId: TENANT_ID, isActive: true, customerGroup: null },
      { id: 'c-2', code: 'CUST-002', name: 'Beta', phone: '0911111111', tenantId: TENANT_ID, isActive: true, customerGroup: null },
    ];

    it('returns paginated customers list', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 2 }]))
        .mockImplementationOnce((resolve: any) => resolve(customers));

      const result = await service.findAll(TENANT_ID, {} as any);

      expect(result.items).toEqual(customers);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('applies max limit of 100', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 0 }]))
        .mockImplementationOnce((resolve: any) => resolve([]));

      const result = await service.findAll(TENANT_ID, { limit: 200 } as any);

      expect(result.limit).toBe(100);
    });

    it('filters by search term', async () => {
      const filtered = [customers[0]];
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 1 }]))
        .mockImplementationOnce((resolve: any) => resolve(filtered));

      const result = await service.findAll(TENANT_ID, { search: 'Alp' } as any);

      expect(result.items).toEqual(filtered);
    });

    it('filters by group', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 0 }]))
        .mockImplementationOnce((resolve: any) => resolve([]));

      const result = await service.findAll(TENANT_ID, { group: 'retail' } as any);

      expect(result.items).toEqual([]);
    });

    it('filters by isActive', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 0 }]))
        .mockImplementationOnce((resolve: any) => resolve([]));

      const result = await service.findAll(TENANT_ID, { isActive: false } as any);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('computes totalPages correctly', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 5 }]))
        .mockImplementationOnce((resolve: any) => resolve(customers));

      const result = await service.findAll(TENANT_ID, { limit: 2 } as any);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    const customer: any = { id: 'c-1', code: 'CUST-001', name: 'Item', tenantId: TENANT_ID, phone: '0900000000' };

    it('returns a customer by id within tenant', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([customer]));

      const result = await service.findOne(TENANT_ID, 'c-1');

      expect(result).toEqual(customer);
    });

    it('throws NotFoundException when not found', async () => {
      await expect(service.findOne(TENANT_ID, 'missing'))
        .rejects.toThrow('Customer not found');
    });
  });

  describe('update', () => {
    const customer: any = { id: 'c-1', code: 'CUST-001', name: 'Original', tenantId: TENANT_ID, phone: '0900000000' };

    it('updates and returns the customer', async () => {
      const updated: any = { ...customer, name: 'Updated' };
      (db as any).returning.mockResolvedValue([updated]);

      const result = await service.update(TENANT_ID, USER_ID, 'c-1', { name: 'Updated' } as any);

      expect(result).toEqual(updated);
    });

    it('converts debtLimit to string on update', async () => {
      const updated: any = { ...customer, debtLimit: '5000000' };
      (db as any).returning.mockResolvedValue([updated]);

      const result = await service.update(TENANT_ID, USER_ID, 'c-1', { debtLimit: 5000000 } as any);

      expect(result.debtLimit).toBe('5000000');
    });

    it('throws NotFoundException when customer not found', async () => {
      (db as any).returning.mockResolvedValue([]);

      await expect(service.update(TENANT_ID, USER_ID, 'missing', { name: 'Nope' } as any))
        .rejects.toThrow('Customer not found');
    });

    it('logs activity after update', async () => {
      const updated: any = { ...customer, name: 'Updated' };
      (db as any).returning.mockResolvedValue([updated]);

      await service.update(TENANT_ID, USER_ID, 'c-1', { name: 'Updated' } as any);

      expect(mockActivityService.log).toHaveBeenCalledWith(
        TENANT_ID, USER_ID, 'updated', 'customer', 'c-1',
        { changes: ['name'] },
      );
    });
  });

  describe('remove', () => {
    const customer: any = { id: 'c-1', code: 'CUST-001', name: 'Deleted Customer', tenantId: TENANT_ID, phone: '0900000000' };

    it('deletes and returns the customer', async () => {
      (db as any).returning.mockResolvedValue([customer]);

      const result = await service.remove(TENANT_ID, USER_ID, 'c-1');

      expect(result).toEqual(customer);
    });

    it('throws NotFoundException when customer not found', async () => {
      (db as any).returning.mockResolvedValue([]);

      await expect(service.remove(TENANT_ID, USER_ID, 'missing'))
        .rejects.toThrow('Customer not found');
    });

    it('logs activity after deletion', async () => {
      (db as any).returning.mockResolvedValue([customer]);

      await service.remove(TENANT_ID, USER_ID, 'c-1');

      expect(mockActivityService.log).toHaveBeenCalledWith(
        TENANT_ID, USER_ID, 'deleted', 'customer', 'c-1',
        { code: 'CUST-001', name: 'Deleted Customer', phone: '0900000000' },
      );
    });
  });
});
