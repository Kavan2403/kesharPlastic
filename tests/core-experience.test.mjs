import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { createTube, rotationMatrix, perspective, orbitDrag, clamp } from '../core-geometry.mjs';
import { applicationImages } from '../site/catalogue.mjs';
import { pages } from '../site/pages.mjs';
import { renderPage } from '../site/layout.mjs';

test('hollow tube has finite vertices, unit normals and separate inner and outer surfaces', () => {
  const mesh = createTube({ length: 4, outer: 1, inner: .6, segments: 48 });
  assert.equal(mesh.length, 48 * 4 * 6 * 6);
  for (let i = 0; i < mesh.length; i += 6) {
    const [x, y, z, nx, ny, nz] = mesh.slice(i, i + 6);
    assert.ok([x, y, z, nx, ny, nz].every(Number.isFinite));
    assert.ok(Math.abs(Math.hypot(nx, ny, nz) - 1) < .00001);
    assert.ok(Math.abs(x) <= 2);
    const radius = Math.hypot(y, z);
    assert.ok(Math.abs(radius - 1) < .00001 || Math.abs(radius - .6) < .00001);
  }
  for (const options of [{ inner: 2 }, { length: 0 }, { segments: 2 }, { segments: 3.5 }]) assert.throws(() => createTube(options), RangeError);
});

test('camera matrices remain finite at mobile and desktop aspect ratios', () => {
  for (const aspect of [.5, 1, 1.5, 2]) assert.ok([...perspective(aspect)].every(Number.isFinite));
  const identity = rotationMatrix(0, 0);
  for (let i = 0; i < 16; i++) assert.equal(Math.abs(identity[i]), i % 5 === 0 ? 1 : 0);
  for (const angle of [0, .45, 1.5, 3]) {
    const m = rotationMatrix(angle, .3);
    for (const offset of [0, 4, 8]) assert.ok(Math.abs(Math.hypot(m[offset], m[offset + 1], m[offset + 2]) - 1) < .00001);
  }
  assert.equal(clamp(-3), 0);
  assert.equal(clamp(3), 1);
});

test('manual orbit supports repeated 360 degree turns and both viewing axes without a stop', () => {
  const initial = { x: .2, y: .62, z: .45 };
  const turn = orbitDrag(initial, 600, 0, 600, 400);
  assert.ok(Math.abs(turn.y - initial.y - Math.PI * 2) < 1e-10);
  const manyTurns = orbitDrag(initial, 600 * (3360 / 360), 400, 600, 400);
  assert.ok(Math.abs((manyTurns.y - initial.y) * 180 / Math.PI - 3360) < 1e-9);
  assert.ok(Math.abs(manyTurns.x - initial.x - Math.PI * 2) < 1e-10);
  const m1 = rotationMatrix(initial.y, initial.z, initial.x);
  const m2 = rotationMatrix(turn.y, turn.z, turn.x + Math.PI * 2);
  assert.ok([...m1].every((v, i) => Math.abs(v - m2[i]) < 1e-6));
  const reversed = orbitDrag(turn, -600, 0, 600, 400);
  for (const key of ['x', 'y', 'z']) assert.ok(Math.abs(reversed[key] - initial[key]) < 1e-10);
  for (const x of [-10, -.9, 0, 4, 60]) {
    const m = rotationMatrix(3.9, .45, x);
    for (const offset of [0, 4, 8]) assert.ok(Math.abs(Math.hypot(m[offset], m[offset + 1], m[offset + 2]) - 1) < .00001);
  }
});

