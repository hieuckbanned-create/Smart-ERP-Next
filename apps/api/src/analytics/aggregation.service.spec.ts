import { AggregationService } from './aggregation.service';

jest.mock('@smart-erp/database', () => ({ db: { select: jest.fn() } }));
jest.mock('@smart-erp/database/schema', () => ({ orders: {}, orderItems: {}, products: {}, customers: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({
  eq: jest.fn((x) => x),
  and: jest.fn((...args) => args),
  gte: jest.fn((x) => x),
  lte: jest.fn((x) => x),
  sql: jest.fn((s) => s),
}));

const { db } = jest.requireMock('@smart-erp/database') as { db: any };

describe('AggregationService', () => {
  let service: AggregationService;

  const mockQuery = (result: any[]) => {
    const chainable: Record<string, any> = {};
    const resolver = () => result;
    chainable.innerJoin = jest.fn().mockReturnValue(chainable);
    chainable.where = jest.fn().mockReturnValue(chainable);
    chainable.groupBy = jest.fn().mockReturnValue(chainable);
    chainable.orderBy = jest.fn().mockReturnValue(chainable);
    chainable.limit = jest.fn().mockResolvedValue(result);
    chainable.then = (resolve: (v: any) => void) => resolve(result);
    db.select.mockReturnValue({ from: jest.fn().mockReturnValue(chainable) });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AggregationService();
  });

  describe('dailyRevenue', () => {
    it('returns empty array when no orders', async () => {
      mockQuery([]);
      const result = await service.dailyRevenue('t1', 7);
      expect(result).toEqual([]);
    });

    it('returns daily revenue for the last N days', async () => {
      mockQuery([{ date: '2026-06-30', revenue: '1500000' }]);
      const result = await service.dailyRevenue('t1', 7);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('revenue');
    });
  });

  describe('topProducts', () => {
    it('returns top products by revenue', async () => {
      mockQuery([{ productId: 'p1', name: 'Widget', totalSold: 10, revenue: '500000' }]);
      const result = await service.topProducts('t1', 5);
      expect(result[0].name).toBe('Widget');
      expect(result[0].totalSold).toBe(10);
    });
  });

  describe('orderStats', () => {
    it('returns order statistics for a period', async () => {
      mockQuery([{ status: 'confirmed', count: 5 }]);
      const result = await service.orderStats('t1', '2026-06-01', '2026-06-30');
      expect(result).toHaveLength(1);
    });
  });
});
