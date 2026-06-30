import { FeatureFlagsService } from '../feature-flags/feature-flags.service';

jest.mock('@smart-erp/database', () => ({ db: { select: jest.fn(), insert: jest.fn(), update: jest.fn() } }));
jest.mock('@smart-erp/database/schema', () => ({ featureFlags: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({ eq: jest.fn((x) => x), and: jest.fn((...args) => args) }));

const { db } = jest.requireMock('@smart-erp/database') as { db: any };

const makeQuery = (data: any[]) => ({
  from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(data) }),
});

describe('FeatureFlagsService integration', () => {
  let service: FeatureFlagsService;

  beforeEach(() => {
    jest.clearAllMocks();
    db.select.mockReturnValue(makeQuery([]));
    service = new FeatureFlagsService();
  });

  it('returns false for unset flags', async () => {
    const enabled = await service.isEnabled('t1', 'nonexistent');
    expect(enabled).toBe(false);
  });

  it('creates and reads a flag', async () => {
    db.select.mockReturnValueOnce(makeQuery([]));
    db.insert.mockReturnValue({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 'f1' }]) }) });
    await service.setFlag('t1', 'new_dashboard', true, 'admin');

    db.select.mockReturnValue(makeQuery([{ flagKey: 'new_dashboard', enabled: true }]));
    const enabled = await service.isEnabled('t1', 'new_dashboard');
    expect(enabled).toBe(true);
  });

  it('updates existing flags', async () => {
    db.select.mockReturnValueOnce(makeQuery([{ id: 'f1', flagKey: 'dark_mode', enabled: false }]));
    db.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) });
    await service.setFlag('t1', 'dark_mode', true, 'admin');

    db.select.mockReturnValue(makeQuery([{ flagKey: 'dark_mode', enabled: true }]));
    const enabled = await service.isEnabled('t1', 'dark_mode');
    expect(enabled).toBe(true);
  });

  it('returns all flags for a tenant', async () => {
    const flags = [{ flagKey: 'a', enabled: true }, { flagKey: 'b', enabled: false }];
    db.select.mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(flags) }) });
    const result = await service.getAllFlags('t1');
    expect(result).toHaveLength(2);
  });
});
