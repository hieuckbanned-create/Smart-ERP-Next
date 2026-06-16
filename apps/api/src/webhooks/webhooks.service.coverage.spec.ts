import { WebhooksService } from './webhooks.service';

const mockDb = {
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockResolvedValue([{ id: 'wh-1', url: 'https://example.com/hook', events: ['order.created'], active: true }]),
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
};

describe('WebhooksService', () => {
  let service: WebhooksService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WebhooksService({ db: mockDb } as any, { get: jest.fn() } as any, { sendNotification: jest.fn() } as any);
  });

  it('subscribe creates webhook', async () => {
    const result = await service.subscribe('t1', 'https://example.com/hook', ['order.created']);
    expect(result).toBeDefined();
    expect(result.id).toBe('wh-1');
  });

  it('listSubscriptions returns hooks', async () => {
    mockDb.select.mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{ id: 'wh-1' }]) }) });
    const result = await service.listSubscriptions('t1');
    expect(Array.isArray(result)).toBe(true);
  });
});
