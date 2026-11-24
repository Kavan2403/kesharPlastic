import { business, blackPipeSizes, images, products } from './catalogue.mjs';

export function escape(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

export function quoteUrl(type = '') {
  return `contact.html${type ? `?product=${encodeURIComponent(type)}` : ''}#quote-form`;
}

export function actions(type = '', primary = 'Get a quote') {
  const name = products.find(product => product.id === type)?.name || (type === 'installation' ? 'farm pipeline installation within 100 km of Ahmedabad' : 'a pipe, core or installation requirement');
  const message = encodeURIComponent(`Hello Shree Keshar Plastic, I would like to discuss ${name}.`);
  return `<div class="cta-row">
    <a class="btn btn-primary" href="${quoteUrl(type)}">${escape(primary)}</a>
    <a class="btn btn-whatsapp" href="https://wa.me/${business.whatsapp}?text=${message}" target="_blank" rel="noopener" data-offering="${escape(type)}">WhatsApp</a>
    <a class="btn btn-outline" href="tel:${business.phone}" data-offering="${escape(type)}">Call now</a>
  </div>`;
}

export function picture(key, eager = false) {
  const data = images[key];
  const sizes = data.portrait ? '(min-width: 900px) 323px, (min-width: 640px) 270px, 225px' : '(min-width: 900px) 520px, (min-width: 640px) 600px, 100vw';
  return `<img src="${data.src}"${data.small ? ` srcset="${data.small} ${data.smallWidth || 700}w, ${data.src} ${data.width}w" sizes="${sizes}"` : ''} alt="${escape(data.alt)}" width="${data.width}" height="${data.height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;
}

export function media(key, eager = false) {
  const data = images[key];
  return `<figure class="proof-media ${key === 'core' ? 'illustration' : ''}${data.portrait ? ' portrait' : ''}">
    <div class="media-frame contain">${picture(key, eager)}</div>
    <figcaption>${escape(data.caption)}${data.video ? ` <a href="${data.video}" target="_blank" rel="noopener">Watch on YouTube</a>` : ''}</figcaption>
  </figure>`;
}

export function supplyTile() {
  return `<div class="supply-tile" role="img" aria-label="HDPE supply enquiry: specify size, class and quantity">
    <span class="pipe-symbol" aria-hidden="true"><i></i><i></i><i></i></span>
    <strong>HDPE supply</strong><span>Size / Class / Quantity</span>
    <small>Supplied to your requirement</small>
  </div>`;
}

export function hero({ eyebrow, title, text, image, type = '', badges = [], home = false }) {
  return `<section class="section ${home ? 'hero' : 'page-hero'}"><div class="container hero-grid${image ? '' : ' text-hero'}">
    <div class="hero-copy"><p class="eyebrow">${escape(eyebrow)}</p><h1>${title}</h1><p class="hero-intro">${text}</p>
      ${actions(type)}
      ${badges.length ? `<ul class="hero-facts">${badges.map(badge => `<li>${escape(badge)}</li>`).join('')}</ul>` : ''}
    </div>
    ${image ? (image === 'hdpe' ? supplyTile() : media(image, true)) : ''}
  </div></section>`;
}

export function section(title, body, { eyebrow = '', intro = '', tone = '', id = '' } = {}) {
  return `<section class="section ${tone}"${id ? ` id="${id}"` : ''}><div class="container">
    <div class="section-head"><div>${eyebrow ? `<p class="eyebrow">${escape(eyebrow)}</p>` : ''}<h2>${title}</h2></div>${intro ? `<p>${intro}</p>` : ''}</div>
    ${body}
  </div></section>`;
}

export function list(items) {
  return `<ul class="simple-list">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

export function panels(items, classes = 'two-col') {
  return `<div class="${classes}">${items.map(item => `<article class="panel">
    ${item.tag ? `<span class="role-label">${item.tag}</span>` : ''}<h3>${item.title}</h3><p>${item.text}</p>
    ${item.bullets ? list(item.bullets) : ''}
    ${item.href ? `<a class="text-link" href="${item.href}">${item.link || 'Read more'} <span aria-hidden="true">&#8594;</span></a>` : ''}
  </article>`).join('')}</div>`;
}

export function productCards(ids = products.map(product => product.id)) {
  return `<div class="product-grid">${ids.map(id => {
    const product = products.find(item => item.id === id);
    return `<article class="product-card">
      <a class="card-media${product.image === 'core' ? ' illustration' : ''}" href="${product.file}" aria-label="${product.name} details">${product.image ? picture(product.image) : supplyTile()}</a>
      <div class="card-body"><span class="role-label">${product.role}</span><h3><a href="${product.file}">${product.name}</a></h3><p>${product.text}</p>${list(product.bullets)}<a class="text-link" href="${product.file}">${product.cta} <span aria-hidden="true">&#8594;</span></a></div>
    </article>`;
  }).join('')}</div>`;
}

export function sizeTable() {
  return `<div class="table-wrap"><table class="size-table">
    <caption>Black pipes: OD-based inch trade sizes and maximum supplied lengths</caption>
    <thead><tr><th scope="col">Trade size (inches)</th><th scope="col">Maximum length</th><th scope="col">Supply format</th></tr></thead>
    <tbody>${blackPipeSizes.map(size => `<tr><th scope="row">${size.inches}-inch</th><td>${size.maxLength}</td><td>${size.format}</td></tr>`).join('')}</tbody>
  </table></div><p class="data-note">Sizes are based on outside diameter (OD) and traded in inches. Listed lengths are maximums, not minimum orders or guaranteed stock lengths. Confirm wall thickness, material and application suitability with your quotation.</p>`;
}

export function faq(items) {
  return section('Before you enquire', `<div class="faq-list">${items.map(([question, answer]) => `<details><summary>${question}</summary><div><p>${answer}</p></div></details>`).join('')}</div>`, { eyebrow: 'Buyer questions' });
}

export function closing(title = 'Tell us what you need.', text = 'Share your application, size, quantity and location. We can discuss the next step before you order.', type = '') {
  return `<section class="cta-band"><div class="container cta-band-inner"><div><p class="eyebrow">Talk to Shree Keshar Plastic</p><h2>${title}</h2><p>${text}</p><a class="cta-email contact-email" href="mailto:${business.email}">${business.email}</a></div>${actions(type)}</div></section>`;
}

export function related(items) {
  return section('Useful next steps', panels(items), { tone: 'muted-section' });
}
