import { MAILBOX as EMAIL, sendHostingerEmail, smtpConfigured } from './hostinger-smtp.mjs';
import { mailApiConfigured, sendHostingerApiEmail } from './hostinger-mail-api.mjs';

const ORIGIN = 'https://shreekesharplastic.com';
const MAX_BYTES = 16384;
const labels = {
  cores: 'Plastic Replacement Cores', black: 'Black Pipes', pvc: 'PVC Pipes',
  hdpe: 'HDPE Pipes', installation: 'Farm pipeline installation', guidance: 'Product guidance'
};
const limits = { full_name: 100, phone: 25, company: 160, work_email: 254, city: 150,
  requirement_type: 20, buyer_type: 80, size_quantity: 180, message: 2000, website: 200 };

function json(status, body, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex', ...extra
  } });
}

function failure(status, message, extra) {
  return json(status, { accepted: false, message }, extra);
}

export function emailReady(env) {
  const configured = env.EMAIL_TRANSPORT === 'hostinger-api' ? mailApiConfigured(env)
    : (!env.EMAIL_TRANSPORT || env.EMAIL_TRANSPORT === 'hostinger-smtp') && smtpConfigured(env);
  return env.EMAIL_ENABLED === 'true' && configured
    && typeof env.ENQUIRY_RATE_LIMIT?.limit === 'function'
    && typeof env.ENQUIRY_TOTAL_LIMIT?.limit === 'function';
}

export function validateEnquiry(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid form.');
  const data = {};
  for (const [key, max] of Object.entries(limits)) {
    const value = input[key] ?? '';
    if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new Error('Check your form fields and their length.');
    data[key] = value.trim();
  }
  const digits = data.phone.replace(/\D/g, '');
  if (!data.full_name || !data.message || !Object.hasOwn(labels, data.requirement_type)) throw new Error('Enter your name, product or service, and requirement.');
  if (!/^\+?[0-9 ]+$/.test(data.phone) || digits.length < 7 || digits.length > 15) throw new Error('Enter a phone number with 7 to 15 digits.');
  if (data.work_email && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(data.work_email)) throw new Error('Check your work email address.');
  if (data.website) throw new Error('Unable to accept this form. Please contact us directly.');
  return data;
}

async function boundedJson(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BYTES) throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) { await reader.cancel(); throw new RangeError(); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes));
}

export async function handleEnquiry(request, env, sendMail) {
  const url = new URL(request.url);
  const allowed = url.origin === ORIGIN || (env.STAGING_ORIGIN && url.origin === env.STAGING_ORIGIN);
  const origin = request.headers.get('Origin');
  const permittedOrigin = origin === ORIGIN || Boolean(env.STAGING_ORIGIN && origin === env.STAGING_ORIGIN);
  const cors = { Vary: 'Origin' };
  if (allowed && permittedOrigin) cors['Access-Control-Allow-Origin'] = origin;
  let response;
  if (request.method === 'OPTIONS') {
    const headers = (request.headers.get('Access-Control-Request-Headers') || '').toLowerCase().split(',').map(value => value.trim()).filter(Boolean);
    response = allowed && permittedOrigin && request.headers.get('Access-Control-Request-Method') === 'POST'
      && headers.every(value => value === 'content-type')
      ? new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600', 'Cache-Control': 'no-store' } })
      : failure(403, 'Please submit the form from our website.');
  } else if (origin && !permittedOrigin) {
    response = failure(403, 'Please submit the form from our website.');
  } else if (request.method === 'GET') {
    response = json(200, { available: Boolean(allowed && emailReady(env)) });
  } else if (request.method !== 'POST') {
    response = failure(405, 'Use the enquiry form to send a message.', { Allow: 'GET, POST, OPTIONS' });
  } else if (!allowed || !permittedOrigin) {
    response = failure(403, 'Please submit the form from our website.');
  } else {
    response = await submitEnquiry(request, env, sendMail || (env.EMAIL_TRANSPORT === 'hostinger-api' ? sendHostingerApiEmail : sendHostingerEmail));
  }
  for (const [key, value] of Object.entries(cors)) response.headers.set(key, value);
  return response;
}

async function submitEnquiry(request, env, sendMail) {
  if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return failure(415, 'The form must be sent as JSON.');
  if (!emailReady(env)) return failure(503, 'Online email delivery is not enabled yet. Please use WhatsApp, call, or email us directly.');
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return failure(503, 'Unable to verify this request. Please contact us directly.');
  try {
    // Native limits are approximate per Cloudflare location, not a global spending cap.
    const individual = await env.ENQUIRY_RATE_LIMIT.limit({ key: ip });
    const total = await env.ENQUIRY_TOTAL_LIMIT.limit({ key: 'website-enquiries' });
    if (!individual.success || !total.success) return failure(429, 'Too many attempts. Please wait a minute or contact us directly.', { 'Retry-After': '60' });
  } catch { return failure(503, 'The enquiry service is temporarily unavailable. Please contact us directly.'); }
  let data;
  try { data = validateEnquiry(await boundedJson(request)); }
  catch (error) {
    if (error instanceof RangeError) return failure(413, 'Your enquiry is too long. Please shorten the message.');
    return failure(400, error instanceof SyntaxError || error instanceof TypeError ? 'Unable to read the form. Please check the details.' : error.message);
  }
  const reference = crypto.randomUUID();
  const lines = [`Website enquiry: ${reference}`, `Received: ${new Date().toISOString()}`, ''];
  for (const [key, label] of Object.entries({ full_name: 'Name', phone: 'Phone', company: 'Company',
    work_email: 'Work email', requirement_type: 'Product / service', city: 'Location',
    buyer_type: 'Buyer type', size_quantity: 'Size / quantity', message: 'Requirement' })) {
    if (data[key]) lines.push(`${label}: ${key === 'requirement_type' ? labels[data[key]] : data[key]}`);
  }
  try {
    // No auto-retry: a lost response can mean the provider already accepted the email.
    const result = await sendMail({ from: EMAIL, to: EMAIL, reference,
      subject: `Website enquiry / ${labels[data.requirement_type]}`,
      text: lines.join('\n'), ...(data.work_email ? { replyTo: data.work_email } : {}) }, env);
    if (result?.accepted !== true && !result?.messageId) throw new Error('NO_ACK');
    return json(200, { accepted: true, reference });
  } catch (error) {
    // Never return provider errors or log names, contact details, message bodies or tokens.
    const candidate = error instanceof Error && error.cause && typeof error.cause === 'object' && 'supportCode' in error.cause
      ? error.cause.supportCode : '';
    const supportCode = typeof candidate === 'string' && /^(SMTP_(CONNECT|GREETING|EHLO|AUTHENTICATION|SENDER|RECIPIENT|DATA|ACCEPTANCE)_\d{1,3}_(MODULE|CONNECTION|TLS|TIMEOUT|FAILED)|MAIL_API_(CONFIG|INPUT|TIMEOUT|CONNECTION|UNCONFIRMED|HTTP_(401|403|422|429|500|502|504)))$/.test(candidate)
      ? candidate : 'EMAIL_UNCONFIRMED';
    return failure(502, `We could not confirm email acceptance. Your details are still here. Please contact us before resending to avoid a duplicate. Support code: ${supportCode}.`);
  }
}
