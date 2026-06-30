import { FeatureFlagsService } from './feature-flags.service';

jest.mock('@smart-erp/database', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock('@smart-erp/database/schema', () => ({ featureFlags: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({ eq: jest.fn((x) => x), and: jest.fn((...args) => args) }));

const { db } = jest.requireMock('@smart-erp/database') as any;

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;

  beforeEach(() => {
    jest.clearAllMocks();
    db.select.mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });
    service = new FeatureFlagsService();
  });

  describe('isEnabled', () => {
    it('returns true when flag exists and is enabled', async () => {
      db.select.mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{ flagKey: 'new_pos', enabled: true }]) }) });
      const result = await service.isEnabled('tenant-1', 'new_pos');
      expect(result).toBe(true);
    });

    it('returns false when flag exists and is disabled', async () => {
      db.select.mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{ flagKey: 'new_pos', enabled: false }]) }) });
      const result = await service.isEnabled('tenant-1', 'new_pos');
      expect(result).toBe(false);
    });

    it('returns false when flag does not exist', async () => {
      const result = await service.isEnabled('tenant-1', 'nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getAllFlags', () => {
    it('returns all flags for a tenant', async () => {
      const flags = [
        { flagKey: 'new_pos', enabled: true, description: 'New POS UI' },
        { flagKey: 'dark_mode', enabled: false, description: 'Dark mode' },
      ];
      db.select.mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(flags) }) });
      const result = await service.getAllFlags('tenant-1');
      expect(result).toHaveLength(2);
      expect(result[0].flagKey).toBe('new_pos');
    });

    it('returns empty array when no flags configured', async () => {
      const result = await service.getAllFlags('tenant-1');
      expect(result).toEqual([]);
    });
  });

  describe('setFlag', () => {
    it('inserts a new flag when it does not exist', async () => {
      db.select.mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });
      db.insert.mockReturnValue({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ flagKey: 'new_feature', enabled: true }]) }) });
      await service.setFlag('tenant-1', 'new_feature', true, 'admin');
      expect(db.insert).toHaveBeenCalled();
    });
  });
});
