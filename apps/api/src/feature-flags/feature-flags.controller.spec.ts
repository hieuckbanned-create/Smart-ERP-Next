import { FeatureFlagsController } from './feature-flags.controller';

describe('FeatureFlagsController', () => {
  let controller: FeatureFlagsController;
  let mockService: { isEnabled: jest.Mock; getAllFlags: jest.Mock; setFlag: jest.Mock };

  beforeEach(() => {
    mockService = { isEnabled: jest.fn(), getAllFlags: jest.fn(), setFlag: jest.fn() };
    controller = new FeatureFlagsController(mockService as any);
  });

  it('GET /feature-flags returns all flags for tenant', async () => {
    mockService.getAllFlags.mockResolvedValue([{ flagKey: 'new_pos', enabled: true }]);
    const req = { user: { tenantId: 't1' } };
    const result = await controller.getAllFlags(req as any);
    expect(result).toEqual([{ flagKey: 'new_pos', enabled: true }]);
  });

  it('GET /feature-flags/:key checks single flag', async () => {
    mockService.isEnabled.mockResolvedValue(true);
    const req = { user: { tenantId: 't1' } };
    const result = await controller.getFlag(req as any, 'new_pos');
    expect(result).toEqual({ flagKey: 'new_pos', enabled: true });
  });

  it('PATCH /feature-flags/:key updates a flag', async () => {
    const req = { user: { tenantId: 't1', sub: 'admin' } };
    await controller.setFlag(req as any, 'new_pos', { enabled: true });
    expect(mockService.setFlag).toHaveBeenCalledWith('t1', 'new_pos', true, 'admin');
  });
});
