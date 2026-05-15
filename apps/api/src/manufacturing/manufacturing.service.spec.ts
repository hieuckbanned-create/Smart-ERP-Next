import { Test, TestingModule } from '@nestjs/testing';
import { ManufacturingService } from './manufacturing.service';
import { DrizzleService } from '../drizzle/drizzle.service';
import { NotFoundException } from '@nestjs/common';

describe('ManufacturingService', () => {
  let service: ManufacturingService;
  let drizzleService: jest.Mocked<DrizzleService>;

  const mockProducts = [
    { id: 'prod-1', name: 'Product A', tenant_id: 'tenant-1' },
    { id: 'comp-1', name: 'Component X', tenant_id: 'tenant-1' },
    { id: 'comp-2', name: 'Component Y', tenant_id: 'tenant-1' },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    drizzleService = {
      db: {
        execute: jest.fn(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn(),
        orderBy: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
      },
    } as unknown as jest.Mocked<DrizzleService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManufacturingService,
        {
          provide: DrizzleService,
          useValue: drizzleService,
        },
      ],
    }).compile();

    service = module.get<ManufacturingService>(ManufacturingService);
  });

  describe('getBOM', () => {
    it('should return BOM items for a product', async () => {
      const mockBoms = [
        { id: 'bom-1', product_id: 'prod-1', component_product_id: 'comp-1', component_product_name: 'Component X', quantity: 2, unit_cost: 100, wastage_percent: 5 },
        { id: 'bom-2', product_id: 'prod-1', component_product_id: 'comp-2', component_product_name: 'Component Y', quantity: 3, unit_cost: 50, wastage_percent: 0 },
      ];

      (drizzleService.db.execute as jest.Mock).mockResolvedValue(mockBoms);

      const result = await service.getBOM('prod-1', 'tenant-1');

      expect(result).toHaveLength(2);
      expect(result[0].componentProductName).toBe('Component X');
      expect(result[1].quantity).toBe(3);
      expect(drizzleService.db.execute).toHaveBeenCalled();
    });

    it('should return empty array when no BOM exists', async () => {
      (drizzleService.db.execute as jest.Mock).mockResolvedValue([]);

      const result = await service.getBOM('prod-nonexistent', 'tenant-1');

      expect(result).toEqual([]);
    });
  });

  describe('addBOMItem', () => {
    it('should create a new BOM item and return updated BOM', async () => {
      const mockBoms = [
        { id: 'bom-new', product_id: 'prod-1', component_product_id: 'comp-1', component_product_name: 'Component X', quantity: 5, unit_cost: 100, wastage_percent: 10 },
      ];

      (drizzleService.db.insert as jest.Mock).mockReturnValue({ values: jest.fn().mockReturnThis() });
      (drizzleService.db.execute as jest.Mock).mockResolvedValueOnce(undefined).mockResolvedValueOnce(mockBoms);

      const result = await service.addBOMItem('tenant-1', 'prod-1', {
        componentProductId: 'comp-1',
        quantity: 5,
        unitCost: 100,
        wastagePercent: 10,
      });

      expect(result).toHaveLength(1);
      expect(drizzleService.db.insert).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('createProductionOrder', () => {
    it('should create a production order with generated code', async () => {
      const mockOrder = [{ id: 'order-1', order_code: 'MO-ABC', product_id: 'prod-1', quantity: 100, status: 'draft', created_by: 'user-1' }];

      (drizzleService.db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(mockOrder),
      });
      (drizzleService.db.execute as jest.Mock).mockResolvedValue(mockOrder);

      const result = await service.createProductionOrder('tenant-1', 'user-1', {
        productId: 'prod-1',
        quantity: 100,
      });

      expect(result).toBeDefined();
      expect(result.orderCode).toContain('MO-');
      expect(result.productId).toBe('prod-1');
      expect(result.status).toBe('draft');
    });
  });

  describe('startProduction', () => {
    it('should throw NotFoundException when order does not exist', async () => {
      (drizzleService.db.execute as jest.Mock).mockResolvedValue([]);

      await expect(service.startProduction('tenant-1', 'nonexistent', 'user-1'))
        .rejects
        .toThrow(NotFoundException);

      const error = await service.startProduction('tenant-1', 'nonexistent', 'user-1').catch(e => e);
      expect(error.message).toContain('Production order not found');
    });

    it('should throw error when order is not in draft status', async () => {
      const mockOrder = [{ id: 'order-1', product_id: 'prod-1', status: 'in_progress' }];

      (drizzleService.db.execute as jest.Mock)
        .mockResolvedValueOnce(mockOrder);

      await expect(service.startProduction('tenant-1', 'order-1', 'user-1'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw error when insufficient materials', async () => {
      const mockOrder = [{ id: 'order-1', product_id: 'prod-1', status: 'draft', quantity: 10 }];
      const mockBoms = [{ id: 'bom-1', product_id: 'prod-1', component_product_id: 'comp-1', component_product_name: 'Component X', quantity: 5, unit_cost: 100, wastage_percent: 0 }];
      const mockInv = [{ current_stock: 20 }]; // Need 50 but only 20 in stock

      (drizzleService.db.execute as jest.Mock)
        .mockResolvedValueOnce(mockOrder)  // get order
        .mockResolvedValueOnce(mockBoms)  // getBOM
        .mockResolvedValueOnce(mockInv);  // check inventory

      await expect(service.startProduction('tenant-1', 'order-1', 'user-1'))
        .rejects
        .toThrow('Insufficient materials');
    });
  });

  describe('completeProduction', () => {
    it('should update order status and add to inventory', async () => {
      const mockOrder = [{ id: 'order-1', product_id: 'prod-1', status: 'in_progress', quantity: 100 }];

      (drizzleService.db.execute as jest.Mock).mockResolvedValueOnce(mockOrder);
      (drizzleService.db.update as jest.Mock).mockReturnValue({ set: jest.fn().mockReturnThis(), where: jest.fn() });

      const result = await service.completeProduction('tenant-1', 'order-1', 'user-1');

      expect(drizzleService.db.update).toHaveBeenCalled();
      expect(drizzleService.db.insert).toHaveBeenCalled();
    });
  });

  describe('getProductionOrderById', () => {
    it('should return production order with BOM items', async () => {
      const mockOrder = [{ id: 'order-1', order_code: 'MO-TEST', product_id: 'prod-1', quantity: 50, status: 'draft', product_name: 'Product A' }];
      const mockBoms = [{ id: 'bom-1', product_id: 'prod-1', component_product_id: 'comp-1', component_product_name: 'Component X', quantity: 2 }];

      (drizzleService.db.execute as jest.Mock)
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce(mockBoms);

      const result = await service.getProductionOrderById('tenant-1', 'order-1');

      expect(result.id).toBe('order-1');
      expect(result.orderCode).toBe('MO-TEST');
      expect(result.bomItems).toHaveLength(1);
    });

    it('should throw NotFoundException when order does not exist', async () => {
      (drizzleService.db.execute as jest.Mock).mockResolvedValue([]);

      await expect(service.getProductionOrderById('tenant-1', 'nonexistent'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('listProductionOrders', () => {
    it('should return filtered orders by status', async () => {
      const mockOrders = [
        { id: '1', order_code: 'MO-1', product_name: 'Product A', status: 'in_progress', quantity: 10 },
        { id: '2', order_code: 'MO-2', product_name: 'Product B', status: 'in_progress', quantity: 20 },
      ];

      (drizzleService.db.execute as jest.Mock).mockResolvedValue(mockOrders);

      const result = await service.listProductionOrders('tenant-1', 'in_progress', 20, 1);

      expect(drizzleService.db.execute).toHaveBeenCalled();
    });

    it('should return all orders when no status filter', async () => {
      const mockOrders = [
        { id: '1', order_code: 'MO-1', product_name: 'Product A', status: 'draft' },
        { id: '2', order_code: 'MO-2', product_name: 'Product B', status: 'completed' },
      ];

      (drizzleService.db.execute as jest.Mock).mockResolvedValue(mockOrders);

      const result = await service.listProductionOrders('tenant-1', undefined, 20, 1);

      expect(result).toHaveLength(2);
    });
  });

  describe('calculateProductionCost', () => {
    it('should calculate total cost from BOM items', async () => {
      const mockBoms = [
        { id: 'bom-1', product_id: 'prod-1', component_product_id: 'comp-1', component_product_name: 'Steel', quantity: 2, unit_cost: 50, wastage_percent: 10 },
        { id: 'bom-2', product_id: 'prod-1', component_product_id: 'comp-2', component_product_name: 'Paint', quantity: 0.5, unit_cost: 100, wastage_percent: 5 },
      ];

      (drizzleService.db.execute as jest.Mock).mockResolvedValue(mockBoms);

      const result = await service.calculateProductionCost('tenant-1', 'prod-1', 10);

      // Steel: 2 * 10 * 1.10 * 50 = 1100
      // Paint: 0.5 * 10 * 1.05 * 100 = 525
      // Total: 1625, Unit: 163 (rounded)
      expect(result.totalMaterialCost).toBe(1625);
      expect(result.unitCost).toBe(163);
      expect(result.breakdown).toHaveLength(2);
      expect(result.breakdown[0].component).toBe('Steel');
    });

    it('should handle zero wastage', async () => {
      const mockBoms = [
        { id: 'bom-1', product_id: 'prod-1', component_product_id: 'comp-1', component_product_name: 'Steel', quantity: 2, unit_cost: 50, wastage_percent: 0 },
      ];

      (drizzleService.db.execute as jest.Mock).mockResolvedValue(mockBoms);

      const result = await service.calculateProductionCost('tenant-1', 'prod-1', 10);

      // Steel: 2 * 10 * 1.0 * 50 = 1000
      expect(result.totalMaterialCost).toBe(1000);
      expect(result.unitCost).toBe(100);
    });

    it('should handle null unitCost as 0', async () => {
      const mockBoms = [
        { id: 'bom-1', product_id: 'prod-1', component_product_id: 'comp-1', component_product_name: 'Steel', quantity: 2, unit_cost: null, wastage_percent: 0 },
      ];

      (drizzleService.db.execute as jest.Mock).mockResolvedValue(mockBoms);

      const result = await service.calculateProductionCost('tenant-1', 'prod-1', 10);

      expect(result.totalMaterialCost).toBe(0);
    });
  });

  describe('getQCCheckpoints', () => {
    it('should return default QC checkpoints', async () => {
      const result = await service.getQCCheckpoints('order-1', 'tenant-1');

      expect(result).toHaveLength(3);
      expect(result[0].checkpoint).toBe('Kiểm tra nguyên liệu');
    });
  });

  describe('updateQCCheckpoint', () => {
    it('should update checkpoint status', async () => {
      const result = await service.updateQCCheckpoint('order-1', 'qc-1', 'passed', 'OK');

      expect(result.id).toBe('qc-1');
      expect(result.status).toBe('passed');
      expect(result.checkedAt).toBeDefined();
    });
  });
});