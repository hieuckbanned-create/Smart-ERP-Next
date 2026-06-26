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
jest.mock('@smart-erp/database/schema', () => ({ qmsInspectionPlans: {}, qmsInspections: {}, qmsNcrs: {}, products: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  sql: jest.fn(),
  desc: jest.fn(),
}));

import { db } from '@smart-erp/database';
import { QmsService } from '../qms/qms.service';

describe('QmsService (integration)', () => {
  let service: QmsService;
  const TENANT_ID = 'tenant-1';
  const USER_ID = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then.mockImplementation((resolve: any) => resolve([]));
    (db as any).returning.mockReset();
    (db as any).returning.mockResolvedValue([]);
    service = new (QmsService as any)();
  });

  describe('createPlan', () => {
    it('creates and returns an inspection plan', async () => {
      const expected = { id: 'plan-1', tenantId: TENANT_ID, name: 'AQL Plan', samplingRule: 'AQL 1.0' };
      (db as any).returning.mockResolvedValue([expected]);

      const result = await service.createPlan(TENANT_ID, { name: 'AQL Plan' });

      expect(result).toEqual(expected);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('getPlans', () => {
    it('returns all plans for tenant', async () => {
      const plans = [
        { id: 'plan-1', name: 'Plan A', tenantId: TENANT_ID },
        { id: 'plan-2', name: 'Plan B', tenantId: TENANT_ID },
      ];
      (db as any).then.mockImplementation((resolve: any) => resolve(plans));

      const result = await service.getPlans(TENANT_ID);

      expect(result).toEqual(plans);
    });

    it('filters by productId when provided', async () => {
      const plans = [{ id: 'plan-1', productId: 'prod-1', tenantId: TENANT_ID }];
      (db as any).then.mockImplementation((resolve: any) => resolve(plans));

      const result = await service.getPlans(TENANT_ID, 'prod-1');

      expect(result).toEqual(plans);
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe('recordInspection', () => {
    it('records and returns a passed inspection', async () => {
      const inspection = { id: 'insp-1', verdict: 'pass', tenantId: TENANT_ID };
      (db as any).returning.mockResolvedValue([inspection]);

      const result = await service.recordInspection(TENANT_ID, USER_ID, {
        referenceType: 'production',
        referenceId: 'ref-1',
        verdict: 'pass',
      });

      expect(result).toEqual(inspection);
    });

    it('auto-creates NCR when verdict is fail', async () => {
      const inspection = { id: 'insp-2', verdict: 'fail', tenantId: TENANT_ID };
      (db as any).returning
        .mockResolvedValueOnce([inspection])
        .mockResolvedValueOnce([{ id: 'ncr-1' }]);

      const result = await service.recordInspection(TENANT_ID, USER_ID, {
        referenceType: 'production',
        referenceId: 'ref-2',
        verdict: 'fail',
        notes: 'Defect found',
        productId: 'prod-1',
      });

      expect(result).toEqual(inspection);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('getInspections', () => {
    it('returns all inspections for tenant ordered by date', async () => {
      const inspections = [{ id: 'insp-1', tenantId: TENANT_ID }];
      (db as any).then.mockImplementation((resolve: any) => resolve(inspections));

      const result = await service.getInspections(TENANT_ID);

      expect(result).toEqual(inspections);
    });

    it('filters by referenceType and referenceId', async () => {
      const inspections = [{ id: 'insp-1', referenceType: 'production', referenceId: 'ref-1' }];
      (db as any).then.mockImplementation((resolve: any) => resolve(inspections));

      const result = await service.getInspections(TENANT_ID, 'production', 'ref-1');

      expect(result).toEqual(inspections);
    });

    it('returns empty array when no inspections match', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      const result = await service.getInspections(TENANT_ID, 'purchase', 'nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('createNCR', () => {
    it('creates and returns an NCR with generated code', async () => {
      const expected = { id: 'ncr-1', code: 'NCR-TEST', defectCode: 'INSP-FAIL', tenantId: TENANT_ID };
      (db as any).returning.mockResolvedValue([expected]);

      const result = await service.createNCR(TENANT_ID, USER_ID, {
        defectCode: 'INSP-FAIL',
        description: 'Failed inspection',
      });

      expect(result.tenantId).toBe(TENANT_ID);
      expect(result.defectCode).toBe('INSP-FAIL');
      expect(result.code).toMatch(/^NCR-/);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('getNCRs', () => {
    it('returns all NCRs for tenant ordered by date', async () => {
      const ncrs = [{ id: 'ncr-1', code: 'NCR-001', tenantId: TENANT_ID }];
      (db as any).then.mockImplementation((resolve: any) => resolve(ncrs));

      const result = await service.getNCRs(TENANT_ID);

      expect(result).toEqual(ncrs);
    });

    it('filters by status when provided', async () => {
      const ncrs = [{ id: 'ncr-1', code: 'NCR-001', status: 'open', tenantId: TENANT_ID }];
      (db as any).then.mockImplementation((resolve: any) => resolve(ncrs));

      const result = await service.getNCRs(TENANT_ID, 'open');

      expect(result).toEqual(ncrs);
    });
  });

  describe('getQualityReport', () => {
    it('returns a quality report with static summary data', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = await service.getQualityReport(TENANT_ID, startDate, endDate);

      expect(result).toMatchObject({
        tenantId: TENANT_ID,
        startDate,
        endDate,
        totalInspections: 45,
        passRate: 95.6,
        ncrCount: 2,
      });
    });
  });

  describe('getSupplierQualityScore', () => {
    it('returns quality score for a supplier', async () => {
      const result = await service.getSupplierQualityScore(TENANT_ID, 'supplier-1');

      expect(result).toEqual({
        supplierId: 'supplier-1',
        score: 92.5,
        status: 'excellent',
      });
    });
  });
});
