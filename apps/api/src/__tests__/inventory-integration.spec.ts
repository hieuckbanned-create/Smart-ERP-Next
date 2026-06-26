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
  db.execute = jest.fn();
  db.returning = jest.fn();
  db.then = jest.fn();
  db.innerJoin = chainFn;
  db.leftJoin = chainFn;
  db.groupBy = chainFn;

  return { db };
});
jest.mock('@smart-erp/database/schema', () => ({ products: {}, inventoryTransactions: {}, inventoryReservations: {}, ecommerceStores: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  or: jest.fn(),
  ilike: jest.fn(),
  sql: jest.fn(),
  gte: jest.fn(),
  lte: jest.fn(),
  desc: jest.fn(),
}));

import { db } from '@smart-erp/database';
import { InventoryService } from '../inventory/inventory.service';

describe('InventoryService (direct instantiation)', () => {
  let service: InventoryService;
  const TENANT_ID = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then.mockImplementation((resolve: any) => resolve([]));
    (db as any).returning.mockReset();
    (db as any).returning.mockResolvedValue([]);
    (db as any).execute.mockReset();
    (db as any).execute.mockResolvedValue({ rows: [] });
    service = new InventoryService();
  });

  describe('getReorderSuggestions', () => {
    it('returns suggestions when products are below minStock', async () => {
      const rows: any[] = [
        { id: 'p-1', name: 'Low Stock', sku: 'LS-001', stock: 5, minStock: 10, reorderQuantity: null },
      ];
      (db as any).then.mockImplementation((resolve: any) => resolve(rows));

      const result = await service.getReorderSuggestions(TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'p-1', stock: 5, minStock: 10,
        suggestedOrderQuantity: 5,
      });
    });

    it('uses reorderQuantity when available', async () => {
      const rows: any[] = [
        { id: 'p-1', name: 'Item', sku: 'I-001', stock: 5, minStock: 10, reorderQuantity: 25 },
      ];
      (db as any).then.mockImplementation((resolve: any) => resolve(rows));

      const result = await service.getReorderSuggestions(TENANT_ID);

      expect(result[0].suggestedOrderQuantity).toBe(25);
    });

    it('returns empty when stock is above minStock', async () => {
      const rows: any[] = [
        { id: 'p-1', stock: 20, minStock: 10, reorderQuantity: null },
      ];
      (db as any).then.mockImplementation((resolve: any) => resolve(rows));

      const result = await service.getReorderSuggestions(TENANT_ID);

      expect(result).toHaveLength(0);
    });

    it('returns empty when no products have minStock set', async () => {
      const rows: any[] = [
        { id: 'p-1', stock: 2, minStock: null, reorderQuantity: null },
      ];
      (db as any).then.mockImplementation((resolve: any) => resolve(rows));

      const result = await service.getReorderSuggestions(TENANT_ID);

      expect(result).toHaveLength(0);
    });
  });

  describe('getTransactions', () => {
    const transactions: any[] = [
      { id: 't-1', productId: 'p-1', type: 'IN', quantity: 5, createdAt: new Date('2025-01-01') },
      { id: 't-2', productId: 'p-2', type: 'OUT', quantity: 3, createdAt: new Date('2025-01-02') },
    ];

    it('returns paginated transactions with default values', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 2 }]))
        .mockImplementationOnce((resolve: any) => resolve(transactions));

      const result = await service.getTransactions(TENANT_ID, {});

      expect(result.items).toEqual(transactions);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(30);
      expect(result.totalPages).toBe(1);
    });

    it('filters by productId', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 1 }]))
        .mockImplementationOnce((resolve: any) => resolve([transactions[0]]));

      const result = await service.getTransactions(TENANT_ID, { productId: 'p-1' });

      expect(result.items).toEqual([transactions[0]]);
      expect(result.total).toBe(1);
    });

    it('filters by type', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 0 }]))
        .mockImplementationOnce((resolve: any) => resolve([]));

      const result = await service.getTransactions(TENANT_ID, { type: 'OUT' });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('applies max limit of 100', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 0 }]))
        .mockImplementationOnce((resolve: any) => resolve([]));

      const result = await service.getTransactions(TENANT_ID, { limit: 200 });

      expect(result.limit).toBe(100);
    });

    it('calculates totalPages correctly', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 25 }]))
        .mockImplementationOnce((resolve: any) => resolve(transactions.slice(0, 10)));

      const result = await service.getTransactions(TENANT_ID, { limit: 10 });

      expect(result.totalPages).toBe(3);
    });
  });

  describe('adjust', () => {
    const product: any = { id: 'p-1', name: 'Item', sku: 'I-001', stock: 10, tenantId: TENANT_ID };

    it('IN type increases stock and returns delta', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ ...product }]));
      (db as any).returning.mockResolvedValue([{ ...product, stock: 15 }]);

      const result = await service.adjust(TENANT_ID, 'user-1', 'p-1', 5, 'IN');

      expect(result.previousStock).toBe(10);
      expect(result.newStock).toBe(15);
      expect(result.delta).toBe(5);
    });

    it('OUT type decreases stock and returns delta', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ ...product }]));
      (db as any).returning.mockResolvedValue([{ ...product, stock: 7 }]);

      const result = await service.adjust(TENANT_ID, 'user-1', 'p-1', 3, 'OUT');

      expect(result.newStock).toBe(7);
      expect(result.delta).toBe(-3);
    });

    it('ADJUSTMENT type adds quantity', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ ...product }]));
      (db as any).returning.mockResolvedValue([{ ...product, stock: 20 }]);

      const result = await service.adjust(TENANT_ID, 'user-1', 'p-1', 10, 'ADJUSTMENT');

      expect(result.newStock).toBe(20);
      expect(result.delta).toBe(10);
    });

    it('throws ConflictException when product not found', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      await expect(
        service.adjust(TENANT_ID, 'user-1', 'missing', 5, 'IN'),
      ).rejects.toThrow('Product not found');
    });

    it('throws ConflictException for insufficient stock on OUT', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ ...product }]));

      await expect(
        service.adjust(TENANT_ID, 'user-1', 'p-1', 20, 'OUT'),
      ).rejects.toThrow('Insufficient stock');
    });

    it('creates transaction record with notes and reference', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ ...product }]));
      (db as any).returning.mockResolvedValue([{ ...product, stock: 15 }]);

      await service.adjust(TENANT_ID, 'user-1', 'p-1', 5, 'IN', 'test note', 'ref-001');

      expect(db.insert).toHaveBeenCalled();
      expect((db as any).values).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_ID,
          productId: 'p-1',
          type: 'IN',
          quantity: 5,
          reference: 'ref-001',
          notes: 'test note',
          createdBy: 'user-1',
        }),
      );
    });
  });

  describe('getLowStock', () => {
    it('returns products with low stock', async () => {
      const products: any[] = [
        { id: 'p-1', name: 'Low', sku: 'L-001', stock: 3, tenantId: TENANT_ID },
      ];
      (db as any).then.mockImplementation((resolve: any) => resolve(products));

      const result = await service.getLowStock(TENANT_ID);

      expect(result).toEqual(products);
    });

    it('returns empty array when no low stock products', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      const result = await service.getLowStock(TENANT_ID);

      expect(result).toEqual([]);
    });
  });

  describe('getSummary', () => {
    it('returns default zeros when no data', async () => {
      (db as any).execute.mockResolvedValue({ rows: [] });

      const result = await service.getSummary(TENANT_ID);

      expect(result).toEqual({
        totalProducts: 0,
        totalUnits: 0,
        totalValue: 0,
        outOfStock: 0,
        lowStock: 0,
      });
    });

    it('returns calculated summary values', async () => {
      (db as any).execute.mockResolvedValue({
        rows: [{
          total_products: 10,
          total_units: 150,
          total_value: '5000.00',
          out_of_stock: 2,
          low_stock: 3,
        }],
      });

      const result = await service.getSummary(TENANT_ID);

      expect(result.totalProducts).toBe(10);
      expect(result.totalUnits).toBe(150);
      expect(result.totalValue).toBe(5000);
      expect(result.outOfStock).toBe(2);
      expect(result.lowStock).toBe(3);
    });
  });

  describe('getAvailableStock', () => {
    it('returns 0 when product not found', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      const result = await service.getAvailableStock(TENANT_ID, 'missing');

      expect(result).toBe(0);
    });

    it('returns stock minus reservations', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ id: 'p-1', stock: 20 }]))
        .mockImplementationOnce((resolve: any) => resolve([{ sum: 5 }]));

      const result = await service.getAvailableStock(TENANT_ID, 'p-1');

      expect(result).toBe(15);
    });

    it('returns stock minus safety buffer and reservations when storeId given', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ id: 'p-1', stock: 20 }]))
        .mockImplementationOnce((resolve: any) => resolve([{ id: 's-1', configJson: '{"safetyStockBuffer":3}' }]))
        .mockImplementationOnce((resolve: any) => resolve([{ sum: 5 }]));

      const result = await service.getAvailableStock(TENANT_ID, 'p-1', 's-1');

      expect(result).toBe(12);
    });

    it('handles null reservations sum', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ id: 'p-1', stock: 20 }]))
        .mockImplementationOnce((resolve: any) => resolve([{ sum: null }]));

      const result = await service.getAvailableStock(TENANT_ID, 'p-1');

      expect(result).toBe(20);
    });

    it('returns 0 when available goes negative', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ id: 'p-1', stock: 5 }]))
        .mockImplementationOnce((resolve: any) => resolve([{ sum: 10 }]));

      const result = await service.getAvailableStock(TENANT_ID, 'p-1');

      expect(result).toBe(0);
    });
  });

  describe('createReservation', () => {
    const reservation: any = {
      id: 'r-1', tenantId: TENANT_ID, storeId: 's-1', externalOrderId: 'order-1',
      productId: 'p-1', quantityReserved: 5, status: 'reserved',
    };

    it('creates new reservation when none exists', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));
      (db as any).returning.mockResolvedValue([reservation]);

      const result = await service.createReservation(TENANT_ID, 's-1', 'order-1', 'p-1', 5);

      expect(result).toEqual([reservation]);
    });

    it('updates existing reservation for duplicate externalOrderId', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ id: 'r-1' }]));
      (db as any).returning.mockResolvedValue([{ ...reservation, quantityReserved: 10 }]);

      const result = await service.createReservation(TENANT_ID, 's-1', 'order-1', 'p-1', 10);

      expect((result as any)[0].quantityReserved).toBe(10);
    });
  });

  describe('releaseReservation', () => {
    it('updates reservation status to released', async () => {
      await service.releaseReservation(TENANT_ID, 'order-1');

      expect(db.update).toHaveBeenCalled();
      expect((db as any).set).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'released' }),
      );
    });
  });

  describe('consumeReservation', () => {
    const reservation: any = {
      id: 'r-1', tenantId: TENANT_ID, productId: 'p-1', quantityReserved: 5, status: 'reserved',
    };

    it('returns null when reservation not found', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      const result = await service.consumeReservation(TENANT_ID, 'order-1');

      expect(result).toBeNull();
    });

    it('consumes reservation and reduces product stock', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([reservation]));

      const result = await service.consumeReservation(TENANT_ID, 'order-1');

      expect(result).toEqual(reservation);
    });
  });

  describe('pushStockToMarketplace', () => {
    it('throws Error when store not found', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      await expect(
        service.pushStockToMarketplace(TENANT_ID, 's-1'),
      ).rejects.toThrow('Store not found');
    });

    it('returns push data with available stock', async () => {
      (db as any).then.mockImplementationOnce((resolve: any) => resolve([{ id: 's-1' }]));
      (db as any).execute.mockResolvedValue({
        rows: [
          { product_id: 'p-1', external_id: 'ext-1', stock: 20, safety_buffer: 3, reserved_qty: 5 },
        ],
      });

      const result = await service.pushStockToMarketplace(TENANT_ID, 's-1');

      expect(result.storeId).toBe('s-1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        productId: 'p-1',
        externalId: 'ext-1',
        available: 12,
      });
      expect(result.pushedAt).toBeDefined();
    });
  });

  describe('syncAllStoresStock', () => {
    it('syncs all active stores', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ id: 's-1' }, { id: 's-2' }]))
        .mockImplementationOnce((resolve: any) => resolve([{ id: 's-1' }]))
        .mockImplementationOnce((resolve: any) => resolve([{ id: 's-2' }]));
      (db as any).execute.mockResolvedValue({ rows: [] });

      const result = await service.syncAllStoresStock(TENANT_ID);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('success');
      expect(result[1].status).toBe('success');
    });

    it('handles store errors gracefully', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ id: 's-1' }]))
        .mockImplementationOnce((resolve: any) => resolve([]));

      const result = await service.syncAllStoresStock(TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('error');
    });
  });
});
