import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../script.js', import.meta.url), 'utf8');
class Element {
  hidden = false;
  disabled = false;
  dataset = {};
  handlers = {};
  value = '';
  textContent = '';
  addEventListener(type, callback) { (this.handlers[type] ||= []).push(callback); }
  async emit(type) { for (const handler of this.handlers[type] || []) await handler({ preventDefault() {} }); }
  setCustomValidity(message) { this.validationMessage = message; }
  setAttribute() {}
  removeAttribute() {}
  focus() {}
  scrollIntoView() {}
}
async function harness(post = async () => Response.json({ accepted: true, reference: 'test-reference' }), available = true, staticOnly = false) {
  const nodes = Object.fromEntries(['quote-status', 'quote-handoff', 'quote-preview', 'quote-whatsapp', 'quote-send', 'email-availability', 'quote-prepare'].map(id => [id, new Element()]));
  nodes['quote-handoff'].hidden = true;
  nodes['quote-send'].disabled = true;
  const fieldset = new Element();
  const form = new Element();
  if (staticOnly) form.dataset.emailDelivery = 'disabled';
  form.elements = Object.fromEntries(Object.entries({ full_name: 'Test buyer', phone: '+91 90000 00000',
    company: '', work_email: '', requirement_type: 'cores', city: '', message: 'Synthetic test only', buyer_type: '', size_quantity: '', website: '' }).map(([key, value]) => [key, Object.assign(new Element(), { value })]));
  form.querySelector = () => fieldset;
  form.reportValidity = () => !Object.values(form.elements).some(field => field.validationMessage);
  const events = [];
  const requests = [];
  let availabilityRequests = 0;
  const document = { querySelector: selector => selector === '[data-quote-form]' ? form : null, getElementById: id => nodes[id], addEventListener() {} };
  runInNewContext(source, { document, URLSearchParams, AbortSignal, TypeError, SyntaxError,
    location: { search: '?product=cores' }, sessionStorage: { getItem() { return null; } },
    window: { skpAnalytics: { track: (...args) => events.push(args) }, addEventListener() {}, matchMedia: () => ({ matches: false }) },
    FormData: class { constructor() { return new Map(Object.entries(form.elements).map(([key, field]) => [key, field.value])); } },
    fetch: async (url, options) => {
      if (options?.method === 'POST') { requests.push(JSON.parse(options.body)); return post(); }
      availabilityRequests++;
      return Response.json({ available });
    }
  });
  await new Promise(resolve => setImmediate(resolve));
  return { form, fieldset, nodes, requests, events, availabilityRequests };
}

test('static hosting makes no email API requests and keeps WhatsApp preparation available', async () => {
  const h = await harness(undefined, true, true);
  assert.equal(h.availabilityRequests, 0);
  assert.equal(h.nodes['quote-send'].hidden, true);
  assert.equal(h.nodes['quote-send'].disabled, true);
  await h.form.emit('submit');
  assert.equal(h.requests.length, 0);
  await h.nodes['quote-prepare'].emit('click');
  assert.equal(h.nodes['quote-handoff'].hidden, false);
  assert.match(h.nodes['quote-preview'].textContent, /Synthetic test only/);
  assert.ok(!h.events.some(([name]) => name === 'generate_lead'));
});

test('form sends only on explicit submit and records a lead only after acceptance', async () => {
  let release;
  const h = await harness(() => new Promise(resolve => { release = resolve; }));
  assert.equal(h.requests.length, 0);
  const sending = h.form.emit('submit');
  assert.equal(h.fieldset.disabled, true);
  await h.form.emit('submit');
  assert.equal(h.requests.length, 1);
  assert.equal(h.events.length, 0);
  release(Response.json({ accepted: true, reference: 'test-reference' }));
  await sending;
  assert.deepEqual(h.events, [['generate_lead', 'cores']]);
  assert.match(h.nodes['quote-status'].textContent, /accepted for email delivery/);
  assert.equal(h.fieldset.disabled, false);
  assert.equal(h.form.elements.message.value, 'Synthetic test only');
  await h.form.emit('submit');
  assert.equal(h.requests.length, 1);
});

test('failed email responses preserve entries and never count a lead', async () => {
  for (const post of [async () => Response.json({ accepted: false, message: 'Please try direct contact.' }, { status: 503 }), async () => { throw new TypeError('network'); }, async () => new Response('not json')]) {
    const h = await harness(post);
    await h.form.emit('submit');
    assert.equal(h.form.elements.message.value, 'Synthetic test only');
    assert.equal(h.events.length, 0);
    assert.equal(h.nodes['quote-status'].dataset.error, 'true');
    assert.equal(h.fieldset.disabled, false);
  }
});

test('disabled email configuration and invalid phone prevent submission', async () => {
  const disabled = await harness(undefined, false);
  assert.equal(disabled.nodes['quote-send'].disabled, true);
  await disabled.form.emit('submit');
  assert.equal(disabled.requests.length, 0);
  const h = await harness();
  h.form.elements.phone.value = '123';
  await h.form.emit('submit');
  assert.equal(h.requests.length, 0);
  assert.match(h.form.elements.phone.validationMessage, /7 to 15/);
});

test('WhatsApp preparation is local and edits invalidate the handoff', async () => {
  const h = await harness();
  await h.nodes['quote-prepare'].emit('click');
  assert.equal(h.requests.length, 0);
  assert.equal(h.nodes['quote-handoff'].hidden, false);
  assert.match(h.nodes['quote-preview'].textContent, /Synthetic test only/);
  assert.deepEqual(h.events, [['enquiry_message_prepared', 'cores']]);
  h.form.elements.message.value = 'Changed requirement';
  await h.form.emit('input');
  assert.equal(h.nodes['quote-handoff'].hidden, true);
});
