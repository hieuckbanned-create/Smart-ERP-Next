import { Test, TestingModule } from '@nestjs/testing';
import { ManufacturingService } from './manufacturing.service';
import { DrizzleService } from '../drizzle/drizzle.service';

describe('ManufacturingService', () => {
  let service: ManufacturingService;

  const mockDrizzleService = {
    db: {
      execute: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
      }),
    },
  } as unknown as jest.Mocked<DrizzleService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManufacturingService,
        {
          provide: DrizzleService,
          useValue: mockDrizzleService,
        },
      ],
    }).compile();

    service = module.get<ManufacturingService>(ManufacturingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have getBOM method', () => {
    expect(typeof service.getBOM).toBe('function');
  });

  it('should have addBOMItem method', () => {
    expect(typeof service.addBOMItem).toBe('function');
  });

  it('should have createProductionOrder method', () => {
    expect(typeof service.createProductionOrder).toBe('function');
  });

  it('should have startProduction method', () => {
    expect(typeof service.startProduction).toBe('function');
  });

  it('should have completeProduction method', () => {
    expect(typeof service.completeProduction).toBe('function');
  });

  it('should have getProductionOrderById method', () => {
    expect(typeof service.getProductionOrderById).toBe('function');
  });

  it('should have listProductionOrders method', () => {
    expect(typeof service.listProductionOrders).toBe('function');
  });

  it('should have calculateProductionCost method', () => {
    expect(typeof service.calculateProductionCost).toBe('function');
  });

  it('should have getQCCheckpoints method', () => {
    expect(typeof service.getQCCheckpoints).toBe('function');
  });

  it('should have updateQCCheckpoint method', () => {
    expect(typeof service.updateQCCheckpoint).toBe('function');
  });
});
