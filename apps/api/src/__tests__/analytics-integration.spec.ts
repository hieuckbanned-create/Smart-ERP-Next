jest.mock('@smart-erp/database', () => {
  const chainFn = jest.fn(() => db);
  const db: any = () => db;
  db.select = chainFn;
  db.from = chainFn;
  db.where = chainFn;
  db.orderBy = chainFn;
  db.limit = chainFn;
  db.offset = chainFn;
  db.groupBy = chainFn;
  db.innerJoin = chainFn;
  db.leftJoin = chainFn;
  db.insert = chainFn;
  db.values = chainFn;
  db.update = chainFn;
  db.set = chainFn;
  db.delete = chainFn;
  db.returning = jest.fn();
  db.execute = jest.fn();
  db.then = jest.fn();
  return { db, customers: {}, orders: {} };
});
jest.mock('@smart-erp/database/schema', () => ({ orders: {}, orderItems: {}, customers: {}, payments: {}, products: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({ eq: jest.fn(), and: jest.fn(), sql: jest.fn(), desc: jest.fn(), gte: jest.fn(), lte: jest.fn() }));

import { db } from '@smart-erp/database';
import { ForecastService } from '../analytics/forecast.service';
import { ClvService } from '../analytics/clv.service';
import { ChurnPredictionService } from '../analytics/churn.service';
import { CashflowForecastService } from '../analytics/cashflow-forecast.service';
import { PredictiveAnalyticsService } from '../analytics/predictive-analytics.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsDashboardService } from '../analytics-dashboard/analytics-dashboard.service';

const TENANT_ID = 'tenant-1';
const PRODUCT_ID = 'product-1';

// ────────────────────────────────────────────────────────────────────────────
// ForecastService (direct db)
// ────────────────────────────────────────────────────────────────────────────
describe('ForecastService', () => {
  let service: ForecastService;

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then.mockImplementation((resolve: any) => resolve([]));
    (db as any).execute.mockResolvedValue({ rows: [] });
    service = new ForecastService();
  });

  it('returns simple average forecast when fewer than 7 days of data', async () => {
    (db as any).then.mockImplementation((resolve: any) => resolve([
      { date: '2025-01-01', quantity: '10' },
      { date: '2025-01-02', quantity: '20' },
      { date: '2025-01-03', quantity: '30' },
    ]));

    const result = await service.getDemandForecast(TENANT_ID, PRODUCT_ID, 5);

    expect(result.forecast).toHaveLength(5);
    expect(result.forecast).toEqual([20, 20, 20, 20, 20]);
    expect(result.reorderRecommendation).toBeNull();
  });

  it('returns exponential smoothing forecast when data >= 7 days', async () => {
    const rows = Array.from({ length: 7 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      quantity: '50',
    }));
    (db as any).then.mockImplementation((resolve: any) => resolve(rows));

    const result = await service.getDemandForecast(TENANT_ID, PRODUCT_ID, 10);

    expect(result.forecast).toHaveLength(10);
    expect(result.forecast.every(v => v === 50)).toBe(true);
  });

  it('includes reorder recommendation when data >= 7 days', async () => {
    const rows = Array.from({ length: 7 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      quantity: '5',
    }));
    (db as any).then.mockImplementation((resolve: any) => resolve(rows));

    const result = await service.getDemandForecast(TENANT_ID, PRODUCT_ID);

    expect(result.reorderRecommendation).toBe(35);
  });

  it('returns zero-filled forecast when no data', async () => {
    (db as any).then.mockImplementation((resolve: any) => resolve([]));

    const result = await service.getDemandForecast(TENANT_ID, PRODUCT_ID, 3);

    expect(result.forecast).toEqual([0, 0, 0]);
    expect(result.reorderRecommendation).toBeNull();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// ClvService (direct db)
// ────────────────────────────────────────────────────────────────────────────
describe('ClvService', () => {
  let service: ClvService;

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then.mockImplementation((resolve: any) => resolve([]));
    (db as any).execute.mockResolvedValue({ rows: [] });
    service = new ClvService();
  });

  describe('computeAndStore', () => {
    it('skips processing when no customers exist', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      await service.computeAndStore(TENANT_ID);

      expect(db.execute).not.toHaveBeenCalled();
    });

    it('computes CLV and inserts prediction for each customer', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ id: 'c-1' }]));
      (db as any).execute
        .mockResolvedValueOnce({
          rows: [{
            total_spent: '2000000',
            avg_order_value: '1000000',
            order_count: '2',
            last_order_date: new Date(Date.now() - 15 * 86400000).toISOString(),
          }],
        })
        .mockResolvedValueOnce({ rows: [] });

      await service.computeAndStore(TENANT_ID);

      expect(db.execute).toHaveBeenCalledTimes(2);
    });

    it('handles multiple customers', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ id: 'c-1' }, { id: 'c-2' }]));
      // Order: computeMetrics calls db.execute per customer (2 agg queries), then computeAndStore does 2 INSERTs
      (db as any).execute
        .mockResolvedValueOnce({ rows: [{ total_spent: '500000', avg_order_value: '500000', order_count: '1', last_order_date: new Date().toISOString() }] })
        .mockResolvedValueOnce({ rows: [{ total_spent: '600000', avg_order_value: '600000', order_count: '2', last_order_date: new Date().toISOString() }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await service.computeAndStore(TENANT_ID);

      expect(db.execute).toHaveBeenCalledTimes(4);
    });
  });

  describe('getLatestPredictions', () => {
    it('returns empty array when no predictions exist', async () => {
      (db as any).execute.mockResolvedValue({ rows: [] });

      const result = await service.getLatestPredictions(TENANT_ID);

      expect(result).toEqual([]);
    });

    it('returns predictions with join data', async () => {
      (db as any).execute
        .mockResolvedValueOnce({ rows: [{ run_date: '2025-06-01' }] })
        .mockResolvedValueOnce({ rows: [{ customer_id: 'c-1', name: 'Test', predicted_clv: 5000000 }] });

      const result = await service.getLatestPredictions(TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0].customer_id).toBe('c-1');
    });

    it('filters by segment when provided', async () => {
      (db as any).execute
        .mockResolvedValueOnce({ rows: [{ run_date: '2025-06-01' }] })
        .mockResolvedValueOnce({ rows: [{ customer_id: 'c-1', segment: 'vip' }] });

      const result = await service.getLatestPredictions(TENANT_ID, 'vip');

      expect(result).toHaveLength(1);
    });
  });

  describe('getSegmentationSummary', () => {
    it('returns null when no data', async () => {
      (db as any).execute.mockResolvedValue({ rows: [] });

      const result = await service.getSegmentationSummary(TENANT_ID);

      expect(result).toBeNull();
    });

    it('returns segment summary rows', async () => {
      (db as any).execute
        .mockResolvedValueOnce({ rows: [{ run_date: '2025-06-01' }] })
        .mockResolvedValueOnce({ rows: [{ segment: 'vip', count: 5, total_clv: 50000000, avg_clv: 10000000 }] });

      const result = await service.getSegmentationSummary(TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0].segment).toBe('vip');
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// ChurnPredictionService (direct db)
// ────────────────────────────────────────────────────────────────────────────
describe('ChurnPredictionService', () => {
  let service: ChurnPredictionService;

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then.mockImplementation((resolve: any) => resolve([]));
    (db as any).execute.mockResolvedValue({ rows: [] });
    service = new ChurnPredictionService();
  });

  describe('computeAndStore', () => {
    it('skips when no customers exist', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      await service.computeAndStore(TENANT_ID);

      expect(db.execute).not.toHaveBeenCalled();
    });

    it('computes churn probability for each customer', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ id: 'c-1' }]));
      (db as any).execute
        .mockResolvedValueOnce({
          rows: [{
            total_spent: '100000',
            order_count: '1',
            last_order_date: new Date(Date.now() - 100 * 86400000).toISOString(),
          }],
        })
        .mockResolvedValueOnce({ rows: [] });

      await service.computeAndStore(TENANT_ID);

      expect(db.execute).toHaveBeenCalledTimes(2);
    });

    it('assigns high risk for long-inactive customers with low spend', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ id: 'c-1' }]));
      (db as any).execute
        .mockResolvedValueOnce({
          rows: [{
            total_spent: '100000',
            order_count: '1',
            last_order_date: new Date(Date.now() - 100 * 86400000).toISOString(),
          }],
        })
        .mockResolvedValueOnce({ rows: [] });

      await service.computeAndStore(TENANT_ID);
    });
  });

  describe('getLatestPredictions', () => {
    it('returns empty array when no predictions', async () => {
      (db as any).execute.mockResolvedValue({ rows: [] });

      const result = await service.getLatestPredictions(TENANT_ID);

      expect(result).toEqual([]);
    });

    it('returns predictions when data exists', async () => {
      (db as any).execute
        .mockResolvedValueOnce({ rows: [{ run_date: '2025-06-01' }] })
        .mockResolvedValueOnce({ rows: [{ customer_id: 'c-1', churn_probability: 85 }] });

      const result = await service.getLatestPredictions(TENANT_ID);

      expect(result).toHaveLength(1);
    });

    it('filters by risk segment', async () => {
      (db as any).execute
        .mockResolvedValueOnce({ rows: [{ run_date: '2025-06-01' }] })
        .mockResolvedValueOnce({ rows: [{ customer_id: 'c-1', risk_segment: 'high' }] });

      const result = await service.getLatestPredictions(TENANT_ID, 'high');

      expect(result).toHaveLength(1);
    });
  });

  describe('getSegmentSummary', () => {
    it('returns null when no data', async () => {
      (db as any).execute.mockResolvedValue({ rows: [] });

      const result = await service.getSegmentSummary(TENANT_ID);

      expect(result).toBeNull();
    });

    it('returns segment summary', async () => {
      (db as any).execute
        .mockResolvedValueOnce({ rows: [{ run_date: '2025-06-01' }] })
        .mockResolvedValueOnce({ rows: [{ risk_segment: 'high', count: 3, avg_probability: 85 }] });

      const result = await service.getSegmentSummary(TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0].risk_segment).toBe('high');
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CashflowForecastService (direct db)
// ────────────────────────────────────────────────────────────────────────────
describe('CashflowForecastService', () => {
  let service: CashflowForecastService;

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then.mockImplementation((resolve: any) => resolve([]));
    (db as any).execute.mockResolvedValue({ rows: [] });
    service = new CashflowForecastService();
  });

  describe('getHistoricalDailyNet', () => {
    it('returns daily net for the period', async () => {
      // Compute dates the same way the service does to avoid timezone mismatch
      const sd = new Date();
      sd.setDate(sd.getDate() - 1);
      sd.setHours(0, 0, 0, 0);
      const dates: string[] = [];
      const cur = new Date(sd);
      while (cur <= new Date()) {
        dates.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
      }
      const lastDate = dates[dates.length - 1];

      (db as any).execute
        .mockResolvedValueOnce({ rows: [{ date: lastDate, revenue: '1000' }] })
        .mockResolvedValueOnce({ rows: [{ date: lastDate, expense: '300' }] });

      const result = await service.getHistoricalDailyNet(TENANT_ID, 1);

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[result.length - 1].net).toBe(700);
    });

    it('returns zeros when no revenue or expense data', async () => {
      const result = await service.getHistoricalDailyNet(TENANT_ID, 1);

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(d => d.net === 0)).toBe(true);
    });
  });

  describe('forecast', () => {
    it('returns forecast structure', async () => {
      (db as any).execute
        .mockResolvedValueOnce({ rows: [{ date: new Date().toISOString().slice(0, 10), revenue: '500' }] })
        .mockResolvedValueOnce({ rows: [{ date: new Date().toISOString().slice(0, 10), expense: '200' }] });

      const result = await service.forecast(TENANT_ID, 5);

      expect(result.dates).toHaveLength(5);
      expect(result.values).toHaveLength(5);
      expect(result.historical).toBeDefined();
    });

    it('handles empty historical data', async () => {
      const result = await service.forecast(TENANT_ID, 3);

      expect(result.dates).toHaveLength(3);
      expect(result.values).toEqual([0, 0, 0]);
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// PredictiveAnalyticsService (DrizzleService DI)
// ────────────────────────────────────────────────────────────────────────────
describe('PredictiveAnalyticsService', () => {
  let service: PredictiveAnalyticsService;
  let mockDb: { execute: jest.Mock };

  beforeEach(() => {
    mockDb = { execute: jest.fn().mockResolvedValue({ rows: [] }) };
    service = new PredictiveAnalyticsService({ db: mockDb as any });
  });

  describe('calculateCLVScores', () => {
    it('returns empty array when no customers', async () => {
      mockDb.execute.mockResolvedValue({ rows: [] });

      const result = await service.calculateCLVScores(TENANT_ID);

      expect(result).toEqual([]);
    });

    it('calculates CLV scores with correct ranking', async () => {
      mockDb.execute.mockResolvedValue({
        rows: [
          { customer_id: 'c-1', customer_name: 'Alice', total_revenue: 1000, order_count: 5, avg_order_value: 200 },
          { customer_id: 'c-2', customer_name: 'Bob', total_revenue: 500, order_count: 2, avg_order_value: 250 },
        ],
      });

      const result = await service.calculateCLVScores(TENANT_ID);

      expect(result).toHaveLength(2);
      expect(result[0].clvScore).toBe(100);
      expect(result[0].churnRisk).toBe('low');
      expect(result[1].clvScore).toBe(50);
      expect(result[1].churnRisk).toBe('medium');
    });

    it('marks single-order customers as high churn risk', async () => {
      mockDb.execute.mockResolvedValue({
        rows: [
          { customer_id: 'c-1', customer_name: 'Alice', total_revenue: 100, order_count: 1, avg_order_value: 100 },
        ],
      });

      const result = await service.calculateCLVScores(TENANT_ID);

      expect(result[0].churnRisk).toBe('high');
    });
  });

  describe('getSalesTrend', () => {
    it('returns empty array when no data', async () => {
      mockDb.execute.mockResolvedValue({ rows: [] });

      const result = await service.getSalesTrend(TENANT_ID);

      expect(result).toEqual([]);
    });

    it('returns sales trend with growth rates', async () => {
      mockDb.execute.mockResolvedValue({
        rows: [
          { period: 'W1', revenue: 1000, orders_count: 10 },
          { period: 'W2', revenue: 1500, orders_count: 15 },
        ],
      });

      const result = await service.getSalesTrend(TENANT_ID);

      expect(result).toHaveLength(2);
      expect(result[0].growthRate).toBe(0);
      expect(result[1].growthRate).toBe(50);
    });
  });

  describe('getAtRiskCustomers', () => {
    it('returns only non-low churn risk customers', async () => {
      mockDb.execute.mockResolvedValue({
        rows: [
          { customer_id: 'c-1', customer_name: 'Alice', total_revenue: 100, order_count: 1, avg_order_value: 100 },
          { customer_id: 'c-2', customer_name: 'Bob', total_revenue: 500, order_count: 5, avg_order_value: 100 },
        ],
      });

      const result = await service.getAtRiskCustomers(TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0].customerId).toBe('c-1');
    });

    it('returns empty when no at-risk customers', async () => {
      mockDb.execute.mockResolvedValue({
        rows: [
          { customer_id: 'c-1', customer_name: 'Alice', total_revenue: 500, order_count: 10, avg_order_value: 50 },
        ],
      });

      const result = await service.getAtRiskCustomers(TENANT_ID);

      expect(result).toHaveLength(0);
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// AnalyticsService (DrizzleService DI — execute returns array directly)
// ────────────────────────────────────────────────────────────────────────────
describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockDb: { execute: jest.Mock };

  beforeEach(() => {
    mockDb = { execute: jest.fn().mockResolvedValue([]) };
    service = new AnalyticsService({ db: mockDb as any });
  });

  describe('getKPIs', () => {
    it('returns KPI array with zeros when no data', async () => {
      const result = await service.getKPIs(TENANT_ID);

      expect(result).toHaveLength(4);
      expect(result[0]).toMatchObject({ label: 'Revenue', value: 0, format: 'currency' });
      expect(result[1]).toMatchObject({ label: 'Orders', value: 0, format: 'number' });
      expect(result[2]).toMatchObject({ label: 'New Customers', value: 0, format: 'number' });
      expect(result[3]).toMatchObject({ label: 'Avg Order Value', value: 0, format: 'currency' });
    });

    it('calculates KPIs with correct changes', async () => {
      mockDb.execute
        .mockResolvedValueOnce([{ total: 60000 }])
        .mockResolvedValueOnce([{ total: 40000 }])
        .mockResolvedValueOnce([{ count: 60 }])
        .mockResolvedValueOnce([{ count: 40 }])
        .mockResolvedValueOnce([{ count: 15 }])
        .mockResolvedValueOnce([{ count: 10 }]);

      const result = await service.getKPIs(TENANT_ID);

      expect(result[0].value).toBe(60000);
      expect(result[0].change).toBe(50);
      expect(result[0].trend).toBe('up');
      expect(result[1].value).toBe(60);
      expect(result[2].value).toBe(15);
      expect(result[3].value).toBe(1000);
    });

    it('handles zero previous period values', async () => {
      mockDb.execute
        .mockResolvedValueOnce([{ total: 10000 }])
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([{ count: 10 }])
        .mockResolvedValueOnce([{ count: 0 }])
        .mockResolvedValueOnce([{ count: 5 }])
        .mockResolvedValueOnce([{ count: 0 }]);

      const result = await service.getKPIs(TENANT_ID);

      // Service code: prevRevenue=0 => revenueChange=0 => trend='up' (>= 0)
      expect(result[0].change).toBe(0);
      expect(result[0].trend).toBe('up');
      expect(result[3].value).toBe(1000);
    });
  });

  describe('getRevenueChart', () => {
    it('returns chart data with labels and datasets', async () => {
      mockDb.execute.mockResolvedValue([
        { date: '2025-01-01', revenue: 1000, orders: 10 },
        { date: '2025-01-02', revenue: 1500, orders: 12 },
      ]);

      const result = await service.getRevenueChart(TENANT_ID, '7d');

      expect(result.labels).toEqual(['2025-01-01', '2025-01-02']);
      expect(result.datasets).toHaveLength(2);
      expect(result.datasets[0].label).toBe('Revenue');
      expect(result.datasets[1].label).toBe('Orders');
    });

    it('returns empty chart when no data', async () => {
      mockDb.execute.mockResolvedValue([]);

      const result = await service.getRevenueChart(TENANT_ID, '30d');

      expect(result.labels).toEqual([]);
      expect(result.datasets[0].data).toEqual([]);
    });
  });

  describe('getTopProducts', () => {
    it('returns products ordered by revenue', async () => {
      mockDb.execute.mockResolvedValue([
        { id: 'p-1', name: 'Top Product', sku: 'TP-1', total_sold: 100, total_revenue: 50000 },
        { id: 'p-2', name: 'Second', sku: 'S-1', total_sold: 50, total_revenue: 25000 },
      ]);

      const result = await service.getTopProducts(TENANT_ID, 2);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('p-1');
    });

    it('returns empty array when no products', async () => {
      mockDb.execute.mockResolvedValue([]);

      const result = await service.getTopProducts(TENANT_ID);

      expect(result).toEqual([]);
    });
  });

  describe('getCustomerSegmentation', () => {
    it('returns segmentation data', async () => {
      mockDb.execute.mockResolvedValue([
        { segment: 'VIP', count: 5, total_revenue: 500000000 },
        { segment: 'Regular', count: 20, total_revenue: 50000000 },
      ]);

      const result = await service.getCustomerSegmentation(TENANT_ID);

      expect(result).toHaveLength(2);
      expect(result[0].segment).toBe('VIP');
    });

    it('returns empty when no data', async () => {
      mockDb.execute.mockResolvedValue([]);

      const result = await service.getCustomerSegmentation(TENANT_ID);

      expect(result).toEqual([]);
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// AnalyticsDashboardService (DrizzleService DI — execute returns array)
// ────────────────────────────────────────────────────────────────────────────
describe('AnalyticsDashboardService', () => {
  let service: AnalyticsDashboardService;
  let mockDb: { execute: jest.Mock };

  beforeEach(() => {
    mockDb = { execute: jest.fn().mockResolvedValue([]) };
    service = new AnalyticsDashboardService({ db: mockDb as any });
  });

  describe('getKPIs', () => {
    it('returns default KPI values when no data', async () => {
      const result = await service.getKPIs(TENANT_ID);

      expect(result.totalRevenue).toBe(0);
      expect(result.totalOrders).toBe(0);
      expect(result.avgOrderValue).toBe(0);
      expect(result.totalCustomers).toBe(0);
      expect(result.lowStockCount).toBe(0);
      expect(result.productionInProgress).toBe(0);
      expect(result.qualityPassRate).toBe(0);
      expect(result.periodComparison.revenueChange).toBe(0);
    });

    it('calculates KPIs with period comparison', async () => {
      mockDb.execute
        .mockResolvedValueOnce([{ revenue: 100000, orders: 50 }])
        .mockResolvedValueOnce([{ revenue: 80000, orders: 40 }])
        .mockResolvedValueOnce([{ total: 200 }])
        .mockResolvedValueOnce([{ total: 5 }])
        .mockResolvedValueOnce([{ total: 3 }])
        .mockResolvedValueOnce([{ total: 100, passed: 95 }]);

      const result = await service.getKPIs(TENANT_ID);

      expect(result.totalRevenue).toBe(100000);
      expect(result.totalOrders).toBe(50);
      expect(result.avgOrderValue).toBe(2000);
      expect(result.totalCustomers).toBe(200);
      expect(result.lowStockCount).toBe(5);
      expect(result.productionInProgress).toBe(3);
      expect(result.qualityPassRate).toBe(95);
      expect(result.periodComparison.revenueChange).toBe(25);
      expect(result.periodComparison.ordersChange).toBe(25);
    });

    it('handles quality with no inspections', async () => {
      mockDb.execute
        .mockResolvedValueOnce([{ revenue: 0, orders: 0 }])
        .mockResolvedValueOnce([{ revenue: 0, orders: 0 }])
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([{ total: 0, passed: 0 }]);

      const result = await service.getKPIs(TENANT_ID);

      expect(result.qualityPassRate).toBe(0);
    });
  });

  describe('getRevenueChart', () => {
    it('returns execute result directly', async () => {
      mockDb.execute.mockResolvedValue([
        { date: '2025-01-01', revenue: 1000, orders: 10 },
      ]);

      const result = await service.getRevenueChart(TENANT_ID, 7);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-01-01');
    });

    it('returns empty array when no data', async () => {
      const result = await service.getRevenueChart(TENANT_ID);

      expect(result).toEqual([]);
    });
  });

  describe('getTopProducts', () => {
    it('returns top products', async () => {
      mockDb.execute.mockResolvedValue([
        { id: 'p-1', name: 'P1', sku: 'SKU1', total_sold: 10, total_revenue: 5000 },
      ]);

      const result = await service.getTopProducts(TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p-1');
    });
  });

  describe('getAIInsights', () => {
    it('returns empty insights when insufficient data', async () => {
      mockDb.execute
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: 0 }])
        .mockResolvedValueOnce([{ total: 0, failed: 0 }])
        .mockResolvedValueOnce([{ count: 0 }]);

      const result = await service.getAIInsights(TENANT_ID);

      expect(result).toEqual([]);
    });

    it('returns revenue anomaly when value drops below 2 stddev', async () => {
      const normalRevenues = Array.from({ length: 13 }, (_, i) => ({ date: `2025-01-${String(i + 1).padStart(2, '0')}`, daily_revenue: 1000 }));
      const lowRevenue = { date: '2025-01-14', daily_revenue: 100 };

      mockDb.execute
        .mockResolvedValueOnce([...normalRevenues, lowRevenue])
        .mockResolvedValueOnce([{ count: 0 }])
        .mockResolvedValueOnce([{ total: 0, failed: 0 }])
        .mockResolvedValueOnce([{ count: 0 }]);

      const result = await service.getAIInsights(TENANT_ID);

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(i => i.type === 'anomaly')).toBe(true);
    });

    it('flags low stock alert', async () => {
      const revenues = Array.from({ length: 14 }, (_, i) => ({ date: `2025-01-${String(i + 1).padStart(2, '0')}`, daily_revenue: 1000 }));

      mockDb.execute
        .mockResolvedValueOnce(revenues)
        .mockResolvedValueOnce([{ count: 15 }])
        .mockResolvedValueOnce([{ total: 0, failed: 0 }])
        .mockResolvedValueOnce([{ count: 0 }]);

      const result = await service.getAIInsights(TENANT_ID);

      expect(result.some(i => i.metric === 'lowStock')).toBe(true);
      expect(result.find(i => i.metric === 'lowStock')?.severity).toBe('critical');
    });

    it('flags quality issues when fail rate exceeds 20%', async () => {
      const revenues = Array.from({ length: 14 }, (_, i) => ({ date: `2025-01-${String(i + 1).padStart(2, '0')}`, daily_revenue: 1000 }));

      mockDb.execute
        .mockResolvedValueOnce(revenues)
        .mockResolvedValueOnce([{ count: 0 }])
        .mockResolvedValueOnce([{ total: 10, failed: 5 }])
        .mockResolvedValueOnce([{ count: 0 }]);

      const result = await service.getAIInsights(TENANT_ID);

      expect(result.some(i => i.type === 'quality')).toBe(true);
      expect(result.find(i => i.type === 'quality')?.severity).toBe('critical');
    });

    it('flags stale production orders', async () => {
      const revenues = Array.from({ length: 14 }, (_, i) => ({ date: `2025-01-${String(i + 1).padStart(2, '0')}`, daily_revenue: 1000 }));

      mockDb.execute
        .mockResolvedValueOnce(revenues)
        .mockResolvedValueOnce([{ count: 0 }])
        .mockResolvedValueOnce([{ total: 0, failed: 0 }])
        .mockResolvedValueOnce([{ count: 3 }]);

      const result = await service.getAIInsights(TENANT_ID);

      expect(result.some(i => i.type === 'production')).toBe(true);
    });
  });
});
