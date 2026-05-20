import { SOCKET_NAMESPACE } from '../src';

describe('socket-types', () => {
  it('exports the activity socket namespace used by clients and gateways', () => {
    expect(SOCKET_NAMESPACE).toBe('/activities');
  });
});
