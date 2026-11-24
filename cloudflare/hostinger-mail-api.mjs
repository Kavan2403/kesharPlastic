const MAIL_API_ORIGIN = 'https://api.mail.hostinger.com';
const API_MAILBOX = 'info@shreekesharplastic.com';

export function mailApiConfigured(env) {
  return typeof env.HOSTINGER_MAIL_API_TOKEN === 'string'
    && /^[\x21-\x7e]{16,4096}$/.test(env.HOSTINGER_MAIL_API_TOKEN)
    && typeof env.HOSTINGER_MAILBOX_ID === 'string'
    && /^AC[a-zA-Z0-9]{10,64}$/.test(env.HOSTINGER_MAILBOX_ID);
}

export async function sendHostingerApiEmail(mail, env, { fetchMail = fetch, timeoutMs = 12000 } = {}) {
  const fail = code => new Error('Email acceptance could not be confirmed.', { cause: { supportCode: code } });
  if (!mailApiConfigured(env)) throw fail('MAIL_API_CONFIG');
  if (!mail || mail.from !== API_MAILBOX || mail.to !== API_MAILBOX
    || typeof mail.subject !== 'string' || !/^[\x20-\x7e]{1,120}$/.test(mail.subject)
    || typeof mail.reference !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(mail.reference)
    || typeof mail.text !== 'string' || new TextEncoder().encode(mail.text).length > 20000) {
    throw fail('MAIL_API_INPUT');
  }
  let response;
  try {
    // Never forward this credential on redirects or retry an uncertain send.
    response = await fetchMail(`${MAIL_API_ORIGIN}/api/v1/mailboxes/${env.HOSTINGER_MAILBOX_ID}/send`, {
      method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(timeoutMs),
      headers: { Authorization: `Bearer ${env.HOSTINGER_MAIL_API_TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ to: [API_MAILBOX], displayName: 'Shree Keshar Plastic Website',
        subject: mail.subject, text: mail.text })
    });
  } catch (error) {
    throw fail(error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 'MAIL_API_TIMEOUT' : 'MAIL_API_CONNECTION');
  }
  // Hostinger v1.4.0 documents 204 as queue acceptance, not inbox delivery.
  // Reply-To is not part of its send contract; the buyer's email is in the body.
  if (response.status === 204) return { accepted: true };
  try { await response.body?.cancel(); } catch { /* Provider details are not logged or returned. */ }
  throw fail([401, 403, 422, 429, 500, 502, 504].includes(response.status)
    ? `MAIL_API_HTTP_${response.status}` : 'MAIL_API_UNCONFIRMED');
}
