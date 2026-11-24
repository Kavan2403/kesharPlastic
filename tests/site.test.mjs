import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { pages } from '../site/pages.mjs';
import { blackPipeSizes, business } from '../site/catalogue.mjs';
import { renderPage } from '../site/layout.mjs';

const root = new URL('../', import.meta.url);
const allFiles = new Set(pages.map(page => page.file));

test('owner-confirmed catalogue remains exact', () => {
  assert.deepEqual(blackPipeSizes.map(size => size.inches), [2, 3, 4, 5, 6, 8, 10]);
  for (const size of blackPipeSizes) {
    assert.equal(size.maxLength, size.inches < 5 ? '100 metres' : '20 feet');
    if (size.inches < 5) assert.equal(size.format, 'Continuous coil');
  }
  assert.equal(business.installationRadiusKm, 100);
  assert.deepEqual(business.installationScope, ['Pipe supply', 'Trenching', 'Laying', 'Jointing', 'Testing', 'Backfilling']);
});

test('page intent, title and description are unique', () => {
  assert.equal(new Set(pages.map(page => page.title)).size, pages.length);
  assert.equal(new Set(pages.map(page => page.description)).size, pages.length);
  assert.equal(new Set(pages.map(page => page.body)).size, pages.length);
  assert.equal(new Set(pages.map(page => page.body.match(/<h1>(.*?)<\/h1>/s)[1])).size, pages.length);
});

for (const page of pages) {
  test(`${page.file}: generated content, semantics, links and metadata`, async () => {
    const html = await readFile(new URL(page.file, root), 'utf8');
    assert.equal(html, renderPage(page));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /<main id="main-content"/);
    assert.match(html, /class="skip-link"/);
    assert.match(html, /name="description"/);
    assert.match(html, /rel="canonical"/);
    assert.doesNotMatch(html, /target="_black"|Blank [Pp]ipes|25%|500\+|27\+|TODO:|Verified Buyer/);
    assert.doesNotMatch(html, /pipe-story\.js|three\.module|gtag\/js/);
    for (const match of html.matchAll(/<img\b[^>]*>/g)) {
      assert.match(match[0], /alt="[^"\s][^"]*"/);
      assert.match(match[0], /width="\d+"/);
      assert.match(match[0], /height="\d+"/);
    }
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const value = match[1].replace(/&amp;/g, '&');
      if (/^(https?:|mailto:|tel:|#)/.test(value)) continue;
      const url = new URL(value, 'https://local.test/' + page.file);
      const file = url.pathname.slice(1);
      await access(new URL(file, root));
      if (file.endsWith('.html')) assert.ok(allFiles.has(file), `Unexpected page ${file}`);
      if (url.hash) {
        const destination = await readFile(new URL(file, root), 'utf8');
        assert.ok(destination.includes(`id="${url.hash.slice(1)}"`), `Missing ${value}`);
      }
    }
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.ok(data['@graph'].some(item => item['@type'] === 'Organization'));
    if (page.file !== 'index.html') assert.ok(data['@graph'].some(item => item['@type'] === 'BreadcrumbList'));
    assert.ok(!data['@graph'].some(item => ['Review', 'AggregateRating', 'Product', 'Offer'].includes(item['@type'])));
    if (page.service) assert.match(data['@graph'].find(item => item['@type'] === 'Service').areaServed.name, /100 km radius of Ahmedabad/);
  });
}

test('sitemap preserves the sixteen indexable URLs without guessed update dates', async () => {
  const xml = await readFile(new URL('sitemap.xml', root), 'utf8');
  assert.equal((xml.match(/<loc>/g) || []).length, 16);
  assert.doesNotMatch(xml, /generated\/|quality-testing|lastmod/);
  for (const page of pages.filter(page => !page.noindex)) assert.ok(xml.includes(`${business.url}/${page.file === 'index.html' ? '' : page.file}</loc>`));
});

test('email submission and optional WhatsApp handoff are explicit and safe without scripts', async () => {
  const html = await readFile(new URL('contact.html', root), 'utf8');
  const js = await readFile(new URL('script.js', root), 'utf8');
  assert.match(html, /<fieldset disabled>/);
  assert.match(html, /method="post"/);
  assert.match(html, /Send enquiry by email/);
  assert.match(html, /action="\/api\/enquiry"/);
  assert.match(html, /<noscript>/);
  assert.match(html, /pattern="\[\+0-9 \]\{7,25\}"/);
  assert.match(js, /digits\.length >= 7 && digits\.length <= 15/);
  assert.doesNotMatch(js, /form\.reset|link\.href = .*encodeURIComponent/);
  assert.match(js, /result.accepted !== true/);
  assert.match(js, /track\('generate_lead'/);
  assert.match(html, /<button[^>]*id="quote-whatsapp"[^>]*type="button"/);
  const analytics = await readFile(new URL('analytics.js', root), 'utf8');
  assert.match(analytics, /if \(!production \|\| !permitted\) return/);
  assert.match(js, /preview\.textContent = message/);
});

test('preview does not expose legacy pages or repository files', async () => {
  const source = await readFile(new URL('scripts/preview-server.mjs', root), 'utf8');
  assert.match(source, /'127\.0\.0\.1'/);
  assert.match(source, /X-Robots-Tag/);
  assert.match(source, /noindex, nofollow/);
  assert.match(source, /allowed\.has\(file\)/);
});

test('legacy generators cannot silently overwrite the preview', async () => {
  for (const file of ['seo-system/create-landing-pages.js', 'seo-system/generate-seo.js']) {
    const source = await readFile(new URL(file, root), 'utf8');
    assert.ok(source.startsWith('throw new Error('));
  }
});
