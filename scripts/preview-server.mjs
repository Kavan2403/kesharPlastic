import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from '../site/pages.mjs';
import { escape } from '../site/components.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const allowed = new Set([...pages.map(page => page.file), 'style.css', 'core-design.css', 'script.js', 'analytics.js', 'core-scene.js', 'core-geometry.mjs', 'sitemap.xml', 'robots.txt']);
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

function previewTools() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Shree Keshar Plastic / Local responsive preview</title><style>
  *{box-sizing:border-box}body{margin:0;background:#dce4eb;color:#14222e;font:15px sans-serif}header{padding:16px;background:#fff;border-bottom:1px solid #bacbd8;display:flex;gap:12px;align-items:center;flex-wrap:wrap}label{display:flex;align-items:center;gap:8px}button,select{min-height:40px;padding:8px;border:1px solid #9dafbe;border-radius:4px;background:#fff;color:#14222e}button[aria-pressed=true]{background:#14304a;color:white}main{padding:20px;overflow:auto}iframe{display:block;width:390px;height:850px;margin:auto;border:0;outline:1px solid #9dafbe;background:white}p{margin:0}a{color:#14304a}#result{padding:12px 20px;background:#edf5fa}button:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #2678b7;outline-offset:3px}
  </style></head><body><header><strong>Local responsive preview</strong><label>Page<select id="page">${pages.map(page => `<option value="${page.file}">${escape(page.label)}</option>`).join('')}</select></label><div>${[320, 360, 390, 640, 768, 900, 1024, 1280, 1440].map(width => `<button type="button" data-width="${width}" aria-pressed="${width === 390}">${width}px</button>`).join('')}</div><label><input id="nojs" type="checkbox">Disable site JavaScript</label><button id="audit" type="button">Check all pages at all widths</button><a href="/">Open website</a></header><p id="result" role="status">390px viewport. Same-origin frame; this does not emulate a physical device.</p><main><iframe id="site" title="Website preview" src="/index.html"></iframe></main><script>
  const frame = document.getElementById('site');
  const page = document.getElementById('page');
  const nojs = document.getElementById('nojs');
  const result = document.getElementById('result');
  const audit = document.getElementById('audit');
  const controls = [...document.querySelectorAll('button, select, input')];
  function load() { frame.src = '/' + page.value + (nojs.checked ? '?nojs=1' : ''); }
  page.addEventListener('change', load); nojs.addEventListener('change', load);
  document.querySelectorAll('[data-width]').forEach(button => button.addEventListener('click', () => {
    frame.style.width = button.dataset.width + 'px';
    document.querySelectorAll('[data-width]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    result.textContent = button.dataset.width + 'px viewport. Same-origin frame; not physical-device emulation.';
  }));
  audit.addEventListener('click', async () => {
    controls.forEach(control => control.disabled = true);
    const widths = [320, 390, 640, 768, 900, 1024, 1280, 1440];
    const failures = []; let count = 0;
    for (const width of widths) {
      frame.style.width = width + 'px';
      for (const option of page.options) {
        try {
          await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Page load timed out')), 10000);
            frame.onload = () => { clearTimeout(timer); resolve(); };
            frame.src = '/' + option.value + (nojs.checked ? '?nojs=1' : '');
          });
          const doc = frame.contentDocument;
          await doc.fonts.ready;
          await new Promise(resolve => frame.contentWindow.requestAnimationFrame(() => frame.contentWindow.requestAnimationFrame(resolve)));
          const main = doc.querySelector('main'); const h1 = doc.querySelector('h1');
          const style = frame.contentWindow.getComputedStyle(main);
          const badImages = [...doc.images].filter(image => image.complete && !image.naturalWidth);
          const horizontal = doc.documentElement.scrollWidth > width + 1;
          const visible = h1 && h1.getBoundingClientRect().height > 0 && main.getBoundingClientRect().height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          count++;
          if (horizontal || !visible || badImages.length) failures.push(option.value + ' @ ' + width + ': ' + JSON.stringify({horizontal, visible, badImages: badImages.map(image => image.getAttribute('src'))}));
          result.textContent = 'Checked ' + count + ' layouts (' + (nojs.checked ? 'JavaScript off' : 'JavaScript on') + ')...';
        } catch (error) { failures.push(option.value + ' @ ' + width + ': ' + error.message); }
      }
    }
    frame.onload = null;
    result.textContent = count + ' layouts checked; ' + failures.length + ' issues. ' + (nojs.checked ? 'JavaScript disabled. ' : 'JavaScript enabled. ') + failures.join(' | ');
    controls.forEach(control => control.disabled = false);
    frame.style.width = document.querySelector('[aria-pressed="true"]').dataset.width + 'px';
    load();
  });
  </script></body></html>`;
}

export const server = http.createServer(async (request, response) => {
  response.setHeader('X-Robots-Tag', 'noindex, nofollow');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (request.url?.split('?')[0] === '/api/enquiry') {
    response.writeHead(request.method === 'GET' ? 200 : 503, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ available: false, accepted: false, message: 'Local preview only. No email has been sent. Use the direct contact options.' }));
    return;
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain' });
    response.end('Preview only. Use the WhatsApp message builder or the direct contact links.');
    return;
  }
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/__preview') {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end(request.method === 'HEAD' ? '' : previewTools());
      return;
    }
    const file = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
    const asset = /^assets\/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp|svg)$/.test(file);
    if ((!allowed.has(file) && !asset) || file.split('/').includes('..')) throw new Error('Not served by preview');
    const resolved = await realpath(path.join(root, file));
    const relative = path.relative(root, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Invalid path');
    let body = await readFile(resolved);
    if (file.endsWith('.html') && url.searchParams.get('nojs') === '1') {
      body = Buffer.from(body.toString('utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''));
      // Use a response policy as well, so inline handlers cannot defeat this QA mode.
      response.setHeader('Content-Security-Policy', "script-src 'none'");
    }
    response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    response.end(request.method === 'HEAD' ? '' : body);
  } catch (_) {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html lang="en"><meta charset="utf-8"><title>Preview page not found</title><h1>Page not found in this preview</h1><p><a href="/">Return to Shree Keshar Plastic</a></p></html>');
  }
});

server.on('error', error => {
  console.error(`Could not start the local preview: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Local website: http://localhost:${port}\nResponsive checks: http://localhost:${port}/__preview\nLoopback only; no deployment or Google settings changed.`));
