import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../analytics.js', import.meta.url), 'utf8');
function harness({ host = 'shreekesharplastic.com', saved = null } = {}) {
  const scripts = [];
  const listeners = {};
  const buttons = ['reject', 'allow'].map(choice => ({ dataset: { analyticsChoice: choice },
    addEventListener(_, handler) { this.click = handler; }, focus() {} }));
  const panel = { hidden: true, querySelectorAll: () => buttons, querySelector: () => buttons[0] };
  const opener = { hidden: true, addEventListener(_, handler) { this.click = handler; }, focus() {} };
  const document = { getElementById: id => id === 'privacy-choices' ? panel : opener,
    body: { dataset: { page: 'contact.html' } }, cookie: '', referrer: 'https://example.org/?private=hidden',
    createElement: () => ({}), head: { appendChild: node => scripts.push(node) } };
  const window = { addEventListener: (event, handler) => { listeners[event] = handler; } };
  const stored = new Map(saved ? [['skp-privacy-v1', JSON.stringify(saved)]] : []);
  runInNewContext(source, { window, document, location: { hostname: host, origin: 'https://' + host, pathname: '/contact.html', search: '?phone=123' }, URL, Date,
    localStorage: { getItem: key => stored.get(key) || null, setItem: (key, value) => stored.set(key, value) } });
  return { window, scripts, panel, buttons, stored, listeners, events: () => window.dataLayer.map(entry => Array.from(entry)) };
}

test('no analytics requests or events before consent or after rejection', () => {
  const h = harness();
  assert.equal(h.panel.hidden, false);
  h.window.skpAnalytics.track('generate_lead', 'cores');
  assert.equal(h.scripts.length, 0);
  assert.equal(h.events().some(event => event[0] === 'event'), false);
  h.buttons[0].click();
  assert.equal(h.scripts.length, 0);
  assert.equal(h.panel.hidden, true);
  assert.equal(h.window['ga-disable-G-08GTRQQTFK'], true);
});

test('acceptance loads existing GA4 once with all advertising consent denied', () => {
  const h = harness();
  h.buttons[1].click();
  h.buttons[1].click();
  assert.equal(h.scripts.length, 1);
  assert.match(h.scripts[0].src, /G-08GTRQQTFK$/);
  const config = h.events().find(event => event[0] === 'config')[2];
  assert.equal(config.page_location, 'https://shreekesharplastic.com/contact.html');
  assert.equal(config.page_referrer, 'https://example.org');
  assert.equal(config.allow_google_signals, false);
  for (const event of h.events().filter(event => event[0] === 'consent')) {
    for (const key of ['ad_storage', 'ad_user_data', 'ad_personalization']) assert.equal(event[2][key], 'denied');
  }
});

test('only allowed events and product categories reach analytics, not enquiry values', () => {
  const h = harness({ saved: { analytics: true, time: Date.now() } });
  h.window.skpAnalytics.track('generate_lead', 'cores');
  h.window.skpAnalytics.track('email_click', 'qa@example.org');
  h.window.skpAnalytics.track('customer_private_text', 'cores');
  const events = h.events().filter(event => event[0] === 'event');
  assert.equal(events.length, 2);
  assert.equal(events[1][2].offering, 'general');
  assert.deepEqual(Object.keys(events[0][2]), ['offering', 'page_name', 'send_to']);
  assert.doesNotMatch(JSON.stringify(events), /qa@example|customer_private/);
});

test('withdrawal and cross-tab rejection stop future custom events', () => {
  const h = harness({ saved: { analytics: true, time: Date.now() } });
  h.buttons[0].click();
  h.window.skpAnalytics.track('generate_lead', 'cores');
  assert.equal(h.events().some(event => event[0] === 'event'), false);
  h.buttons[1].click();
  h.listeners.storage({ key: 'skp-privacy-v1', newValue: JSON.stringify({ analytics: false, time: Date.now() }) });
  assert.equal(h.window['ga-disable-G-08GTRQQTFK'], true);
});

test('local previews never load GA4 even after permission; expired consent is not reused', () => {
  const local = harness({ host: 'localhost' });
  local.buttons[1].click();
  local.window.skpAnalytics.track('generate_lead', 'cores');
  assert.equal(local.scripts.length, 0);
  assert.equal(local.events().some(event => event[0] === 'event'), false);
  const expired = harness({ saved: { analytics: true, time: 0 } });
  assert.equal(expired.scripts.length, 0);
  assert.equal(expired.panel.hidden, false);
});
