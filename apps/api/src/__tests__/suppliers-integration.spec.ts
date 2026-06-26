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
jest.mock('@smart-erp/database/schema', () => ({ suppliers: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  ilike: jest.fn(),
  or: jest.fn(),
  sql: jest.fn(),
}));

import { db } from '@smart-erp/database';
import { SuppliersService } from '../suppliers/suppliers.service';

describe('SuppliersService (direct instantiation)', () => {
  let service: SuppliersService;
  const TENANT_ID = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then.mockImplementation((resolve: any) => resolve([]));
    (db as any).returning.mockReset();
    service = new (SuppliersService as any)();
  });

  describe('create', () => {
    const baseDto: any = { code: 'SUP-001', name: 'Test Supplier', phone: '0900000000' };

    it('creates and returns a supplier', async () => {
      const expected: any = {
        id: 's-1', tenantId: TENANT_ID, code: 'SUP-001', name: 'Test Supplier',
        phone: '0900000000', email: null, address: null, ward: null, district: null,
        province: null, taxCode: null, contactPerson: null, bankAccount: null,
        bankName: null, notes: null, isActive: true,
      };
      (db as any).returning.mockResolvedValue([expected]);

      const result = await service.create(TENANT_ID, baseDto);

      expect(result).toEqual(expected);
      expect(db.insert).toHaveBeenCalled();
    });

    it('throws ConflictException when code already exists', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ id: 'existing' }]));

      await expect(service.create(TENANT_ID, baseDto))
        .rejects.toThrow('Supplier code already exists');
    });
  });

  describe('findAll', () => {
    const suppliers = [
      { id: 's-1', code: 'SUP-001', name: 'Alpha Supplies', phone: '0900000000', tenantId: TENANT_ID, isActive: true },
      { id: 's-2', code: 'SUP-002', name: 'Beta Trading', phone: '0911111111', tenantId: TENANT_ID, isActive: true },
    ];

    it('returns paginated suppliers list', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 2 }]))
        .mockImplementationOnce((resolve: any) => resolve(suppliers));

      const result = await service.findAll(TENANT_ID, {} as any);

      expect(result.items).toEqual(suppliers);
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
      const filtered = [suppliers[0]];
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 1 }]))
        .mockImplementationOnce((resolve: any) => resolve(filtered));

      const result = await service.findAll(TENANT_ID, { search: 'Alpha' } as any);

      expect(result.items).toEqual(filtered);
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
        .mockImplementationOnce((resolve: any) => resolve(suppliers));

      const result = await service.findAll(TENANT_ID, { limit: 2 } as any);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    const supplier: any = { id: 's-1', code: 'SUP-001', name: 'Test', tenantId: TENANT_ID, phone: '0900000000' };

    it('returns a supplier by id within tenant', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([supplier]));

      const result = await service.findOne(TENANT_ID, 's-1');

      expect(result).toEqual(supplier);
    });

    it('throws NotFoundException when not found', async () => {
      await expect(service.findOne(TENANT_ID, 'missing'))
        .rejects.toThrow('Supplier not found');
    });
  });

  describe('update', () => {
    const supplier: any = { id: 's-1', code: 'SUP-001', name: 'Original', tenantId: TENANT_ID, phone: '0900000000' };

    it('updates and returns the supplier', async () => {
      const updated: any = { ...supplier, name: 'Updated' };
      (db as any).returning.mockResolvedValue([updated]);

      const result = await service.update(TENANT_ID, 's-1', { name: 'Updated' } as any);

      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when supplier not found', async () => {
      (db as any).returning.mockResolvedValue([]);

      await expect(service.update(TENANT_ID, 'missing', { name: 'Nope' } as any))
        .rejects.toThrow('Supplier not found');
    });
  });

  describe('remove', () => {
    const supplier: any = { id: 's-1', code: 'SUP-001', name: 'Deleted', tenantId: TENANT_ID, phone: '0900000000' };

    it('deletes and returns the supplier', async () => {
      (db as any).returning.mockResolvedValue([supplier]);

      const result = await service.remove(TENANT_ID, 's-1');

      expect(result).toEqual(supplier);
    });

    it('throws NotFoundException when supplier not found', async () => {
      (db as any).returning.mockResolvedValue([]);

      await expect(service.remove(TENANT_ID, 'missing'))
        .rejects.toThrow('Supplier not found');
    });
  });
});
