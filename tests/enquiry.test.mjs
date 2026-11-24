import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { handleEnquiry, validateEnquiry } from '../cloudflare/enquiry.mjs';
import worker from '../cloudflare/worker.mjs';

const origin = 'https://shreekesharplastic.com';
const details = { full_name: 'QA Buyer', phone: '+91 90000 00000', requirement_type: 'cores',
  company: 'Example test company', work_email: 'qa@example.com', message: 'Synthetic test. Plastic cores for cloth rolls.', website: '' };
function request(data = details, options = {}) {
  return new Request(origin + '/api/enquiry', { method: 'POST', headers: {
    Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.5', ...options.headers
  }, body: typeof data === 'string' ? data : JSON.stringify(data) });
}
function environment(overrides = {}) {
  return { EMAIL_ENABLED: 'true', HOSTINGER_SMTP_PASSWORD: 'synthetic-test-only',
    ENQUIRY_RATE_LIMIT: { limit: async () => ({ success: true }) },
    ENQUIRY_TOTAL_LIMIT: { limit: async () => ({ success: true }) }, ...overrides };
}

test('validated enquiry uses only a fixed recipient and sender; text is not HTML', async () => {
  let mail;
  const response = await handleEnquiry(request({ ...details, to: 'attacker@example.com', from: 'other@example.com', message: '<script>test</script>' }), environment(), async data => { mail = data; return { messageId: 'mock-accepted' }; });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.accepted, true);
  assert.match(result.reference, /^[0-9a-f-]{36}$/);
  assert.equal(mail.reference, result.reference);
  assert.equal(mail.from, 'info@shreekesharplastic.com');
  assert.equal(mail.to, mail.from);
  assert.equal(mail.replyTo, details.work_email);
  assert.equal(mail.html, undefined);
  assert.match(mail.text, /<script>test<\/script>/);
  assert.doesNotMatch(JSON.stringify(result), /qa@example|90000|QA Buyer/);
});

test('method, content type and same-origin protections reject bad requests', async () => {
  assert.equal((await handleEnquiry(request(details, { headers: { Origin: 'https://other.test' } }), environment())).status, 403);
  assert.equal((await handleEnquiry(request(details, { headers: { Origin: 'null' } }), environment())).status, 403);
  assert.equal((await handleEnquiry(request(details, { headers: { 'Content-Type': 'text/plain' } }), environment())).status, 415);
  assert.equal((await handleEnquiry(new Request(origin + '/api/enquiry', { method: 'OPTIONS' }), environment())).status, 403);
  const unavailable = await handleEnquiry(new Request('https://preview.workers.dev/api/enquiry'), environment());
  assert.deepEqual(await unavailable.json(), { available: false });
});

test('mail stays unavailable until explicitly configured, including abuse controls', async () => {
  for (const patch of [{ EMAIL_ENABLED: 'false' }, { HOSTINGER_SMTP_PASSWORD: undefined },
    { HOSTINGER_SMTP_PASSWORD: '  ' }, { HOSTINGER_SMTP_PASSWORD: 'bad\r\nvalue' },
    { ENQUIRY_RATE_LIMIT: undefined }, { ENQUIRY_TOTAL_LIMIT: undefined }]) {
    const env = environment(patch);
    assert.deepEqual(await (await handleEnquiry(new Request(origin + '/api/enquiry'), env)).json(), { available: false });
    assert.equal((await handleEnquiry(request(), env)).status, 503);
  }
});

test('body and field limits, email header injection and honeypot fail before sending', async () => {
  let sends = 0;
  const env = environment();
  const send = async () => { sends++; };
  for (const data of [null, [], { ...details, full_name: ' ' }, { ...details, phone: 'abc123' },
    { ...details, requirement_type: '__proto__' }, { ...details, message: 'x'.repeat(2001) },
    { ...details, work_email: 'qa@example.com\r\nBcc: stolen@example.com' },
    { ...details, website: 'spam' }, { ...details, company: {} }, { ...details, message: '\0' }]) {
    assert.equal((await handleEnquiry(request(data), env, send)).status, 400);
  }
  assert.equal((await handleEnquiry(request('{'), env, send)).status, 400);
  assert.equal((await handleEnquiry(request('x'.repeat(17000)), env, send)).status, 413);
  assert.equal(sends, 0);
  assert.equal(validateEnquiry({ ...details, message: 'ગુજરાતીમાં પૂછપરછ' }).message, 'ગુજરાતીમાં પૂછપરછ');
});

test('rate limits fail closed and do not send mail', async () => {
  let sends = 0;
  const env = environment({ ENQUIRY_RATE_LIMIT: { limit: async () => ({ success: false }) } });
  const send = async () => { sends++; };
  const response = await handleEnquiry(request(), env, send);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  env.ENQUIRY_RATE_LIMIT.limit = async () => { throw new Error('unavailable'); };
  assert.equal((await handleEnquiry(request(), env, send)).status, 503);
  assert.equal(sends, 0);
});

