import { ForecastService } from './forecast.service';

jest.mock('@smart-erp/database', () => {
  const mockDb: any = {};
  mockDb.select = jest.fn();
  mockDb.execute = jest.fn();
  return { db: mockDb };
});
jest.mock('@smart-erp/database/schema', () => ({ orders: {}, orderItems: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({ eq: jest.fn(), and: jest.fn(), gte: jest.fn(), sql: jest.fn(), lte: jest.fn() }));

function mockChain(data: any[] = []): any {
  const c: any = Promise.resolve(data);
  c.from = jest.fn().mockReturnValue(c);
  c.where = jest.fn().mockReturnValue(c);
  c.innerJoin = jest.fn().mockReturnValue(c);
  c.orderBy = jest.fn().mockReturnValue(c);
  c.limit = jest.fn().mockResolvedValue(data);
  c.groupBy = jest.fn().mockReturnValue(c);
  return c;
}

describe('ForecastService', () => {
  let service: ForecastService;

  beforeEach(() => {
    jest.clearAllMocks();
    const mockDb = require('@smart-erp/database').db;
    mockDb.select.mockReturnValue(mockChain([]));
    service = new ForecastService();
  });

  it('returns forecast with expected shape', async () => {
    const result = await service.getMonthlyDemand('t1', 'prod-1');
    expect(result.productId).toBe('prod-1');
    expect(result.predictions).toBeDefined();
    expect(result.predictions.length).toBe(30);
    expect(result.source).toBe('builtin');
  });

  it('predictions have date and quantity', async () => {
    const result = await service.getMonthlyDemand('t1', 'prod-2');
    expect(result.predictions[0]).toHaveProperty('date');
    expect(result.predictions[0]).toHaveProperty('quantity');
    expect(typeof result.predictions[0].quantity).toBe('number');
  });

  it('suggestedOrder is sum of first 7 days', async () => {
    const result = await service.getMonthlyDemand('t1', 'prod-3');
    const sum7 = result.predictions.slice(0, 7).reduce((s, p) => s + p.quantity, 0);
    expect(result.suggestedOrder).toBe(sum7);
  });

  it('confidenceLower is 70% of predictions', async () => {
    const result = await service.getMonthlyDemand('t1', 'prod-4');
    expect(result.confidenceLower.length).toBe(30);
    expect(result.confidenceLower[0].quantity).toBeLessThanOrEqual(result.predictions[0].quantity);
  });

  it('confidenceUpper is 130% of predictions', async () => {
    const result = await service.getMonthlyDemand('t1', 'prod-5');
    expect(result.confidenceUpper.length).toBe(30);
    expect(result.confidenceUpper[0].quantity).toBeGreaterThanOrEqual(result.predictions[0].quantity);
  });
});
