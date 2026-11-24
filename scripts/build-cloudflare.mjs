import { readFile, mkdir, copyFile, rm, realpath, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pages } from '../site/pages.mjs';
import { images, applicationImages, business } from '../site/catalogue.mjs';
import './build-site.mjs';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const output = path.join(root, 'dist');
const files = new Set([...pages.map(page => page.file), 'style.css', 'core-design.css', 'script.js', 'analytics.js',
  'core-scene.js', 'core-geometry.mjs', 'sitemap.xml', 'robots.txt', business.logo.src]);
for (const image of [...Object.values(images), ...Object.values(applicationImages)]) {
  for (const file of [image.src, image.small]) if (file?.startsWith('assets/')) files.add(file);
}
// An explicit public allowlist excludes source, secrets, old city pages and unused drafts.
for (const file of files) {
  const source = await realpath(path.join(root, file));
  if (!source.startsWith(root + path.sep)) throw new Error(`Asset outside project: ${file}`);
  await readFile(source);
}
await rm(output, { recursive: true, force: true });
for (const file of files) {
  const destination = path.join(output, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(path.join(root, file), destination);
}
await writeFile(path.join(output, '404.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Shree Keshar Plastic</title><link rel="stylesheet" href="/style.css"><main class="container section"><h1>Page not found</h1><p>This address is not available. Explore our products or contact us about your requirement.</p><div class="cta-row"><a class="btn btn-primary" href="/">Home</a><a class="btn btn-outline" href="/contact.html">Contact us</a></div></main></html>');
console.log(`Cloudflare public build: ${files.size + 1} files in dist/. No upload or DNS change performed.`);
