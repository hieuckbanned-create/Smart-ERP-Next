import { ForecastController } from './forecast.controller';

describe('ForecastController (forecast)', () => {
  let svc: any;
  let ctrl: ForecastController;

  beforeEach(() => {
    svc = {
      getMonthlyDemand: jest.fn(),
    };
    ctrl = new ForecastController(svc);
  });

  it('getProductForecast delegates to forecastService.getMonthlyDemand', async () => {
    const mockData = { productId: 'p1', predictions: [], suggestedOrder: 0 };
    svc.getMonthlyDemand.mockResolvedValue(mockData);
    const req = { user: { tenantId: 't1' } };
    const r = await ctrl.getProductForecast(req, 'p1');
    expect(svc.getMonthlyDemand).toHaveBeenCalledWith('t1', 'p1');
    expect(r).toEqual({ productId: 'p1', data: mockData });
  });
});
