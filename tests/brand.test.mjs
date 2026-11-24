import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { business } from '../site/catalogue.mjs';
import { pages } from '../site/pages.mjs';
import { renderPage } from '../site/layout.mjs';

test('official logo is the unchanged owner-provided PNG', async () => {
  const bytes = await readFile(new URL('../' + business.logo.src, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '631f6f28e4446a3a75670c6e315e62680a38e568c90ed65c907f7c4ac9237993');
  assert.equal(bytes.readUInt32BE(16), business.logo.width);
  assert.equal(bytes.readUInt32BE(20), business.logo.height);
});

test('all published page templates use the official logo in both navigation and footer', () => {
  for (const page of pages) {
    const html = renderPage(page);
    const logoImages = [...html.matchAll(/<img[^>]+src="assets\/brand\/shree-keshar-plastic-logo.png"[^>]*>/g)];
    assert.equal(logoImages.length, 2, page.file);
    for (const [match] of logoImages) assert.match(match, /alt="Shree Keshar Plastic"/);
    assert.match(html, /<link rel="icon" href="assets\/brand\/shree-keshar-plastic-logo.png" type="image\/png">/);
    assert.match(html, /<link rel="apple-touch-icon" href="assets\/brand\/shree-keshar-plastic-logo.png">/);
    assert.doesNotMatch(html, /brand-mark|brand-copy|favicon\.svg/);
  }
});

test('organization and local-business markup identify the same official logo', () => {
  for (const page of pages) {
    const html = renderPage(page);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    for (const type of ['Organization', 'LocalBusiness']) {
      const logo = schema['@graph'].find(item => item['@type'] === type).logo;
      assert.equal(logo['@type'], 'ImageObject');
      assert.equal(logo.url, business.url + '/' + business.logo.src);
      assert.equal(logo.width, 1254);
      assert.equal(logo.height, 1254);
    }
  }
});
