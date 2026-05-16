import { Test, TestingModule } from '@nestjs/testing';
import { AccountingService } from './accounting.service';

describe('AccountingService', () => {
  let service: AccountingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountingService],
    }).compile();

    service = module.get<AccountingService>(AccountingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return accounting dashboard data', async () => {
      const result = await service.getDashboard('tenant-123', '2026');
      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('totalExpense');
      expect(result).toHaveProperty('netIncome');
      expect(result).toHaveProperty('cashBalance');
      expect(result).toHaveProperty('bankBalance');
    });
  });
});
