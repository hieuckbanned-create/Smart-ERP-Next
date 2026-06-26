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
  db.onConflictDoUpdate = chainFn;

  return { db };
});
jest.mock('@smart-erp/database/schema', () => ({ supplierLeadTimes: {}, inventoryReorderSuggestions: {}, products: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  sql: jest.fn(),
  desc: jest.fn(),
}));

import { db } from '@smart-erp/database';
import { ScmService } from '../scm/scm.service';

describe('ScmService (integration)', () => {
  let service: ScmService;
  const TENANT_ID = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then.mockImplementation((resolve: any) => resolve([]));
    (db as any).returning.mockReset();
    (db as any).returning.mockResolvedValue([]);
    (db as any).execute.mockReset();
    (db as any).execute.mockResolvedValue([]);
    service = new (ScmService as any)();
  });

  describe('generateReorderSuggestions', () => {
    it('creates suggestions when stock is below reorder point', async () => {
      const rows = [
        { product_id: 'p-1', product_name: 'Widget', daily_velocity: 10, current_stock: 20, avg_lead_time_days: 7 },
      ];
      (db as any).execute.mockResolvedValue(rows);
      const suggestion = { id: 'sug-1', tenantId: TENANT_ID, productId: 'p-1' };
      (db as any).returning.mockResolvedValue([suggestion]);

      const result = await service.generateReorderSuggestions(TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('p-1');
      expect((db as any).execute).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
    });

    it('returns empty when stock is above reorder point', async () => {
      const rows = [
        { product_id: 'p-2', product_name: 'Well Stocked', daily_velocity: 5, current_stock: 200, avg_lead_time_days: 7 },
      ];
      (db as any).execute.mockResolvedValue(rows);

      const result = await service.generateReorderSuggestions(TENANT_ID);

      expect(result).toEqual([]);
    });

    it('uses default lead time 7 when avg_lead_time_days is null', async () => {
      const rows = [
        { product_id: 'p-3', product_name: 'No LT', daily_velocity: 2, current_stock: 5, avg_lead_time_days: null },
      ];
      (db as any).execute.mockResolvedValue(rows);
      const suggestion = { id: 'sug-2', tenantId: TENANT_ID, productId: 'p-3' };
      (db as any).returning.mockResolvedValue([suggestion]);

      const result = await service.generateReorderSuggestions(TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('p-3');
    });
  });

  describe('listSuggestions', () => {
    it('returns pending reorder suggestions with product name', async () => {
      const suggestions = [
        { id: 'sug-1', productName: 'Widget', suggestedQuantity: '300', priority: 'high', status: 'pending' },
        { id: 'sug-2', productName: 'Gadget', suggestedQuantity: '150', priority: 'medium', status: 'pending' },
      ];
      (db as any).then.mockImplementation((resolve: any) => resolve(suggestions));

      const result = await service.listSuggestions(TENANT_ID);

      expect(result).toEqual(suggestions);
    });

    it('returns empty array when no pending suggestions', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      const result = await service.listSuggestions(TENANT_ID);

      expect(result).toEqual([]);
    });
  });

  describe('approveSuggestion', () => {
    it('updates suggestion status to approved and returns it', async () => {
      const updated = [{ id: 'sug-1', status: 'approved', tenantId: TENANT_ID }];
      (db as any).returning.mockResolvedValue(updated);

      const result = await service.approveSuggestion(TENANT_ID, 'sug-1');

      expect(result).toEqual(updated);
      expect(db.update).toHaveBeenCalled();
    });

    it('returns empty array when suggestion not found', async () => {
      (db as any).returning.mockResolvedValue([]);

      const result = await service.approveSuggestion(TENANT_ID, 'nonexistent');

      expect(result).toEqual([]);
    });
  });
});
