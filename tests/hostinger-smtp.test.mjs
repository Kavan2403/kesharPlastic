import test from 'node:test';
import assert from 'node:assert/strict';
import { MAILBOX, sendHostingerEmail, smtpConfigured } from '../cloudflare/hostinger-smtp.mjs';

const env = { HOSTINGER_SMTP_PASSWORD: 'synthetic-password-for-tests' };
const mail = { from: MAILBOX, to: MAILBOX, subject: 'Website enquiry / Plastic Replacement Cores',
  reference: '01234567-89ab-cdef-0123-456789abcdef', replyTo: 'buyer@example.com',
  text: 'Synthetic enquiry\nગુજરાતીમાં પૂછપરછ\n.\nBcc: not-a-header@example.com' };
const failure = /^Error: Email acceptance could not be confirmed\.$/;
const encode = text => new TextEncoder().encode(text);
const auth = btoa(`\0${MAILBOX}\0${env.HOSTINGER_SMTP_PASSWORD}`);

function exchange({ mechanism = 'PLAIN', ack = '250 Queued\r\n', quit = '221 Bye\r\n' } = {}) {
  return [
    [`EHLO shreekesharplastic.com\r\n`, `250-mail.example.test\r\n250-SIZE 52428800\r\n250-AUTH ${mechanism}\r\n250 HELP\r\n`],
    ...(mechanism === 'LOGIN' ? [
      ['AUTH LOGIN\r\n', '334 VXNlcm5hbWU6\r\n'],
      [btoa(MAILBOX) + '\r\n', '334 UGFzc3dvcmQ6\r\n'],
      [btoa(env.HOSTINGER_SMTP_PASSWORD) + '\r\n', '235 Authenticated\r\n']
    ] : [
      ['AUTH PLAIN\r\n', '334 \r\n'],
      [auth + '\r\n', '235 Authenticated\r\n']
    ]),
    [`MAIL FROM:<${MAILBOX}>\r\n`, '250 Sender OK\r\n'],
    [`RCPT TO:<${MAILBOX}>\r\n`, '250 Recipient OK\r\n'],
    ['DATA\r\n', '354 Continue\r\n'],
    [/^Date: [\s\S]*\r\n\.\r\n$/, ack],
    ['QUIT\r\n', quit]
  ];
}

function fakeSocket(steps = exchange(), { greeting = '220 mail.example.test ESMTP\r\n', split = false, opened = Promise.resolve() } = {}) {
  const writes = [];
  let controller, resolveClosed, closed = false, cancelled = 0;
  function emit(text) {
    if (text === null) return;
    const bytes = encode(text);
    if (split) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
    } else controller.enqueue(bytes);
  }
  const socket = {
    opened,
    closed: new Promise(resolve => { resolveClosed = resolve; }),
    readable: new ReadableStream({ start(value) { controller = value; emit(greeting); } }),
    writable: new WritableStream({ write(bytes) {
      if (closed) throw new Error('Socket closed');
      const text = new TextDecoder().decode(bytes);
      const step = steps[writes.length];
      writes.push(text);
      assert.ok(step, 'Unexpected SMTP command');
      if (step[0] instanceof RegExp) assert.match(text, step[0]);
      else assert.equal(text, step[0]);
      if (step[1] instanceof Error) throw step[1];
      emit(step[1]);
    } }),
    close() {
      if (!closed) { closed = true; cancelled++; controller.close(); resolveClosed(); }
      return Promise.resolve();
    }
  };
  return {
    socket, writes,
    get cancelled() { return cancelled; },
    connect(address, options) {
      assert.deepEqual(address, { hostname: 'smtp.hostinger.com', port: 465 });
      assert.deepEqual(options, { secureTransport: 'on', allowHalfOpen: false });
      return socket;
    }
  };
}

