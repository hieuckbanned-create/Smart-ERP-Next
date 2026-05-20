jest.mock('uuid', () => ({
  v4: () => 'generated-request-id',
}));

import { RequestIdMiddleware } from './request-id.middleware';

describe('RequestIdMiddleware', () => {
  it('keeps an incoming request id and forwards it to the response', () => {
    const middleware = new RequestIdMiddleware();
    const req: any = { headers: { 'x-request-id': 'req-123' } };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    middleware.use(req, res as any, next);

    expect(req.requestId).toBe('req-123');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', 'req-123');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('generates a request id when the caller does not provide one', () => {
    const middleware = new RequestIdMiddleware();
    const req: any = { headers: {} };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    middleware.use(req, res as any, next);

    expect(req.requestId).toBe('generated-request-id');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.requestId);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
