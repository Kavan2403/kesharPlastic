import { business, images, products } from './catalogue.mjs';
import { escape } from './components.mjs';

const navItems = [
  ['paper-tube-replacement-pipes.html', 'Plastic cores'],
  ['industries-served.html', 'Applications'],
  ['products.html', 'Other products'],
  ['technical-resources.html', 'Resources'],
  ['about.html', 'Company'],
];

function canonical(file) {
  return `${business.url}/${file === 'index.html' ? '' : file}`;
}

function crumbs(page) {
  const items = [['index.html', 'Home']];
  if (page.group && page.group !== page.file) {
    items.push(navItems.find(([file]) => file === page.group));
  }
  if (page.file !== 'index.html') items.push([page.file, page.label]);
  return items;
}

function schema(page) {
  const companyId = `${business.url}/#organization`;
  const locationId = `${business.url}/#business`;
  const pageUrl = canonical(page.file);
  const logo = { '@type': 'ImageObject', url: `${business.url}/${business.logo.src}`, width: business.logo.width, height: business.logo.height, caption: business.name };
  const graph = [
    { '@type': 'Organization', '@id': companyId, name: business.name, url: business.url, logo, telephone: business.phone, email: business.email, sameAs: [business.profile] },
    { '@type': 'LocalBusiness', '@id': locationId, name: business.name, url: business.url, parentOrganization: { '@id': companyId }, telephone: business.phone, email: business.email,
      logo, address: { '@type': 'PostalAddress', streetAddress: business.street, addressLocality: business.locality, addressRegion: business.region, addressCountry: 'IN' } },
    { '@type': 'WebSite', '@id': `${business.url}/#website`, url: business.url, name: business.name, publisher: { '@id': companyId } },
    { '@type': page.contact ? 'ContactPage' : page.collection ? 'CollectionPage' : page.file === 'about.html' ? 'AboutPage' : 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: page.title, description: page.description, inLanguage: 'en', isPartOf: { '@id': `${business.url}/#website` }, about: { '@id': companyId }, ...(page.file !== 'index.html' ? { breadcrumb: { '@id': `${pageUrl}#breadcrumb` } } : {}) },
  ];
  if (page.file !== 'index.html') graph.push({ '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`, itemListElement: crumbs(page).map(([file, name], index) => ({ '@type': 'ListItem', position: index + 1, name, item: canonical(file) })) });
  // These are quote-led product ranges, not priced individual product offers.
  if (page.service) graph.push({ '@type': 'Service', '@id': `${pageUrl}#service`, name: 'Complete underground farm pipeline installation', serviceType: business.installationScope.join(', '), provider: { '@id': locationId }, areaServed: { '@type': 'Place', name: 'Within a 100 km radius of Ahmedabad, Gujarat, India' }, url: pageUrl, description: page.description });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

function navigation(page) {
  return navItems.map(([file, label]) => `<li><a href="${file}"${page.file === file ? ' aria-current="page"' : page.group === file ? ' class="is-section-active"' : ''}>${label}</a></li>`).join('');
}

function logoLink(className, lazy = false) {
  return `<a class="${className}" href="index.html" aria-label="Shree Keshar Plastic home"><span class="brand-logo"><img src="${business.logo.src}" alt="${escape(business.name)}" width="${business.logo.width}" height="${business.logo.height}" loading="${lazy ? 'lazy' : 'eager'}" decoding="async"></span></a>`;
}

function header(page) {
  return `<a class="skip-link" href="#main-content">Skip to main content</a>
<header class="site-header"><div class="container header-shell">
  ${logoLink('brand')}
  <nav class="desktop-nav" aria-label="Primary navigation"><ul>${navigation(page)}</ul></nav>
  <a class="btn btn-primary header-quote" href="contact.html?product=cores#quote-form">Request a quote <span aria-hidden="true">&#8599;</span></a>
  <details class="mobile-nav"><summary aria-label="Open navigation menu">Menu <span aria-hidden="true">&#9776;</span></summary><nav class="mobile-menu" aria-label="Mobile navigation"><ul>${navigation(page)}<li><a href="contact.html?product=cores#quote-form">Request a core quote</a></li><li><a href="gallery.html">Gallery</a></li><li><a href="farm-pipeline-installation-ahmedabad.html">Farm installation</a></li><li><a href="tel:${business.phone}">Call ${business.phoneLabel}</a></li></ul></nav></details>
</div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container footer-grid">
  <div class="footer-brand">${logoLink('footer-logo', true)}<p>Custom plastic cores for winding, roll support and protective packaging. Manufactured in Ahmedabad. Also manufacturing black pipes, supplying PVC and HDPE, and installing farm pipelines.</p><div class="footer-actions"><a class="btn btn-dark" href="tel:${business.phone}">${business.phoneLabel}</a><a class="btn btn-whatsapp" href="https://wa.me/${business.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></div><address>101, Shreenath Shoping Center, Nr. Bhumaria Kuva,<br>Lambha Turning, Narol-Aslali Road, Narol,<br>Ahmedabad, Gujarat, India</address></div>
  <nav class="footer-nav" aria-label="Footer navigation"><div><h2>Products</h2>${products.map(product => `<a href="${product.file}">${product.name}</a>`).join('')}</div><div><h2>Explore</h2><a href="farm-pipeline-installation-ahmedabad.html">Farm installation</a><a href="technical-resources.html">Buyer resources</a><a href="pipe-size-guide.html">Pipe size guide</a><a href="industries-served.html">Industries</a></div><div><h2>Company</h2><a href="about.html">About us</a><a href="gallery.html">Gallery</a><a href="contact.html">Contact / Get a quote</a><a href="mailto:${business.email}">Email us</a></div></nav>
</div><div class="container footer-contact"><a class="contact-email" href="mailto:${business.email}">${business.email}</a><a href="privacy.html">Privacy</a><button class="privacy-open" id="privacy-open" type="button" hidden>Privacy choices</button></div><div class="container footer-bottom"><span>&copy; 2026 Shree Keshar Plastic</span><span>Narol, Ahmedabad / Gujarat / India</span></div></footer>
<section class="privacy-panel" id="privacy-choices" aria-labelledby="privacy-title" hidden><h2 id="privacy-title">Your privacy choices</h2><p>Allow optional analytics to help us understand visits and enquiries? The website and form work without it. Advertising tracking is off.</p><a href="privacy.html">Read our privacy notice</a><div class="cta-row"><button class="btn btn-outline" type="button" data-analytics-choice="reject">Reject analytics</button><button class="btn btn-primary" type="button" data-analytics-choice="allow">Allow analytics</button></div></section>
<a class="floating-whatsapp" href="https://wa.me/${business.whatsapp}?text=Hello%20Shree%20Keshar%20Plastic%2C%20I%20would%20like%20to%20discuss%20a%20requirement." target="_blank" rel="noopener" aria-label="Discuss your requirement on WhatsApp">WhatsApp <span aria-hidden="true">&#8599;</span></a>`;
}

export function renderPage(page) {
  const share = images[page.image === 'coreStudy' ? 'coreShare' : page.image || 'black'];
  const shareImage = share.src;
  const socialImage = shareImage.startsWith('https:') ? shareImage : `${business.url}/${shareImage}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(page.title)}</title>
  <meta name="description" content="${escape(page.description)}">
  <link rel="canonical" href="${canonical(page.file)}">
  <meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow'}">
  <meta name="theme-color" content="#14304a">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escape(page.title)}">
  <meta property="og:description" content="${escape(page.description)}">
  <meta property="og:url" content="${canonical(page.file)}">
  <meta property="og:image" content="${socialImage}">
  <meta property="og:image:width" content="${share.width}">
  <meta property="og:image:height" content="${share.height}">
  <meta property="og:image:alt" content="${escape(share.alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escape(page.title)}">
  <meta name="twitter:description" content="${escape(page.description)}">
  <meta name="twitter:image" content="${socialImage}">
  <meta name="twitter:image:alt" content="${escape(share.alt)}">
  <link rel="icon" href="${business.logo.src}" type="image/png">
  <link rel="apple-touch-icon" href="${business.logo.src}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="core-design.css">
  <script type="application/ld+json">${schema(page)}</script>
  <script src="analytics.js" defer></script>
  <script src="script.js" defer></script>
  ${page.coreExperience ? '<script type="module" src="core-scene.js"></script>' : ''}
</head>
<body${page.contact ? ' class="contact-page"' : ''} data-page="${escape(page.file)}" data-offering="${escape(page.offering || '')}">
${header(page)}
<main id="main-content" tabindex="-1">
${page.file !== 'index.html' ? `<nav class="breadcrumbs container" aria-label="Breadcrumb"><ol>${crumbs(page).map(([file, name], index, items) => `<li>${index === items.length - 1 ? `<span aria-current="page">${name}</span>` : `<a href="${file}">${name}</a>`}</li>`).join('')}</ol></nav>` : ''}
${page.body}
</main>
${footer()}
</body>
</html>
`.replace(/[\t ]+$/gm, '');
}
