const { readJson } = require('../release-runtime-smoke');

describe('release runtime smoke helpers', () => {
  it('parses successful JSON responses', async () => {
    await expect(readJson(new Response(JSON.stringify({ ok: true }), { status: 200 }), 'test')).resolves.toEqual({
      ok: true,
    });
  });

  it('throws detailed errors for failed responses', async () => {
    await expect(readJson(new Response('bad', { status: 500 }), 'GET /bad')).rejects.toThrow(
      'GET /bad failed: 500 bad',
    );
  });
});
