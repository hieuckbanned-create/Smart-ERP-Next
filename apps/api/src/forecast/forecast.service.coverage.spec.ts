import { ForecastService } from './forecast.service';

describe('ForecastService', () => {
  let service: ForecastService;

  beforeEach(() => {
    service = new ForecastService();
  });

  it('returns forecast with expected shape', async () => {
    const result = await service.getMonthlyDemand('prod-1');
    expect(result.productId).toBe('prod-1');
    expect(result.predictions).toBeDefined();
    expect(result.predictions.length).toBe(30);
    expect(result.source).toBe('builtin');
  });

  it('predictions have date and quantity', async () => {
    const result = await service.getMonthlyDemand('prod-2');
    expect(result.predictions[0]).toHaveProperty('date');
    expect(result.predictions[0]).toHaveProperty('quantity');
    expect(typeof result.predictions[0].quantity).toBe('number');
  });

  it('suggestedOrder is sum of first 7 days', async () => {
    const result = await service.getMonthlyDemand('prod-3');
    const sum7 = result.predictions.slice(0, 7).reduce((s, p) => s + p.quantity, 0);
    expect(result.suggestedOrder).toBe(sum7);
  });

  it('confidenceLower is 70% of predictions', async () => {
    const result = await service.getMonthlyDemand('prod-4');
    expect(result.confidenceLower.length).toBe(30);
    expect(result.confidenceLower[0].quantity).toBeLessThanOrEqual(result.predictions[0].quantity);
  });

  it('confidenceUpper is 130% of predictions', async () => {
    const result = await service.getMonthlyDemand('prod-5');
    expect(result.confidenceUpper.length).toBe(30);
    expect(result.confidenceUpper[0].quantity).toBeGreaterThanOrEqual(result.predictions[0].quantity);
  });
});
