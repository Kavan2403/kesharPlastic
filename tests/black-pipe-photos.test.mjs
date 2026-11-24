import test from 'node:test';
import assert from 'node:assert/strict';
import { stat, readFile } from 'node:fs/promises';
import { images, products } from '../site/catalogue.mjs';
import { pages } from '../site/pages.mjs';
import { media, picture } from '../site/components.mjs';

const root = new URL('../', import.meta.url);

test('owner-supplied roll photos are classified only as manufactured black pipes', () => {
  assert.equal(products.find(product => product.id === 'black').image, 'blackRoll');
  for (const key of ['blackRoll', 'blackRolls']) {
    assert.match(images[key].caption, /manufactured by Shree Keshar Plastic/);
    assert.match(images[key].caption, /Colour-corrected photograph/);
    assert.equal(images[key].width / images[key].height, 3 / 4);
    assert.doesNotMatch(images[key].caption + images[key].alt, /HDPE|PVC|AI-generated|inch|100 m/);
  }
  for (const file of ['pvc-pipes-ahmedabad.html', 'hdpe-pipes-ahmedabad.html']) {
    assert.doesNotMatch(pages.find(page => page.file === file).body, /assets\/black-pipe-rolls\//);
  }
});

test('roll images use accurate responsive widths and eager loading only when requested', async () => {
  for (const key of ['blackRoll', 'blackRolls']) {
    const image = images[key];
    assert.match(picture(key), /600\.jpg 600w, [^"]+\.jpg 1086w/);
    assert.match(picture(key), /width="1086" height="1448" loading="lazy"/);
    assert.match(picture(key, true), /loading="eager" decoding="async" fetchpriority="high"/);
    assert.match(media(key), /class="proof-media\s+portrait"/);
    for (const file of [image.src, image.small]) assert.ok((await stat(new URL(file, root))).size > 0);
  }
  assert.match(picture('black'), /700w, [^"]+ 1400w/);
});

test('black pipe photos retain distinct placements after the core-led redesign', () => {
  const black = pages.find(page => page.file === 'black-pipes-manufacturer.html');
  const gallery = pages.find(page => page.file === 'gallery.html');
  const about = pages.find(page => page.file === 'about.html');
  assert.ok(black.body.includes(images.blackRoll.src));
  assert.ok(gallery.body.includes(images.blackRolls.src));
  assert.ok(about.body.includes(images.black.src));
});

test('portrait photography is contained rather than cropped', async () => {
  const css = await readFile(new URL('style.css', root), 'utf8');
  assert.match(css, /\.media-frame img\s*\{[^}]*object-fit: contain/);
  assert.match(css, /\.card-media img\s*\{[^}]*object-fit: contain/);
  assert.match(css, /\.proof-media\.portrait \.media-frame\s*\{\s*aspect-ratio: 3 \/ 4/);
});
