import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryService],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have getAvailableStock method', () => {
    expect(typeof service.getAvailableStock).toBe('function');
  });

  it('should have adjust method', () => {
    expect(typeof service.adjust).toBe('function');
  });

  it('should have getReorderSuggestions method', () => {
    expect(typeof service.getReorderSuggestions).toBe('function');
  });

  it('should have getLowStock method', () => {
    expect(typeof service.getLowStock).toBe('function');
  });

  it('should have getSummary method', () => {
    expect(typeof service.getSummary).toBe('function');
  });

  it('should have getTransactions method', () => {
    expect(typeof service.getTransactions).toBe('function');
  });
});
