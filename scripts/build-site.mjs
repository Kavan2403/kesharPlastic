import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pages } from '../site/pages.mjs';
import { renderPage } from '../site/layout.mjs';
import { business } from '../site/catalogue.mjs';

const root = new URL('../', import.meta.url);
const check = process.argv.includes('--check');
let stale = 0;
for (const page of pages) {
  const output = renderPage(page);
  const target = new URL(page.file, root);
  if (check) {
    if (await readFile(target, 'utf8').catch(() => '') !== output) {
      console.error(`Out of date: ${page.file}`);
      stale++;
    }
  } else {
    await writeFile(target, output);
  }
}
// Omit lastmod until publication rather than reporting a preview date as a live update.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter(page => !page.noindex).map(page => `  <url><loc>${business.url}/${page.file === 'index.html' ? '' : page.file}</loc></url>`).join('\n')}
</urlset>
`;
const target = new URL('sitemap.xml', root);
if (check) {
  if (await readFile(target, 'utf8') !== sitemap) { console.error('Out of date: sitemap.xml'); stale++; }
  process.exitCode = stale ? 1 : 0;
  console.log(stale ? `${stale} generated files need rebuilding.` : 'Generated pages and sitemap are up to date.');
} else {
  await writeFile(target, sitemap);
  console.log(`Built ${pages.length} static pages in ${fileURLToPath(root)}. No deployment performed.`);
}
