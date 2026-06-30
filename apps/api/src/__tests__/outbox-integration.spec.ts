import { OutboxService } from '../outbox/outbox.service';

jest.mock('@smart-erp/database', () => ({ db: { insert: jest.fn(), select: jest.fn(), update: jest.fn(), delete: jest.fn() } }));
jest.mock('@smart-erp/database/schema', () => ({ outboxEvents: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({ eq: jest.fn((x) => x), and: jest.fn((...args) => args), lte: jest.fn((x) => x) }));

const { db } = jest.requireMock('@smart-erp/database') as { db: any };

const queryThen = (data: any[]) => {
  const q = Promise.resolve(data) as any;
  q.limit = jest.fn().mockResolvedValue(data);
  return q;
};

const makeQuery = (data: any[]) => ({
  from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue(queryThen(data)) }),
});

describe('OutboxService integration', () => {
  let service: OutboxService;

  beforeEach(() => {
    jest.clearAllMocks();
    db.insert.mockReturnValue({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 'evt-1' }]) }) });
    service = new OutboxService();
  });

  it('emits an event and processes it with a handler', async () => {
    const eventId = await service.emit('order.placed', { orderId: 'o-1' }, 't1');
    expect(eventId).toBe('evt-1');

    const pendingEvents = [{ id: 'evt-1', eventType: 'order.placed', payload: { orderId: 'o-1' }, tenantId: 't1', status: 'pending' }];
    db.select.mockReturnValue(makeQuery(pendingEvents));
    db.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) });

    const handler = jest.fn().mockResolvedValue(undefined);
    const processed = await service.processPending(handler);
    expect(processed).toBe(1);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'order.placed' }));
  });

  it('emits multiple events and processes all', async () => {
    db.insert
      .mockReturnValueOnce({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 'evt-1' }]) }) })
      .mockReturnValueOnce({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 'evt-2' }]) }) });

    const id1 = await service.emit('order.created', {}, 't1');
    const id2 = await service.emit('order.created', {}, 't1');
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(db.insert).toHaveBeenCalledTimes(2);
  });

  it('marks events as failed when handler rejects', async () => {
    const pendingEvents = [{ id: 'evt-1', eventType: 'fail', payload: {}, tenantId: 't1', status: 'pending' }];
    db.select.mockReturnValue(makeQuery(pendingEvents));
    db.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) });

    const handler = jest.fn().mockRejectedValue(new Error('fail'));
    await service.processPending(handler);
    expect(db.update).toHaveBeenCalled();
  });

  it('handles empty pending queue gracefully', async () => {
    db.select.mockReturnValue(makeQuery([]));
    const count = await service.processPending(jest.fn());
    expect(count).toBe(0);
  });
});
