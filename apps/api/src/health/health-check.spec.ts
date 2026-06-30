import { HealthMonitorService } from './health-monitor.service';

jest.mock('../drizzle/drizzle.service', () => ({
  DrizzleService: jest.fn().mockImplementation(() => ({
    db: { execute: jest.fn().mockResolvedValue(undefined) },
  })),
}));

jest.mock('@smart-erp/database', () => ({ db: { select: jest.fn() } }));
jest.mock('@smart-erp/database/schema', () => ({ outboxEvents: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({ sql: jest.fn((s) => s), eq: jest.fn((x) => x), and: jest.fn((...args) => args) }));

describe('Health check', () => {
  let service: HealthMonitorService;

  beforeEach(() => {
    jest.clearAllMocks();
    const { DrizzleService } = require('../drizzle/drizzle.service');
    const config = { get: jest.fn() };
    service = new HealthMonitorService(config as any, new DrizzleService() as any);
  });

  it('reports healthy when database responds', async () => {
    const health = await service.getHealth();
    expect(health.status).toBe('healthy');
    expect(health.services.database.status).toBe('up');
  });

  it('reports down when database fails', async () => {
    const { DrizzleService } = require('../drizzle/drizzle.service');
    const config = { get: jest.fn() };
    const failingDrizzle = new DrizzleService();
    (failingDrizzle.db.execute as jest.Mock).mockRejectedValue(new Error('Connection refused'));
    const failingService = new HealthMonitorService(config as any, failingDrizzle as any);

    const health = await failingService.getHealth();
    expect(health.status).toBe('down');
    expect(health.services.database.status).toBe('down');
    expect(health.services.database.error).toContain('Connection refused');
  });
});