test('Hostinger TLS SMTP accepts only after DATA acknowledgement, with UTF-8 safe MIME', async () => {
  const fake = fakeSocket(exchange(), { split: true });
  const result = await sendHostingerEmail(mail, env, { connect: fake.connect });
  assert.equal(result.messageId, `<${mail.reference}@shreekesharplastic.com>`);
  assert.equal(fake.cancelled, 1);
  assert.equal(fake.writes.at(-1), 'QUIT\r\n');
  const message = fake.writes.at(-2);
  const [headers, encoded] = message.slice(0, -5).split('\r\n\r\n');
  assert.match(headers, /From: Shree Keshar Plastic Website <info@shreekesharplastic.com>/);
  assert.match(headers, /Reply-To: <buyer@example.com>/);
  assert.doesNotMatch(headers, /Bcc:|synthetic-password/);
  assert.match(headers, /Content-Transfer-Encoding: base64/);
  assert.ok(encoded.split('\r\n').every(line => line.length <= 76));
  assert.equal(Buffer.from(encoded, 'base64').toString('utf8'), mail.text.replace(/\n/g, '\r\n'));
  assert.equal(message.match(/\r\n\.\r\n/g).length, 1);
});

test('advertised LOGIN is supported when PLAIN is not offered', async () => {
  const fake = fakeSocket(exchange({ mechanism: 'LOGIN' }));
  assert.ok((await sendHostingerEmail({ ...mail, replyTo: undefined }, env, { connect: fake.connect })).messageId);
  assert.doesNotMatch(fake.writes.at(-2), /Reply-To:/);
});

test('no credentials or message are sent if TLS fails, greeting fails, or AUTH is unsupported', async () => {
  const fake = fakeSocket([], { greeting: '554 Service unavailable\r\n' });
  await assert.rejects(sendHostingerEmail(mail, env, { connect: fake.connect }), failure);
  assert.equal(fake.writes.length, 0);
  const noAuth = fakeSocket([['EHLO shreekesharplastic.com\r\n', '250-mail.example.test\r\n250 AUTH CRAM-MD5\r\n']]);
  await assert.rejects(sendHostingerEmail(mail, env, { connect: noAuth.connect }), failure);
  assert.equal(noAuth.writes.length, 1);
  const tls = fakeSocket([], { opened: Promise.reject(new Error('private TLS failure')) });
  await assert.rejects(sendHostingerEmail(mail, env, { connect: tls.connect }), failure);
  assert.equal(tls.writes.length, 0);
  assert.equal(tls.cancelled, 1);
});

test('AUTH failures are masked and never retried using another method', async () => {
  const steps = exchange();
  steps[0][1] = '250-mail.example.test\r\n250 AUTH PLAIN LOGIN\r\n';
  steps[2][1] = `535 Rejected ${env.HOSTINGER_SMTP_PASSWORD}\r\n`;
  const fake = fakeSocket(steps);
  await assert.rejects(sendHostingerEmail(mail, env, { connect: fake.connect }), error => {
    assert.match(String(error), failure);
    assert.deepEqual(error.cause, { supportCode: 'SMTP_AUTHENTICATION_535_FAILED' });
    assert.doesNotMatch(JSON.stringify(error), /synthetic-password/);
    return true;
  });
  assert.equal(fake.writes.length, 3);
  assert.equal(fake.cancelled, 1);
});

test('connection failures provide safe stage codes without authenticating or exposing provider text', async () => {
  const cases = [
    ['proxy request failed, cannot connect to the specified address', 'CONNECTION'],
    ['No such module cloudflare:sockets', 'MODULE'],
    ['TLS certificate rejected', 'TLS'],
    ['An unexpected connection error', 'FAILED']
  ];
  for (const [message, reason] of cases) {
    let attempts = 0;
    await assert.rejects(sendHostingerEmail(mail, env, { connect: async () => {
      attempts++;
      throw new Error(`${message}: private-provider-detail`);
    } }), error => {
      assert.match(String(error), failure);
      assert.deepEqual(error.cause, { supportCode: `SMTP_CONNECT_0_${reason}` });
      assert.doesNotMatch(JSON.stringify(error), /private-provider-detail/);
      return true;
    });
    assert.equal(attempts, 1);
  }
});

