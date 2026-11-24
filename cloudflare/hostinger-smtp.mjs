export const MAILBOX = 'info@shreekesharplastic.com';
const DOMAIN = 'shreekesharplastic.com';
const encoder = new TextEncoder();
const FAILURE = 'Email acceptance could not be confirmed.';

export function smtpConfigured(env) {
  const password = env.HOSTINGER_SMTP_PASSWORD;
  return typeof password === 'string' && password.trim().length > 0
    && encoder.encode(password).length <= 1024 && !/[\r\n\0]/.test(password);
}

function base64(text) {
  let binary = '';
  for (const byte of encoder.encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function messageText(mail) {
  if (!mail || mail.from !== MAILBOX || mail.to !== MAILBOX
    || typeof mail.subject !== 'string' || !/^[\x20-\x7e]{1,120}$/.test(mail.subject)
    || typeof mail.reference !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(mail.reference)
    || typeof mail.text !== 'string' || encoder.encode(mail.text).length > 20000) {
    throw new Error(FAILURE);
  }
  if (mail.replyTo && (typeof mail.replyTo !== 'string' || mail.replyTo.length > 254
    || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(mail.replyTo))) {
    throw new Error(FAILURE);
  }
  const headers = [
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${mail.reference}@${DOMAIN}>`,
    `From: Shree Keshar Plastic Website <${MAILBOX}>`,
    `To: <${MAILBOX}>`,
    `Subject: ${mail.subject}`,
    ...(mail.replyTo ? [`Reply-To: <${mail.replyTo}>`] : []),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64'
  ];
  // Base64 protects the SMTP DATA terminator and preserves multilingual enquiries.
  const body = base64(mail.text.replace(/\r\n|\r|\n/g, '\r\n')).match(/.{1,76}/g)?.join('\r\n') || '';
  return headers.join('\r\n') + '\r\n\r\n' + body + '\r\n.\r\n';
}

async function platformConnect(address, options) {
  // Load the platform API only in the sending path; Node tests use fake sockets.
  const { connect } = await import('cloudflare:sockets');
  return connect(address, options);
}

export async function sendHostingerEmail(mail, env, { connect = platformConnect, timeoutMs = 15000 } = {}) {
  if (!smtpConfigured(env)) throw new Error(FAILURE);
  const message = messageText(mail);
  let socket, timer;
  /** @type {ReadableStreamDefaultReader<Uint8Array> | undefined} */
  let reader;
  /** @type {WritableStreamDefaultWriter<Uint8Array> | undefined} */
  let writer;
  let stopped = false, accepted = false;
  let phase = 'connect';
  let lastReply = 0;
  let pending = '', receivedBytes = 0;
  const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: false });

  function close() {
    if (socket) {
      try { Promise.resolve(socket.close()).catch(() => {}); } catch { /* Already closed. */ }
    }
  }

  function active() {
    if (stopped) throw new Error(FAILURE);
  }

  async function line() {
    while (true) {
      active();
      const end = pending.indexOf('\r\n');
      if (end !== -1) {
        if (end > 4096) throw new Error(FAILURE);
        const result = pending.slice(0, end);
        pending = pending.slice(end + 2);
        return result;
      }
      if (pending.length > 4096) throw new Error(FAILURE);
      const { value, done } = await reader.read();
      if (done) throw new Error(FAILURE);
      receivedBytes += value.byteLength;
      if (receivedBytes > 65536) throw new Error(FAILURE);
      pending += decoder.decode(value, { stream: true });
    }
  }

  async function reply(expected) {
    let code;
    const lines = [];
    for (let count = 0; count < 100; count++) {
      const match = /^(\d{3})(?:([ -])(.*))?$/.exec(await line());
      if (!match || (code && code !== Number(match[1]))) throw new Error(FAILURE);
      code = Number(match[1]);
      lastReply = code;
      lines.push(match[3] || '');
      if (match[2] !== '-') {
        if (!expected.includes(code)) throw new Error(FAILURE);
        return { code, lines };
      }
    }
    throw new Error(FAILURE);
  }

  async function write(text) {
    active();
    await writer.write(encoder.encode(text));
  }

  async function command(text, expected) {
    await write(text + '\r\n');
    return reply(expected);
  }

  async function session() {
    socket = await connect({ hostname: 'smtp.hostinger.com', port: 465 }, { secureTransport: 'on', allowHalfOpen: false });
    socket.closed.catch(() => {});
    socket.opened.catch(() => {});
    // A connector resolving after the deadline must never authenticate or send.
    if (stopped) { close(); throw new Error(FAILURE); }
    await socket.opened;
    active();
    reader = socket.readable.getReader();
    writer = socket.writable.getWriter();
    phase = 'greeting';
    await reply([220]);
    phase = 'ehlo';
    const hello = await command(`EHLO ${DOMAIN}`, [250]);
    const mechanisms = new Set(hello.lines.slice(1).flatMap(value => {
      const auth = /^AUTH(?:=|\s+)(.*)$/i.exec(value);
      return auth ? auth[1].toUpperCase().split(/\s+/) : [];
    }));
    phase = 'authentication';
    if (mechanisms.has('PLAIN')) {
      const credentials = base64(`\0${MAILBOX}\0${env.HOSTINGER_SMTP_PASSWORD}`);
      // Challenge form keeps the AUTH command within SMTP's line-length limit.
      await command('AUTH PLAIN', [334]);
      await command(credentials, [235]);
    } else if (mechanisms.has('LOGIN')) {
      await command('AUTH LOGIN', [334]);
      await command(base64(MAILBOX), [334]);
      await command(base64(env.HOSTINGER_SMTP_PASSWORD), [235]);
    } else {
      throw new Error(FAILURE);
    }
    phase = 'sender';
    await command(`MAIL FROM:<${MAILBOX}>`, [250]);
    phase = 'recipient';
    await command(`RCPT TO:<${MAILBOX}>`, [250, 251]);
    phase = 'data';
    await command('DATA', [354]);
    phase = 'acceptance';
    await write(message);
    await reply([250]);
    accepted = true;
    // QUIT failure cannot undo the server's explicit acceptance of DATA.
    await command('QUIT', [221]);
  }

  try {
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => { stopped = true; close(); reject(new Error(FAILURE)); }, timeoutMs);
    });
    await Promise.race([session(), deadline]);
  } catch (error) {
    // Never expose server replies, passwords, authentication payloads or form data.
    if (!accepted) {
      const supportCode = `SMTP_${phase.toUpperCase()}_${lastReply || 0}`;
      // Classify known runtime failures without returning their arbitrary text.
      const text = error instanceof Error ? error.message : '';
      const reason = /no such module|cannot find module|unknown module/i.test(text) ? 'MODULE'
        : /proxy request failed|cannot connect to the specified address/i.test(text) ? 'CONNECTION'
        : /certificate|tls|ssl/i.test(text) ? 'TLS' : stopped ? 'TIMEOUT' : 'FAILED';
      throw new Error(FAILURE, { cause: { supportCode: `${supportCode}_${reason}` } });
    }
  } finally {
    clearTimeout(timer);
    stopped = true;
    close();
    try { reader?.releaseLock(); } catch { /* A pending read is being cancelled. */ }
    try { writer?.releaseLock(); } catch { /* A pending write is being cancelled. */ }
  }
  return { messageId: `<${mail.reference}@${DOMAIN}>` };
}