test('application cards lead with insulators and use four distinct responsive concept images', async () => {
  for (const file of ['index.html', 'paper-tube-replacement-pipes.html', 'industries-served.html']) {
    const { body } = pages.find(page => page.file === file);
    const cards = [...body.matchAll(/<article class="application-card"[^]*?<\/article>/g)].map(match => match[0]);
    assert.equal(cards.length, 4);
    assert.match(cards[0], /Insulator manufacturers/);
    assert.match(cards[1], /Tarpaulin manufacturers/);
    assert.match(cards[2], /Woven-sack manufacturers/);
    assert.match(cards[3], /Textile &amp; fabric businesses|Textile & fabric businesses/);
    assert.equal(new Set(cards.map(card => /src="([^"]+)"/.exec(card)[1])).size, 4);
    for (const card of cards) {
      assert.match(card, /srcset="[^"]+600w, [^"]+1200w"/);
      assert.match(card, /width="1200" height="800"/);
      assert.match(card, /alt="Concept illustration/);
      assert.match(card, /loading="lazy" decoding="async"/);
    }
    assert.match(body, /AI-generated application illustrations, not customer or project photographs/);
  }
  for (const image of Object.values(applicationImages)) {
    for (const file of [image.src, image.small]) {
      assert.ok((await readFile(new URL('../' + file, import.meta.url))).length > 1000);
      assert.ok((await readFile(new URL('../dist/' + file, import.meta.url))).length > 1000);
    }
  }
});

test('white branding and accessible rotation controls are available with a branded static fallback', async () => {
  const js = await readFile(new URL('../core-scene.js', import.meta.url), 'utf8');
  const svg = await readFile(new URL('../assets/core-study.svg', import.meta.url), 'utf8');
  const css = await readFile(new URL('../core-design.css', import.meta.url), 'utf8');
  assert.match(js, /label.fillStyle = '#fff'/);
  assert.match(js, /fillText\('SHREE KESHAR PLASTIC'/);
  assert.match(js, /texture2D\(u_label, uv\)/);
  assert.match(svg, /fill="#fff"[^>]+>SHREE KESHAR PLASTIC<\/text>/);
  assert.match(js, /pointerdown/);
  assert.match(js, /pointercancel/);
  assert.match(js, /setPointerCapture/);
  assert.match(js, /ArrowLeft/);
  assert.match(css, /touch-action: pan-y pinch-zoom/);
  for (const file of ['index.html', 'paper-tube-replacement-pipes.html']) {
    const { body } = pages.find(page => page.file === file);
    for (const direction of ['left', 'right', 'up', 'down']) assert.match(body, new RegExp(`data-core-rotate="${direction}"`));
    assert.match(body, /360&#176; view/);
    assert.match(body, /data-core-status role="status" aria-live="polite"/);
  }
});

test('core-led pages have commercial content outside the 3D canvas', () => {
  for (const file of ['index.html', 'paper-tube-replacement-pipes.html']) {
    const page = pages.find(page => page.file === file);
    assert.match(page.body, /<h1>[^]*[Cc]ore/);
    assert.match(page.body, /assets\/core-study.svg/);
    assert.match(page.body, /scene-controls" hidden/);
    assert.match(page.body, /Not to scale/);
    assert.match(page.body, /contact.html\?product=cores#quote-form/);
    assert.match(renderPage(page), /type="module" src="core-scene.js"/);
  }
});

test('insulator messaging is packaging-specific, without electrical performance claims', () => {
  const core = pages.find(page => page.file === 'paper-tube-replacement-pipes.html');
  assert.match(core.body, /protective packaging|protective.*packaging/i);
  assert.match(core.body, /not an electrical insulator/);
  assert.match(core.body, /cushioning/);
  assert.match(core.body, /id="insulator-packaging"/);
  assert.match(core.body, /id="woven-sacks"/);
  assert.doesNotMatch(core.body, /certified|25% buy/i);
  assert.match(core.body, /not an electrical insulator or a guaranteed protection system/);
});

test('core-led pages use a raster social card with descriptive metadata', () => {
  for (const file of ['index.html', 'paper-tube-replacement-pipes.html', 'industries-served.html']) {
    const html = renderPage(pages.find(page => page.file === file));
    assert.match(html, /property="og:image" content="https:\/\/shreekesharplastic.com\/assets\/core-share.jpg"/);
    assert.match(html, /property="og:image:width" content="1440"/);
    assert.match(html, /name="twitter:image:alt"/);
  }
});

test('renderer falls back safely when WebGL is unavailable', async () => {
  const source = (await readFile(new URL('../core-scene.js', import.meta.url), 'utf8')).replace(/^import[^\n]*\n/, '');
  const controls = { hidden: true };
  const figure = { querySelector: selector => selector === 'canvas' ? { getContext: () => null } : selector === '.scene-controls' ? controls : {}, querySelectorAll: () => [], closest: () => null, dataset: {} };
  runInNewContext(source, { matchMedia: () => ({ matches: false }), document: { querySelectorAll: () => [figure] } });
  assert.equal(controls.hidden, true);
  assert.equal(figure.dataset.rendered, undefined);
});

test('renderer respects motion preference and avoids animation or resource dependencies', async () => {
  const js = await readFile(new URL('../core-scene.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../core-design.css', import.meta.url), 'utf8');
  assert.match(js, /prefers-reduced-motion: reduce/);
  assert.match(js, /document.hidden/);
  assert.match(js, /webglcontextlost/);
  assert.match(js, /data-core-pause/);
  assert.match(js, /preserveDrawingBuffer: true/);
  // WebKit requires the shared uniform precision to match at program link time.
  assert.equal((js.match(/precision mediump float;/g) || []).length, 2);
  assert.doesNotMatch(js, /https?:\/\/|setInterval|three|gsap|fetch\(/i);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('business enquiry retains optional company, work email and WhatsApp fallback', async () => {
  const html = renderPage(pages.find(page => page.file === 'contact.html'));
  assert.match(html, /name="company" autocomplete="organization"/);
  assert.match(html, /name="work_email" type="email"/);
  assert.match(html, /Prepare WhatsApp message/);
  assert.match(html, /Send enquiry by email/);
  const js = await readFile(new URL('../script.js', import.meta.url), 'utf8');
  const tracker = js.slice(js.indexOf('function track('), js.indexOf('function reducedMotion'));
  assert.doesNotMatch(tracker, /company|work_email|full_name|message:/);
});
