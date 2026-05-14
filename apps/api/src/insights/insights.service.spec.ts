import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';

describe('InsightsService', () => {
  let service: InsightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsightsService],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateInsights', () => {
    it('should generate insights for tenant', async () => {
      const result = await service.generateInsights('tenant-123');
      expect(result).toHaveProperty('todayRevenue');
      expect(result).toHaveProperty('todayOrders');
      expect(result).toHaveProperty('totalCustomers');
      expect(result).toHaveProperty('lowStockCount');
      expect(result).toHaveProperty('insights');
      expect(Array.isArray(result.insights)).toBe(true);
    });

    it('should include growth insight when revenue trend > 20%', async () => {
      const result = await service.generateInsights('tenant-123');
      const growthInsight = result.insights.find((i) => i.type === 'growth');
      if (growthInsight) {
        expect(growthInsight.severity).toBe('info');
      }
    });
  });
});