test('sender, recipient and DATA rejections cannot become successful enquiries', async () => {
  for (const index of [3, 4, 5, 6]) {
    const steps = exchange();
    steps[index][1] = '550 Synthetic rejection\r\n';
    const fake = fakeSocket(steps);
    await assert.rejects(sendHostingerEmail(mail, env, { connect: fake.connect }), failure);
    assert.equal(fake.writes.length, index + 1);
    assert.equal(fake.cancelled, 1);
  }
});

test('malformed and unbounded SMTP responses fail closed', async () => {
  for (const greeting of ['not SMTP\r\n', '220-first\r\n250 mixed code\r\n',
    '220 ' + 'x'.repeat(5000) + '\r\n', '220-more\r\n'.repeat(101),
    '220-' + 'x'.repeat(66000) + '\r\n']) {
    const fake = fakeSocket([], { greeting });
    await assert.rejects(sendHostingerEmail(mail, env, { connect: fake.connect }), failure);
    assert.equal(fake.writes.length, 0);
    assert.equal(fake.cancelled, 1);
  }
});

test('invalid settings and injected mail headers are rejected without connecting', async () => {
  let connects = 0;
  const connect = () => { connects++; throw new Error('Must not connect'); };
  for (const password of [undefined, '', ' ', 123, 'x\r\ny', 'x\0y', 'x'.repeat(1025)]) {
    assert.equal(smtpConfigured({ HOSTINGER_SMTP_PASSWORD: password }), false);
    await assert.rejects(sendHostingerEmail(mail, { HOSTINGER_SMTP_PASSWORD: password }, { connect }), failure);
  }
  for (const change of [{ to: 'other@example.com' }, { from: 'other@example.com' },
    { subject: 'Hi\r\nBcc: other@example.com' }, { subject: undefined },
    { replyTo: 'buyer@example.com>\r\nBcc: other@example.com' },
    { reference: 'not-a-valid-message-id' }, { text: 'x'.repeat(20001) }]) {
    await assert.rejects(sendHostingerEmail({ ...mail, ...change }, env, { connect }), failure);
  }
  assert.equal(connects, 0);
});

test('timeouts close the socket and prevent further commands', async () => {
  const steps = exchange();
  steps[2][1] = null;
  const fake = fakeSocket(steps);
  await assert.rejects(sendHostingerEmail(mail, env, { connect: fake.connect, timeoutMs: 30 }), failure);
  assert.equal(fake.writes.length, 3);
  assert.equal(fake.cancelled, 1);
  assert.ok(!fake.writes.some(line => line.startsWith('MAIL FROM')));
});

test('a connection resolving after its deadline closes without authenticating', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const fake = fakeSocket();
  await assert.rejects(sendHostingerEmail(mail, env, { connect: () => pending, timeoutMs: 10 }), failure);
  resolve(fake.socket);
  await new Promise(done => setTimeout(done, 0));
  assert.equal(fake.writes.length, 0);
  assert.equal(fake.cancelled, 1);
});

test('lost final acknowledgement is uncertain, but QUIT failure after acceptance stays successful', async () => {
  const uncertain = fakeSocket(exchange({ ack: null }));
  await assert.rejects(sendHostingerEmail(mail, env, { connect: uncertain.connect, timeoutMs: 30 }), failure);
  assert.equal(uncertain.writes.filter(line => line === 'DATA\r\n').length, 1);
  for (const quit of ['500 Closing\r\n', new Error('Lost connection'), null]) {
    const fake = fakeSocket(exchange({ quit }));
    assert.ok((await sendHostingerEmail(mail, env, { connect: fake.connect, timeoutMs: 30 })).messageId);
    assert.equal(fake.cancelled, 1);
  }
});
