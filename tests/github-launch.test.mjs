import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pages } from '../site/pages.mjs';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');

test('GitHub Pages launch keeps its domain and excludes backend and draft directories', async () => {
  assert.equal((await read('CNAME')).trim(), 'shreekesharplastic.com');
  const config = await read('_config.yml');
  assert.match(config, /include:\n  - sitemap\.xml\n/);
  for (const name of ['cloudflare', 'site', 'scripts', 'tests', 'seo-system', 'generated', 'video-campaign', 'dist', 'wrangler.jsonc']) {
    assert.ok(config.includes(`  - ${name}\n`), name);
  }
});

test('production SEO settings are not overwritten by preview noindex metadata', async () => {
  for (const page of pages.filter(page => !page.noindex)) {
    assert.match(await read(page.file), /<meta name="robots" content="index, follow">/);
  }
  assert.doesNotMatch(await read('robots.txt'), /Disallow:\s*\/$/m);
  assert.match(await read('404.html'), /name="robots" content="noindex"/);
});

test('live form and privacy copy disclose manual contact rather than working SMTP', async () => {
  const contact = await read('contact.html');
  assert.match(contact, /data-email-delivery="disabled"/);
  assert.match(contact, /id="quote-send" disabled hidden/);
  const privacy = await read('privacy.html');
  assert.match(privacy, /Direct form-to-email delivery is currently disabled/);
  assert.match(privacy, /GitHub Pages serves this public website/);
  assert.doesNotMatch(privacy, /our Cloudflare enquiry service/);
});
