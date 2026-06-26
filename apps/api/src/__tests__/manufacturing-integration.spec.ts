jest.mock('@smart-erp/database', () => ({
  products: {},
  billsOfMaterials: {},
  bomRoutings: {},
  productionOrders: {},
  inventoryTransactions: {},
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((x: any) => x),
  and: jest.fn((...args: any[]) => args),
  desc: jest.fn((x: any) => x),
  sql: jest.fn((...args: any[]) => args),
}));

import { ManufacturingService } from '../manufacturing/manufacturing.service';
import { NotFoundException } from '@nestjs/common';

describe('ManufacturingService', () => {
  let service: ManufacturingService;
  let mockDb: any;

  const TENANT_ID = 'tenant-1';
  const USER_ID = 'user-1';
  const PRODUCT_ID = 'product-1';
  const ORDER_ID = 'order-1';
  const COMPONENT_ID = 'comp-1';

  beforeEach(() => {
    mockDb = () => mockDb;

    mockDb.select = jest.fn(() => mockDb);
    mockDb.from = jest.fn(() => mockDb);
    mockDb.where = jest.fn(() => mockDb);
    mockDb.limit = jest.fn(() => mockDb);
    mockDb.orderBy = jest.fn(() => mockDb);
    mockDb.insert = jest.fn(() => mockDb);
    mockDb.values = jest.fn(() => mockDb);
    mockDb.update = jest.fn(() => mockDb);
    mockDb.set = jest.fn(() => mockDb);
    mockDb.delete = jest.fn(() => mockDb);
    mockDb.returning = jest.fn();
    mockDb.execute = jest.fn();
    mockDb.then = jest.fn();

    (mockDb.then as jest.Mock).mockImplementation((resolve: any) => resolve([]));
    (mockDb.returning as jest.Mock).mockResolvedValue([]);

    service = new (ManufacturingService as any)({ db: mockDb });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── BOM ────────────────────────────────────────────────────────

  describe('getBOM', () => {
    it('returns BOM items mapped from raw query rows', async () => {
      const rawRows = [
        { id: 'bom-1', productId: PRODUCT_ID, componentProductId: COMPONENT_ID, componentProductName: 'Component A', quantity: '2', unitCost: '50', wastagePercent: '10' },
      ];
      (mockDb.execute as jest.Mock).mockResolvedValue(rawRows);

      const result = await service.getBOM(PRODUCT_ID, TENANT_ID);

      expect(result).toEqual([
        { id: 'bom-1', productId: PRODUCT_ID, componentProductId: COMPONENT_ID, componentProductName: 'Component A', quantity: 2, unitCost: 50, wastagePercent: 10 },
      ]);
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });

    it('returns empty array when no BOM exists', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValue([]);

      const result = await service.getBOM(PRODUCT_ID, TENANT_ID);

      expect(result).toEqual([]);
    });

    it('handles null unitCost and wastagePercent', async () => {
      const rawRows = [
        { id: 'bom-1', productId: PRODUCT_ID, componentProductId: COMPONENT_ID, componentProductName: 'Component A', quantity: '1', unitCost: null, wastagePercent: null },
      ];
      (mockDb.execute as jest.Mock).mockResolvedValue(rawRows);

      const result = await service.getBOM(PRODUCT_ID, TENANT_ID);

      expect(result[0].unitCost).toBeUndefined();
      expect(result[0].wastagePercent).toBeUndefined();
    });
  });

  describe('addBOMItem', () => {
    it('inserts a BOM item and returns updated BOM', async () => {
      const bomRows = [
        { id: 'bom-1', productId: PRODUCT_ID, componentProductId: COMPONENT_ID, componentProductName: 'Component A', quantity: '2', unitCost: '50', wastagePercent: null },
      ];
      (mockDb.execute as jest.Mock).mockResolvedValue(bomRows);

      const result = await service.addBOMItem(TENANT_ID, PRODUCT_ID, {
        componentProductId: COMPONENT_ID,
        quantity: 2,
        unitCost: 50,
      });

      expect(result).toHaveLength(1);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });

    it('inserts without optional fields when omitted', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValue([]);

      await service.addBOMItem(TENANT_ID, PRODUCT_ID, {
        componentProductId: COMPONENT_ID,
        quantity: 1,
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
    });
  });

  // ─── Production Orders ──────────────────────────────────────────

  describe('createProductionOrder', () => {
    const createdOrder = { id: ORDER_ID, tenant_id: TENANT_ID, product_id: PRODUCT_ID, quantity: '10', status: 'draft' };
    const detailRow = {
      id: ORDER_ID, order_code: 'MO-TEST', product_id: PRODUCT_ID, product_name: 'Product A',
      quantity: '10', status: 'draft', start_date: null, end_date: null, created_at: new Date().toISOString(),
    };

    it('creates a draft production order with generated code', async () => {
      (mockDb.returning as jest.Mock).mockResolvedValue([createdOrder]);
      (mockDb.execute as jest.Mock).mockResolvedValue([detailRow]);

      const result = await service.createProductionOrder(TENANT_ID, USER_ID, {
        productId: PRODUCT_ID,
        quantity: 10,
      });

      expect(result.status).toBe('draft');
      expect((result as any).product_id).toBe(PRODUCT_ID);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });
  });

  describe('startProduction', () => {
    const orderData = {
      id: ORDER_ID, tenant_id: TENANT_ID, order_code: 'MO-001', product_id: PRODUCT_ID,
      quantity: '10', status: 'draft', created_by: USER_ID,
    };
    const bomRows = [{
      id: 'bom-1', productId: PRODUCT_ID, componentProductId: COMPONENT_ID,
      componentProductName: 'Component A', quantity: 2, unitCost: 50, wastagePercent: 10,
    }];
    const detailRow = {
      id: ORDER_ID, order_code: 'MO-001', product_id: PRODUCT_ID, product_name: 'Product A',
      quantity: '10', status: 'in_progress', start_date: new Date().toISOString(), end_date: null, created_at: new Date().toISOString(),
    };

    it('starts production, checks inventory, consumes materials, and logs transaction', async () => {
      // 1. select chain → order (draft)
      (mockDb.then as jest.Mock)
        .mockImplementationOnce((resolve: any) => resolve([orderData]))
        .mockImplementation((resolve: any) => resolve([]));

      // 2. getBOM execute
      (mockDb.execute as jest.Mock).mockResolvedValueOnce(bomRows);
      // 3. SELECT current_stock
      (mockDb.execute as jest.Mock).mockResolvedValueOnce([{ current_stock: 100 }]);
      // 4. UPDATE inventory (void)
      (mockDb.execute as jest.Mock).mockResolvedValueOnce([]);
      // 5. getProductionOrderById select query
      (mockDb.execute as jest.Mock).mockResolvedValueOnce([detailRow]);
      // 6. getBOM inside getProductionOrderById
      (mockDb.execute as jest.Mock).mockResolvedValueOnce(bomRows);

      const result = await service.startProduction(TENANT_ID, ORDER_ID, USER_ID);

      expect(result.status).toBe('in_progress');
      // execute: getBOM + SELECT stock + UPDATE stock + getOrderById query + getBOM inside = 5
      expect(mockDb.execute).toHaveBeenCalledTimes(5);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled(); // inventory transaction
    });

    it('throws NotFoundException when order does not exist', async () => {
      (mockDb.then as jest.Mock)
        .mockImplementationOnce((resolve: any) => resolve([]))
        .mockImplementation((resolve: any) => resolve([]));

      await expect(service.startProduction(TENANT_ID, 'nonexistent', USER_ID))
        .rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when order is not in draft status', async () => {
      const inProgressOrder = { ...orderData, status: 'in_progress' };
      (mockDb.then as jest.Mock)
        .mockImplementationOnce((resolve: any) => resolve([inProgressOrder]))
        .mockImplementation((resolve: any) => resolve([]));

      await expect(service.startProduction(TENANT_ID, ORDER_ID, USER_ID))
        .rejects.toThrow('Order must be in draft status');
    });

    it('throws error when materials are insufficient', async () => {
      (mockDb.then as jest.Mock)
        .mockImplementationOnce((resolve: any) => resolve([orderData]))
        .mockImplementation((resolve: any) => resolve([]));

      // getBOM returns items
      (mockDb.execute as jest.Mock).mockResolvedValueOnce(bomRows);
      // SELECT current_stock returns insufficient stock
      (mockDb.execute as jest.Mock).mockResolvedValueOnce([{ current_stock: 5 }]);

      await expect(service.startProduction(TENANT_ID, ORDER_ID, USER_ID))
        .rejects.toThrow('Insufficient materials');
    });
  });

  describe('completeProduction', () => {
    const orderData = {
      id: ORDER_ID, tenant_id: TENANT_ID, order_code: 'MO-001', product_id: PRODUCT_ID,
      quantity: '10', status: 'in_progress', created_by: USER_ID,
    };
    const detailRow = {
      id: ORDER_ID, order_code: 'MO-001', product_id: PRODUCT_ID, product_name: 'Product A',
      quantity: '10', status: 'completed', start_date: null, end_date: null, created_at: new Date().toISOString(),
    };
    const bomRows = [{
      id: 'bom-1', productId: PRODUCT_ID, componentProductId: COMPONENT_ID,
      componentProductName: 'Component A', quantity: 2, unitCost: 50, wastagePercent: null,
    }];

    it('completes production, adds finished goods to inventory, and logs transaction', async () => {
      // update chain then select chain
      (mockDb.then as jest.Mock)
        .mockImplementationOnce((resolve: any) => resolve([]))
        .mockImplementationOnce((resolve: any) => resolve([orderData]))
        .mockImplementation((resolve: any) => resolve([]));

      (mockDb.execute as jest.Mock)
        // SELECT current_stock for finish goods
        .mockResolvedValueOnce([{ current_stock: 50 }])
        // UPDATE inventory
        .mockResolvedValueOnce([])
        // getProductionOrderById select
        .mockResolvedValueOnce([detailRow])
        // getBOM
        .mockResolvedValueOnce(bomRows);

      const result = await service.completeProduction(TENANT_ID, ORDER_ID, USER_ID);

      expect(result.status).toBe('completed');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled(); // inventory transaction
      expect(mockDb.execute).toHaveBeenCalledTimes(4);
    });
  });

  describe('reportProductionProgress', () => {
    it('returns success with reported quantities and timestamp', async () => {
      (mockDb.returning as jest.Mock).mockResolvedValue([{}]);

      const result = await service.reportProductionProgress(TENANT_ID, ORDER_ID, {
        quantityProduced: 8,
        quantityScrap: 2,
        notes: 'Test run',
      });

      expect(result.status).toBe('success');
      expect(result.orderId).toBe(ORDER_ID);
      expect(result.reportedQty).toBe(8);
      expect(result.scrapQty).toBe(2);
      expect(result.timestamp).toBeDefined();
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('defaults scrapQty to 0 when not provided', async () => {
      (mockDb.returning as jest.Mock).mockResolvedValue([{}]);

      const result = await service.reportProductionProgress(TENANT_ID, ORDER_ID, {
        quantityProduced: 5,
      });

      expect(result.scrapQty).toBe(0);
    });
  });

  describe('getProductionOrderById', () => {
    it('returns production order with BOM items', async () => {
      const orderRow = {
        id: ORDER_ID, order_code: 'MO-001', product_id: PRODUCT_ID, product_name: 'Product A',
        quantity: '10', status: 'draft', start_date: null, end_date: null, created_at: new Date().toISOString(),
      };
      const bomRows = [{ id: 'bom-1', productId: PRODUCT_ID, componentProductId: COMPONENT_ID, componentProductName: 'Component A', quantity: 2, unitCost: null, wastagePercent: null }];

      (mockDb.execute as jest.Mock)
        .mockResolvedValueOnce([orderRow])
        .mockResolvedValueOnce(bomRows);

      const result = await service.getProductionOrderById(TENANT_ID, ORDER_ID);

      expect(result.id).toBe(ORDER_ID);
      expect((result as any).product_id).toBe(PRODUCT_ID);
      expect(result.bomItems).toHaveLength(1);
    });

    it('throws NotFoundException when order does not exist', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValue([]);

      await expect(service.getProductionOrderById(TENANT_ID, 'nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('listProductionOrders', () => {
    it('returns orders filtered by tenant', async () => {
      const rows = [{ id: ORDER_ID, product_name: 'Product A' }];
      (mockDb.execute as jest.Mock).mockResolvedValue(rows);

      const result = await service.listProductionOrders(TENANT_ID);

      expect(result).toEqual(rows);
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });

    it('filters by status when provided', async () => {
      const rows = [{ id: ORDER_ID, product_name: 'Product A', status: 'in_progress' }];
      (mockDb.execute as jest.Mock).mockResolvedValue(rows);

      const result = await service.listProductionOrders(TENANT_ID, 'in_progress');

      expect(result).toEqual(rows);
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });

    it('respects pagination parameters', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValue([]);

      await service.listProductionOrders(TENANT_ID, undefined, 5, 2);

      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });
  });

  // ─── QC Checkpoints ─────────────────────────────────────────────

  describe('getQCCheckpoints', () => {
    it('returns default QC checkpoints with pending status', async () => {
      const result = await service.getQCCheckpoints(ORDER_ID, TENANT_ID);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ id: 'qc-1', productionOrderId: ORDER_ID, checkpoint: 'manufacturing.qc.checkpoint1', status: 'pending' });
      expect(result[1]).toEqual({ id: 'qc-2', productionOrderId: ORDER_ID, checkpoint: 'manufacturing.qc.checkpoint2', status: 'pending' });
      expect(result[2]).toEqual({ id: 'qc-3', productionOrderId: ORDER_ID, checkpoint: 'manufacturing.qc.checkpoint3', status: 'pending' });
    });
  });

  describe('updateQCCheckpoint', () => {
    it('returns updated checkpoint with timestamp', async () => {
      const result = await service.updateQCCheckpoint(ORDER_ID, 'qc-1', 'passed', 'All good');

      expect(result.id).toBe('qc-1');
      expect(result.status).toBe('passed');
      expect(result.notes).toBe('All good');
      expect(result.checkedAt).toBeDefined();
    });

    it('works without optional notes', async () => {
      const result = await service.updateQCCheckpoint(ORDER_ID, 'qc-2', 'failed');

      expect(result.status).toBe('failed');
      expect(result.notes).toBeUndefined();
    });
  });

  // ─── Cost Calculation ────────────────────────────────────────────

  describe('calculateProductionCost', () => {
    it('calculates material, labor, and overhead costs from BOM', async () => {
      const bomRows = [
        { id: 'bom-1', productId: PRODUCT_ID, componentProductId: COMPONENT_ID, componentProductName: 'Component A', quantity: 2, unitCost: 100, wastagePercent: 0 },
      ];
      (mockDb.execute as jest.Mock).mockResolvedValue(bomRows);

      const result = await service.calculateProductionCost(TENANT_ID, PRODUCT_ID, 10);

      // 2 units × 10 qty × 100 = 2000 material
      expect(result.totalMaterialCost).toBe(2000);
      // Labor 15% = 300
      expect(result.totalLaborCost).toBe(300);
      // Overhead 10% of (2000+300) = 230
      expect(result.totalOverheadCost).toBe(230);
      // Total = 2000 + 300 + 230 = 2530
      expect(result.totalCost).toBe(2530);
      expect(result.unitCost).toBe(253);
      expect(result.materialBreakdown).toHaveLength(1);
    });

    it('returns zero costs when BOM is empty', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValue([]);

      const result = await service.calculateProductionCost(TENANT_ID, PRODUCT_ID, 5);

      expect(result.totalMaterialCost).toBe(0);
      expect(result.totalLaborCost).toBe(0);
      expect(result.totalOverheadCost).toBe(0);
      expect(result.totalCost).toBe(0);
      expect(result.materialBreakdown).toEqual([]);
    });

    it('includes wastage in material calculations', async () => {
      const bomRows = [
        { id: 'bom-1', productId: PRODUCT_ID, componentProductId: COMPONENT_ID, componentProductName: 'Component A', quantity: 1, unitCost: 100, wastagePercent: 10 },
      ];
      (mockDb.execute as jest.Mock).mockResolvedValue(bomRows);

      const result = await service.calculateProductionCost(TENANT_ID, PRODUCT_ID, 10);

      // 1 × 10 × (1 + 10/100) = 11 units, 11 × 100 = 1100
      expect(result.totalMaterialCost).toBe(1100);
    });
  });

  describe('calculateVarianceAnalysis', () => {
    it('calculates material variance between standard and actual', async () => {
      const orderRow = {
        id: ORDER_ID, order_code: 'MO-001', product_id: PRODUCT_ID, product_name: 'Product A',
        quantity: '10', status: 'completed', start_date: null, end_date: null, created_at: new Date().toISOString(),
      };
      const bomRows = [{ id: 'bom-1', productId: PRODUCT_ID, componentProductId: COMPONENT_ID, componentProductName: 'Component A', quantity: 2, unitCost: 100, wastagePercent: 0 }];

      // getProductionOrderById: order query + BOM query
      (mockDb.execute as jest.Mock)
        .mockResolvedValueOnce([orderRow])
        .mockResolvedValueOnce(bomRows)
        // calculateProductionCost calls getBOM again
        .mockResolvedValueOnce(bomRows)
        // actual cost query
        .mockResolvedValueOnce([{ actual_cost: 2500 }]);

      const result = await service.calculateVarianceAnalysis(TENANT_ID, ORDER_ID);

      // Standard material: 2 × 10 × 100 = 2000
      expect(result.standardCost.totalMaterialCost).toBe(2000);
      // Actual: 2500
      expect(result.actualMaterialCost).toBe(2500);
      // Variance: 2500 - 2000 = 500 (over budget)
      expect(result.materialVariance).toBe(500);
      expect(result.isOverBudget).toBe(true);
      expect(result.orderId).toBe(ORDER_ID);
    });

    it('throws NotFoundException for non-existent order', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValue([]);

      await expect(service.calculateVarianceAnalysis(TENANT_ID, 'nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateFullProductionCost', () => {
    it('includes routing labor and overhead in full cost', async () => {
      const bomRows = [{ id: 'bom-1', productId: PRODUCT_ID, componentProductId: COMPONENT_ID, componentProductName: 'Component A', quantity: 1, unitCost: 100, wastagePercent: 0 }];
      const routingSteps = [
        { operationName: 'Cutting', workCenter: 'WC-1', setupTimeMinutes: '30', cycleTimeMinutes: '5', laborCostPerHour: '20', overheadCostPerHour: '10' },
      ];

      (mockDb.execute as jest.Mock).mockResolvedValue(bomRows);
      (mockDb.then as jest.Mock).mockImplementation((resolve: any) => resolve(routingSteps));

      const result = await service.calculateFullProductionCost(TENANT_ID, PRODUCT_ID, 10);

      // Material: 1 × 10 × 100 = 1000
      expect(result.totalMaterialCost).toBe(1000);
      // Routing: setup 30min + cycle 5min × 10 = 80min = 1.333h
      // Labor: 1.333 × 20 ≈ 27 (rounded)
      // Overhead: 1.333 × 10 ≈ 13 (rounded)
      expect(result.routingBreakdown).toHaveLength(1);
      expect(result.totalTimeMinutes).toBe(80);
      expect(result.grandTotal).toBeGreaterThan(1000);
      expect(result.unitCostFull).toBeGreaterThan(0);
    });
  });

  // ─── Routing ────────────────────────────────────────────────────

  describe('getRoutingSteps', () => {
    it('returns ordered routing steps for product and tenant', async () => {
      const steps = [
        { id: 'step-1', productId: PRODUCT_ID, tenantId: TENANT_ID, operationName: 'Cutting', sequenceOrder: 1 },
        { id: 'step-2', productId: PRODUCT_ID, tenantId: TENANT_ID, operationName: 'Assembly', sequenceOrder: 2 },
      ];
      (mockDb.then as jest.Mock).mockImplementation((resolve: any) => resolve(steps));

      const result = await service.getRoutingSteps(PRODUCT_ID, TENANT_ID);

      expect(result).toEqual(steps);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
    });

    it('returns empty array when no routing steps exist', async () => {
      (mockDb.then as jest.Mock).mockImplementation((resolve: any) => resolve([]));

      const result = await service.getRoutingSteps(PRODUCT_ID, TENANT_ID);

      expect(result).toEqual([]);
    });
  });

  describe('addRoutingStep', () => {
    it('inserts a routing step and returns it', async () => {
      const stepData = {
        productId: PRODUCT_ID,
        operationName: 'Cutting',
        description: 'Cut material to size',
        sequenceOrder: 1,
        workCenter: 'WC-1',
        setupTimeMinutes: 30,
        cycleTimeMinutes: 5,
        laborCostPerHour: 20,
        overheadCostPerHour: 10,
        requiresQC: true,
      };
      const inserted = { id: 'step-1', ...stepData };
      (mockDb.returning as jest.Mock).mockResolvedValue([inserted]);

      const result = await service.addRoutingStep(TENANT_ID, stepData);

      expect(result).toEqual(inserted);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });
  });

  describe('removeRoutingStep', () => {
    it('deletes the routing step and returns deleted flag', async () => {
      const result = await service.removeRoutingStep(TENANT_ID, 'step-1');

      expect(result).toEqual({ deleted: true });
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });
});
