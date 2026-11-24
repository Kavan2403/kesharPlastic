import { handleEnquiry } from './enquiry.mjs';

const production = new Set(['shreekesharplastic.com', 'www.shreekesharplastic.com']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/enquiry') return handleEnquiry(request, env);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    if (url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    if (production.has(url.hostname) && (url.hostname.startsWith('www.') || url.pathname === '/index.html')) {
      url.hostname = 'shreekesharplastic.com';
      url.protocol = 'https:';
      if (url.pathname === '/index.html') url.pathname = '/';
      return Response.redirect(url.href, 301);
    }
    if (url.pathname === '/') url.pathname = '/index.html';
    let asset = await env.ASSETS.fetch(new Request(url, request));
    if (asset.status === 404) {
      const missing = await env.ASSETS.fetch(new Request(new URL('/404.html', url), request));
      if (missing.ok) asset = new Response(missing.body, { status: 404, headers: missing.headers });
    }
    const response = new Response(asset.body, asset);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    if (!production.has(url.hostname)) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    if (response.headers.get('Content-Type')?.includes('text/html')) response.headers.set('Cache-Control', 'no-cache');
    return response;
  }
};
