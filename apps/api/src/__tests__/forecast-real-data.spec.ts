const mockDb: any = {};

jest.mock('@smart-erp/database', () => {
  mockDb.select = jest.fn();
  mockDb.execute = jest.fn();
  return { db: mockDb };
});
jest.mock('@smart-erp/database/schema', () => ({ orders: {}, orderItems: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({ eq: jest.fn((a: any, b: any) => ({ field: 'eq', a, b })), and: jest.fn((...args: any[]) => ({ op: 'and', args })), gte: jest.fn((a: any, b: any) => ({ field: 'gte', a, b })), sql: jest.fn((s: string) => ({ raw: s })), lte: jest.fn((a: any, b: any) => ({ field: 'lte', a, b })) }));

import { ForecastService } from '../forecast/forecast.service';

function mockChain(resolvedData: any[] = []): any {
  const c: any = Promise.resolve(resolvedData);
  c.from = jest.fn().mockReturnValue(c);
  c.where = jest.fn().mockReturnValue(c);
  c.innerJoin = jest.fn().mockReturnValue(c);
  c.orderBy = jest.fn().mockReturnValue(c);
  c.limit = jest.fn().mockResolvedValue(resolvedData);
  c.groupBy = jest.fn().mockReturnValue(c);
  return c;
}

describe('ForecastService — Real Data Integration', () => {
  let service: ForecastService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new (ForecastService as any)();
  });

  it('has getMonthlyDemand method accepting tenantId and productId', () => {
    expect(typeof service.getMonthlyDemand).toBe('function');
  });

  it('returns predictions when historical sales data exists', async () => {
    mockDb.select.mockReturnValue(mockChain([
      { date: '2026-06-01', total_qty: 15 },
      { date: '2026-06-02', total_qty: 20 },
      { date: '2026-06-03', total_qty: 12 },
    ]));

    const result = await service.getMonthlyDemand('tenant-1', 'product-1');
    expect(result.productId).toBe('product-1');
    expect(result.predictions.length).toBe(30);
    expect(result.source).toBe('builtin');
  });

  it('uses default average when no historical data', async () => {
    mockDb.select.mockReturnValue(mockChain([]));

    const result = await service.getMonthlyDemand('tenant-1', 'product-2');
    expect(result.predictions.length).toBe(30);
    expect(result.source).toBe('builtin');
  });

  it('controller passes tenantId from request', () => {
    const { ForecastController } = require('../forecast/forecast.controller');
    const mockService = { getMonthlyDemand: jest.fn().mockResolvedValue({}) };
    const ctrl = new (ForecastController as any)(mockService);
    ctrl.getProductForecast({ user: { tenantId: 't1' } }, 'p1');
    expect(mockService.getMonthlyDemand).toHaveBeenCalledWith('t1', 'p1');
  });
});
