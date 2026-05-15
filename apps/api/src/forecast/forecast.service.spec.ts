import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { ForecastService } from './forecast.service';

describe('ForecastService', () => {
  let service: ForecastService;
  let cacheManager: jest.Mocked<Cache>;
  let axiosPost: jest.Mock;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock axios
    axiosPost = jest.fn();
    jest.doMock('axios', () => ({
      default: {
        post: axiosPost,
      },
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForecastService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ForecastService>(ForecastService);
    cacheManager = mockCacheManager as jest.Mocked<Cache>;

    mockConfigService.get.mockReturnValue('http://localhost:8000');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMonthlyDemand', () => {
    it('should return cached data if available', async () => {
      const cachedData = {
        productId: 'PROD-001',
        predictions: [{ date: '2024-01-01', quantity: 100 }],
        suggestedOrder: 50,
        confidenceLower: [],
        confidenceUpper: [],
        generatedAt: '2024-01-01T00:00:00Z',
      };

      cacheManager.get.mockResolvedValue(cachedData);

      const result = await service.getMonthlyDemand('PROD-001');

      expect(result).toEqual(cachedData);
      expect(cacheManager.get).toHaveBeenCalledWith('forecast:PROD-001');
      expect(axiosPost).not.toHaveBeenCalled();
    });

    it('should call AI service when cache is empty', async () => {
      cacheManager.get.mockResolvedValue(null);

      const mockResponse = {
        data: {
          predicted_daily_demand: [
            { date: '2024-01-01', quantity: 100 },
            { date: '2024-01-02', quantity: 110 },
          ],
          suggested_order_quantity: 150,
          confidence_lower: [{ date: '2024-01-01', quantity: 90 }],
          confidence_upper: [{ date: '2024-01-01', quantity: 120 }],
        },
      };

      axiosPost.mockResolvedValue(mockResponse);

      const result = await service.getMonthlyDemand('PROD-001');

      expect(axiosPost).toHaveBeenCalledWith(
        'http://localhost:8000/forecast',
        expect.objectContaining({
          product_id: 'PROD-001',
          lookahead_days: 30,
        }),
        expect.objectContaining({ timeout: 10000 })
      );

      expect(result.productId).toBe('PROD-001');
      expect(result.predictions).toEqual(mockResponse.data.predicted_daily_demand);
      expect(result.suggestedOrder).toBe(150);
      expect(cacheManager.set).toHaveBeenCalledWith(
        'forecast:PROD-001',
        expect.any(Object),
        { ttl: 300 }
      );
    });

    it('should return fallback forecast when AI service fails', async () => {
      cacheManager.get.mockResolvedValue(null);
      axiosPost.mockRejectedValue(new Error('AI service unavailable'));

      const result = await service.getMonthlyDemand('PROD-001');

      expect(result.productId).toBe('PROD-001');
      expect(result).toHaveProperty('isFallback', true);
      expect(result).toHaveProperty('data');
    });

    it('should use custom AI service URL from config', async () => {
      cacheManager.get.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue('http://custom-ai:9000');

      axiosPost.mockResolvedValue({
        data: {
          predicted_daily_demand: [],
          suggested_order_quantity: 0,
          confidence_lower: [],
          confidence_upper: [],
        },
      });

      await service.getMonthlyDemand('PROD-001');

      expect(axiosPost).toHaveBeenCalledWith(
        'http://custom-ai:9000/forecast',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should generate 60 days of sales history', async () => {
      cacheManager.get.mockResolvedValue(null);
      axiosPost.mockResolvedValue({
        data: {
          predicted_daily_demand: [],
          suggested_order_quantity: 0,
          confidence_lower: [],
          confidence_upper: [],
        },
      });

      await service.getMonthlyDemand('PROD-001');

      const callArgs = axiosPost.mock.calls[0][1];
      expect(callArgs.sales_history).toHaveLength(60);
      expect(callArgs.sales_history[0].date).toBeDefined();
      expect(typeof callArgs.sales_history[0].quantity).toBe('number');
    });

    it('should cache result for 5 minutes', async () => {
      cacheManager.get.mockResolvedValue(null);
      axiosPost.mockResolvedValue({
        data: {
          predicted_daily_demand: [],
          suggested_order_quantity: 0,
          confidence_lower: [],
          confidence_upper: [],
        },
      });

      await service.getMonthlyDemand('PROD-001');

      expect(cacheManager.set).toHaveBeenCalledWith(
        'forecast:PROD-001',
        expect.any(Object),
        { ttl: 300 }
      );
    });
  });
});
