import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import '../scripts/build-cloudflare-dashboard.mjs';

const { default: dashboard } = await import('../.wrangler/preview-worker.mjs');
const origin = 'https://preview.example.test';

test('dashboard bundle keeps email disabled without a runtime secret', async () => {
  const env = { STAGING_ORIGIN: origin, EMAIL_ENABLED: 'false' };
  const status = await dashboard.fetch(new Request(origin + '/api/enquiry'), env);
  assert.deepEqual(await status.json(), { available: false });
  const result = await dashboard.fetch(new Request(origin + '/api/enquiry', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{}'
  }), env);
  assert.equal(result.status, 503);
});

test('dashboard bundle preserves asset routing and preview headers', async () => {
  let path;
  const result = await dashboard.fetch(new Request(origin + '/'), {
    ASSETS: { fetch: async request => {
      path = new URL(request.url).pathname;
      return new Response('<h1>Preview</h1>', { headers: { 'Content-Type': 'text/html' } });
    } }
  });
  assert.equal(path, '/index.html');
  assert.equal(result.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal(result.headers.get('Cache-Control'), 'no-cache');
  const source = await readFile(new URL('../.wrangler/preview-worker.mjs', import.meta.url), 'utf8');
  assert.equal((source.match(/export default/g) || []).length, 1);
  assert.doesNotMatch(source, /^import\s/m);
  assert.match(source, /import\('cloudflare:sockets'\)/);
});
