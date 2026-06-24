import { FixedAssetsController } from './fixed-assets.controller';

describe('FixedAssetsController', () => {
  let svc: any;
  let ctrl: FixedAssetsController;

  beforeEach(() => {
    svc = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), runMonthlyDepreciation: jest.fn(), dispose: jest.fn() };
    ctrl = new FixedAssetsController(svc);
  });

  const req = { user: { tenantId: 't1' } };

  it('create delegates to service', async () => {
    svc.create.mockResolvedValue({ id: 'fa1' });
    const dto = { name: 'Server', purchaseCost: 50000 } as any;
    const r = await ctrl.create(req, dto);
    expect(svc.create).toHaveBeenCalledWith('t1', dto);
    expect(r).toEqual({ id: 'fa1' });
  });

  it('findAll delegates to service', async () => {
    svc.findAll.mockResolvedValue([]);
    await ctrl.findAll(req, '1', '20', 'IT Equipment', 'active');
    expect(svc.findAll).toHaveBeenCalledWith('t1', { page: 1, limit: 20, category: 'IT Equipment', status: 'active' });
  });

  it('findOne delegates to service', async () => {
    svc.findOne.mockResolvedValue({ id: 'fa1' });
    const r = await ctrl.findOne(req, 'fa1');
    expect(svc.findOne).toHaveBeenCalledWith('t1', 'fa1');
    expect(r).toEqual({ id: 'fa1' });
  });

  it('runDepreciation delegates to service', async () => {
    svc.runMonthlyDepreciation.mockResolvedValue({ processed: 5 });
    const r = await ctrl.runDepreciation(req);
    expect(svc.runMonthlyDepreciation).toHaveBeenCalledWith('t1');
    expect(r).toEqual({ processed: 5 });
  });

  it('dispose delegates to service', async () => {
    svc.dispose.mockResolvedValue({ id: 'fa1', status: 'disposed' });
    const r = await ctrl.dispose(req, 'fa1');
    expect(svc.dispose).toHaveBeenCalledWith('t1', 'fa1');
    expect(r).toEqual({ id: 'fa1', status: 'disposed' });
  });
});
