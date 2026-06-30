import { ApiKeyThrottlerGuard } from './api-key-throttler.guard';

describe('ApiKeyThrottlerGuard', () => {
  let guard: ApiKeyThrottlerGuard;

  beforeEach(() => {
    guard = new ApiKeyThrottlerGuard();
  });

  it('allows requests under the API key limit', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-api-key': 'smart_erp_test_key' },
          ip: '127.0.0.1',
        }),
      }),
    } as any;

    for (let i = 0; i < 50; i++) {
      expect(guard.canActivate(context)).toBe(true);
    }
  });

  it('blocks requests that exceed the default limit', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {}, // No API key → uses default limit (100)
          ip: '10.0.0.99',
        }),
      }),
    } as any;

    for (let i = 0; i < 110; i++) {
      guard.canActivate(context);
    }
    expect(guard.canActivate(context)).toBe(false);
  });

  it('uses higher limit for API key vs anonymous requests', () => {
    const keyContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-api-key': 'smart_erp_key' },
          ip: '10.0.0.1',
        }),
      }),
    } as any;

    const noKeyContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          ip: '10.0.0.2',
        }),
      }),
    } as any;

    // API key should allow 150 calls (limit is 200)
    for (let i = 0; i < 150; i++) {
      expect(guard.canActivate(keyContext)).toBe(true);
    }

    // Non-key should block at 101
    for (let i = 0; i < 100; i++) {
      expect(guard.canActivate(noKeyContext)).toBe(true);
    }
    expect(guard.canActivate(noKeyContext)).toBe(false);
  });

  it('resets counter after window expires', () => {
    jest.useFakeTimers();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {}, // No API key
          ip: '10.0.0.98',
        }),
      }),
    } as any;

    for (let i = 0; i < 110; i++) {
      guard.canActivate(context);
    }
    expect(guard.canActivate(context)).toBe(false);

    jest.advanceTimersByTime(61000);
    expect(guard.canActivate(context)).toBe(true);
    jest.useRealTimers();
  });
});
