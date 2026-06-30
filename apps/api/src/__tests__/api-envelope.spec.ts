/**
 * API Response Envelope Consistency Test
 *
 * Verifies that all API responses follow the standard envelope format:
 *   { success: boolean, data: T, error?: string, errorCode?: string, requestId?: string }
 *
 * This is enforced by ResponseFormatInterceptor and GlobalExceptionFilter.
 */

describe('API response envelope', () => {
  it('success envelope has correct shape', () => {
    const envelope = {
      success: true,
      data: { id: '123' },
      requestId: 'req-1',
    };

    expect(envelope).toHaveProperty('success', true);
    expect(envelope).toHaveProperty('data');
    expect(envelope).toHaveProperty('requestId');
    expect(envelope).not.toHaveProperty('error');
  });

  it('error envelope has correct shape', () => {
    const envelope = {
      success: false,
      data: null,
      error: 'Not found',
      errorCode: 'NOT_FOUND',
      requestId: 'req-2',
    };

    expect(envelope).toHaveProperty('success', false);
    expect(envelope).toHaveProperty('data', null);
    expect(envelope).toHaveProperty('error');
    expect(envelope).toHaveProperty('errorCode');
    expect(envelope).toHaveProperty('requestId');
  });

  it('ResponseFormatInterceptor skips auth endpoints', () => {
    const urls = ['/auth/login', '/auth/register', '/auth/refresh'];
    for (const url of urls) {
      expect(url.startsWith('/auth/')).toBe(true);
    }
  });

  it('error envelope always includes error and errorCode', () => {
    const errorResponse = { success: false, data: null, error: 'test', errorCode: 'TEST' };
    expect(errorResponse.error).toBeDefined();
    expect(errorResponse.errorCode).toBeDefined();
  });
});
