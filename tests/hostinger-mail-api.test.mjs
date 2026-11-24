import test from 'node:test';
import assert from 'node:assert/strict';
import { mailApiConfigured, sendHostingerApiEmail } from '../cloudflare/hostinger-mail-api.mjs';

const env = { HOSTINGER_MAIL_API_TOKEN: 'synthetic-secret-for-unit-tests', HOSTINGER_MAILBOX_ID: 'AC0123456789abcdef' };
const mail = { from: 'info@shreekesharplastic.com', to: 'info@shreekesharplastic.com',
  reference: 'a77dfc06-35bc-4419-a218-efb3f79679f9', subject: 'Website enquiry / Plastic Replacement Cores',
  text: 'Synthetic enquiry. Work email: buyer@example.com\nગુજરાતીમાં પૂછપરછ', replyTo: 'buyer@example.com' };

test('HTTPS transport sends plain text to the fixed inbox and requires documented acceptance', async () => {
  let calls = 0;
  const result = await sendHostingerApiEmail(mail, env, { fetchMail: async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.mail.hostinger.com/api/v1/mailboxes/AC0123456789abcdef/send');
    assert.equal(options.redirect, 'manual');
    assert.equal(options.headers.Authorization, `Bearer ${env.HOSTINGER_MAIL_API_TOKEN}`);
    assert.equal(options.method, 'POST');
    assert.ok(options.signal instanceof AbortSignal);
    assert.deepEqual(JSON.parse(options.body), { to: [mail.to], displayName: 'Shree Keshar Plastic Website', subject: mail.subject, text: mail.text });
    return new Response(null, { status: 204 });
  } });
  assert.deepEqual(result, { accepted: true });
  assert.equal(calls, 1);
});

test('bad configuration and recipient/header overrides fail before network access', async () => {
  let calls = 0;
  const fetchMail = async () => { calls++; throw new Error('must not connect'); };
  for (const patch of [{ HOSTINGER_MAIL_API_TOKEN: '' }, { HOSTINGER_MAIL_API_TOKEN: 'bad\r\nsecret' },
    { HOSTINGER_MAILBOX_ID: '../another-mailbox' }, { HOSTINGER_MAILBOX_ID: '' }]) {
    assert.equal(mailApiConfigured({ ...env, ...patch }), false);
    await assert.rejects(sendHostingerApiEmail(mail, { ...env, ...patch }, { fetchMail }));
  }
  for (const patch of [{ to: 'other@example.com' }, { from: 'other@example.com' },
    { subject: 'Injected\r\nBcc: other@example.com' }, { text: 'x'.repeat(20001) }, { reference: 'bad' }]) {
    await assert.rejects(sendHostingerApiEmail({ ...mail, ...patch }, env, { fetchMail }));
  }
  assert.equal(calls, 0);
});

test('provider failures never leak response text, fabricate success or retry', async () => {
  for (const status of [200, 202, 301, 401, 403, 422, 429, 500, 502, 504]) {
    let calls = 0;
    await assert.rejects(sendHostingerApiEmail(mail, env, { fetchMail: async () => {
      calls++;
      return new Response('private-provider-response', { status });
    } }), error => {
      assert.doesNotMatch(error.message, /private|synthetic-secret/);
      assert.match(error.cause.supportCode, /^MAIL_API_(HTTP_\d{3}|UNCONFIRMED)$/);
      return true;
    });
    assert.equal(calls, 1);
  }
});

test('connection and timeout errors are bounded diagnostic codes without raw details', async () => {
  for (const name of ['TypeError', 'TimeoutError']) {
    let calls = 0;
    await assert.rejects(sendHostingerApiEmail(mail, env, { fetchMail: async () => {
      calls++;
      throw Object.assign(new Error('private request details'), { name });
    } }), error => {
      assert.equal(error.cause.supportCode, name === 'TimeoutError' ? 'MAIL_API_TIMEOUT' : 'MAIL_API_CONNECTION');
      assert.doesNotMatch(JSON.stringify(error), /private request/);
      return true;
    });
    assert.equal(calls, 1);
  }
});