test('provider failures and missing acknowledgements never claim success or leak errors', async () => {
  for (const send of [async () => { throw new Error('private provider secret'); }, async () => undefined]) {
    const response = await handleEnquiry(request(), environment(), send);
    assert.equal(response.status, 502);
    const result = await response.json();
    assert.equal(result.accepted, false);
    assert.doesNotMatch(result.message, /private provider secret/);
  }
});

test('SMTP support codes are allowlisted and never include provider text', async () => {
  for (const supportCode of ['SMTP_CONNECT_0_MODULE', 'private-password-and-server-reply', { secret: 'private' }]) {
    const response = await handleEnquiry(request(), environment(), async () => {
      throw new Error('private provider secret', { cause: { supportCode } });
    });
    const result = await response.json();
    assert.equal(response.status, 502);
    assert.doesNotMatch(result.message, /private|password|server-reply/);
    assert.match(result.message, supportCode === 'SMTP_CONNECT_0_MODULE' ? /SMTP_CONNECT_0_MODULE/ : /EMAIL_UNCONFIRMED/);
  }
});

test('GitHub origin can preflight and submit to the exact Worker, without credentialed CORS', async () => {
  const endpoint = 'https://shree-keshar-plastic.autumn-haze-c280.workers.dev/api/enquiry';
  const env = environment({ STAGING_ORIGIN: new URL(endpoint).origin, EMAIL_TRANSPORT: 'hostinger-api',
    HOSTINGER_MAIL_API_TOKEN: 'synthetic-token-for-unit-tests', HOSTINGER_MAILBOX_ID: 'AC0123456789abcdef' });
  const preflight = await handleEnquiry(new Request(endpoint, { method: 'OPTIONS', headers: {
    Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'
  } }), env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(preflight.headers.get('Access-Control-Allow-Credentials'), null);
  let sends = 0;
  const result = await handleEnquiry(new Request(endpoint, request()), env, async () => { sends++; return { accepted: true }; });
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(result.headers.get('Vary'), 'Origin');
  assert.equal(sends, 1);
  for (const attacker of ['https://shreekesharplastic.com.attacker.test', 'http://shreekesharplastic.com', 'null', 'https://other.workers.dev']) {
    const rejected = await handleEnquiry(new Request(endpoint, { method: 'OPTIONS', headers: { Origin: attacker, 'Access-Control-Request-Method': 'POST' } }), env);
    assert.equal(rejected.status, 403);
    assert.equal(rejected.headers.get('Access-Control-Allow-Origin'), null);
  }
  const unavailable = await handleEnquiry(new Request(endpoint, request()), { ...env, EMAIL_ENABLED: 'false' });
  assert.equal(unavailable.status, 503);
  assert.equal(unavailable.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal((await handleEnquiry(new Request(endpoint, request()), { ...env, HOSTINGER_MAIL_API_TOKEN: '' })).status, 503);
});

test('worker preserves internal HTML URLs, protects previews, and does not make a SPA fallback', async () => {
  const paths = [];
  const env = { ASSETS: { fetch: async req => { paths.push(new URL(req.url).pathname); return new Response('Page', { headers: { 'Content-Type': 'text/html' } }); } } };
  await worker.fetch(new Request(origin + '/contact.html'), env);
  await worker.fetch(new Request(origin + '/'), env);
  assert.deepEqual(paths, ['/contact.html', '/index.html']);
  const preview = await worker.fetch(new Request('https://preview.workers.dev/contact.html'), env);
  assert.equal(preview.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal(preview.headers.get('Cache-Control'), 'no-cache');
  const redirect = await worker.fetch(new Request('https://www.shreekesharplastic.com/contact.html?product=cores'), env);
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('Location'), origin + '/contact.html?product=cores');
  assert.equal((await worker.fetch(new Request(origin + '/api/unknown'), env)).status, 404);
});

test('production config selects the verified API without plaintext secrets or publishing source', async () => {
  const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.vars.EMAIL_ENABLED, 'true');
  assert.equal(config.vars.EMAIL_TRANSPORT, 'hostinger-api');
  assert.equal(config.vars.HOSTINGER_MAIL_API_TOKEN, undefined);
  assert.equal(config.send_email, undefined);
  assert.equal(config.vars.HOSTINGER_SMTP_PASSWORD, undefined);
  assert.equal(config.vars.STAGING_ORIGIN, 'https://shree-keshar-plastic.autumn-haze-c280.workers.dev');
  assert.equal(config.assets.html_handling, 'none');
  assert.equal(config.assets.not_found_handling, 'none');
  const builder = await readFile(new URL('../scripts/build-cloudflare.mjs', import.meta.url), 'utf8');
  assert.match(builder, /const files = new Set/);
  const built = await readdir(new URL('../dist/', import.meta.url));
  for (const name of ['.git', 'site', 'tests', 'cloudflare', 'generated', 'wrangler.jsonc', 'CNAME', '.dev.vars', '.env']) assert.ok(!built.includes(name));
});
