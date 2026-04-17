const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const base = 'https://shreekesharplastic.com';
const phone = '+919426391608';
const whatsapp = '919426391608';

const linkBlock = `
<div class="related-links">
  <a href="index.html">Home</a>
  <a href="pvc-pipes-ahmedabad.html">PVC Pipes Ahmedabad</a>
  <a href="hdpe-pipes-ahmedabad.html">HDPE Pipes Ahmedabad</a>
  <a href="farm-pipeline-installation-ahmedabad.html">Farm Pipeline Installation Ahmedabad</a>
  <a href="black-pipes-manufacturer.html">Black Pipes Manufacturer</a>
  <a href="paper-tube-replacement-pipes.html">Paper Tube Replacement Pipes</a>
</div>`;

const pages = [
  {
    file: 'pvc-pipes-ahmedabad.html',
    slug: 'pvc-pipes-ahmedabad.html',
    keyword: 'PVC pipes Ahmedabad',
    title: 'PVC Pipes Ahmedabad | Shree Keshar Plastic',
    h1: 'PVC Pipes in Ahmedabad for Agriculture, Industrial & Contractor Projects',
    meta: 'Looking for PVC pipes Ahmedabad? Shree Keshar Plastic provides dependable PVC pipe solutions with 27+ years expertise, competitive pricing, and fast quotation support.',
    product: 'PVC Pipes',
    faq: [
      ['What are common PVC pipe uses in Ahmedabad?', 'PVC pipes are commonly used for irrigation branch lines, water movement, utility routing, and contractor projects because they offer durability and practical cost efficiency.'],
      ['How do I select the right PVC size?', 'Pipe size depends on flow requirement, route distance, and pressure expectation. Our team helps buyers finalize the practical size range before dispatch.'],
      ['Do you provide bulk PVC supply?', 'Yes, we support bulk orders for farms, contractors, and industrial units with quick pricing and dispatch planning.']
    ]
  },
  {
    file: 'hdpe-pipes-ahmedabad.html',
    slug: 'hdpe-pipes-ahmedabad.html',
    keyword: 'HDPE pipes Ahmedabad',
    title: 'HDPE Pipes Ahmedabad | Shree Keshar Plastic',
    h1: 'HDPE Pipes Supplier in Ahmedabad for Long-Life Irrigation Networks',
    meta: 'Need HDPE pipes Ahmedabad? Shree Keshar Plastic supplies black HDPE pipe solutions for irrigation and industrial use with 27+ years practical experience.',
    product: 'HDPE Pipes',
    faq: [
      ['Why choose HDPE pipes for irrigation?', 'HDPE pipes offer flexibility, impact resistance, and practical performance for long-distance farm routes where bends and terrain variation are common.'],
      ['Can HDPE be used for underground routes?', 'Yes. HDPE is suitable for underground applications when size, pressure requirement, and installation method are properly selected.'],
      ['Do you supply HDPE in bulk?', 'Yes, we support contractor and farm bulk orders with clear size guidance and timely dispatch planning.']
    ]
  },
  {
    file: 'farm-pipeline-installation-ahmedabad.html',
    slug: 'farm-pipeline-installation-ahmedabad.html',
    keyword: 'Farm pipeline installation Ahmedabad',
    title: 'Farm Pipeline Installation Ahmedabad | Trencher Service',
    h1: 'Underground Farm Pipeline Installation in Ahmedabad with Trencher Machine',
    meta: 'Professional farm pipeline installation Ahmedabad using trencher machines by Shree Keshar Plastic. Faster work, less soil damage, cleaner finish.',
    product: 'Farm Pipeline Installation Service',
    faq: [
      ['What is the trencher machine benefit?', 'Trencher installation speeds up execution, keeps line depth consistent, and reduces overall soil disturbance compared to manual methods.'],
      ['Do you handle full installation support?', 'Yes, we support route planning, pipe selection guidance, and execution-focused recommendations for farm projects.'],
      ['How is installation cost calculated?', 'Cost depends on route length, depth, soil condition, and selected pipe type. Contact us for a practical quotation.']
    ]
  },
  {
    file: 'black-pipes-manufacturer.html',
    slug: 'black-pipes-manufacturer.html',
    keyword: 'Black pipes manufacturer',
    title: 'Black Pipes Manufacturer in Gujarat | Shree Keshar Plastic',
    h1: 'Black Pipes Manufacturer for OEM and Industrial Buyers',
    meta: 'Searching for a black pipes manufacturer in Gujarat? Shree Keshar Plastic delivers custom black pipe options with quality consistency and project-ready support.',
    product: 'Black Pipes',
    faq: [
      ['What are black pipes used for?', 'Black pipes are commonly used in OEM fabrication, industrial handling systems, and custom process setups where specific dimensions are required.'],
      ['Can I get custom dimensions?', 'Yes, we support requirement-based diameter and length customization based on your usage details.'],
      ['Do you support recurring supply?', 'Yes, our process is designed for repeat procurement cycles with quality consistency and responsive communication.']
    ]
  },
  {
    file: 'paper-tube-replacement-pipes.html',
    slug: 'paper-tube-replacement-pipes.html',
    keyword: 'Paper tube replacement pipes',
    title: 'Paper Tube Replacement Pipes Manufacturer | Shree Keshar Plastic',
    h1: 'Paper Tube Replacement Pipes for Packaging and Winding Industries',
    meta: 'Shree Keshar Plastic manufactures paper tube replacement pipes designed for higher durability and repeat-use industrial operations in Gujarat.',
    product: 'Paper Tube Replacement Pipes',
    faq: [
      ['Why replace paper tubes with plastic replacement pipes?', 'Replacement pipes offer better durability, lower frequent replacement risk, and improved consistency for repeated industrial handling cycles.'],
      ['Are replacement pipes available in custom size?', 'Yes, size and length are provided according to process requirements and machine compatibility.'],
      ['Do you supply for packaging units?', 'Yes, we regularly support packaging and winding businesses with practical supply planning and quotation support.']
    ]
  }
];

function p(text) {
  return `<p>${text}</p>`;
}

function longContent(keyword, product, focus) {
  const blocks = [
    `Looking for ${keyword}? ${'Shree Keshar Plastic'} has been serving Gujarat buyers for more than 27 years with a practical approach to manufacturing, supply, and project support. In Ahmedabad and nearby regions, buyers often need a partner who can provide not only material but also clear technical guidance before purchase. That is where our experience becomes useful. We work with farmers, contractors, and industrial procurement teams who need dependable quality, transparent pricing, and predictable communication throughout enquiry and delivery.`,
    `When customers search for ${keyword}, they are usually comparing lifespan, pressure handling, and total cost over time. We focus on these real buying priorities. Every project is different, so our team helps align ${product} selection with route length, usage pattern, and operating conditions. This reduces mismatch risk and helps prevent avoidable repair cycles. By planning correctly at the start, customers can achieve better performance and lower maintenance pressure later.`,
    `${focus} We maintain quality awareness from order planning to dispatch so the delivered material aligns with intended use. In local markets, delays and inconsistent sizing can create project disruption. Our process is built to reduce these issues by prioritizing communication and requirement clarity. Whether your need is a smaller farm line or a larger contractor supply cycle, we help structure procurement so site work can move without unnecessary interruptions.`,
    `For buyers in Ahmedabad, speed and reliability are both important. Seasonal irrigation windows are short, and contractor schedules are tightly planned. We provide quick quotation response and practical quantity guidance so purchase decisions can be made faster. If required, our team also assists in understanding fitting compatibility and route-level planning basics. This support-oriented model helps customers avoid overspending on wrong specifications and improves confidence before bulk orders are finalized.`,
    `Our long-term market presence is built on repeat buyers, and repeat business only comes when field performance is consistent. We therefore focus on supplying ${product} that supports stable operation over time. We believe product quality and execution discipline go together. That is why we actively discuss use case details with clients instead of pushing generic recommendations. A practical recommendation today often saves significant service issues after installation, especially for large routes and critical usage lines.`,
    `For agriculture-focused requirements, pipeline planning should consider field layout, water source, distance, and crop-cycle demand changes. For contractor projects, timeline and uniformity are usually top priorities. For industrial buyers, predictable dimensions and repeat supply become central. We work across these segments and adapt our recommendation accordingly. This multi-segment exposure helps us respond faster and more accurately when buyers ask for city-specific support linked to Gujarat operating conditions.`,
    `Internal coordination is another reason customers prefer working with a single dependable partner. Instead of sourcing from multiple uncertain channels, buyers can streamline conversations for pricing, selection, and delivery through one experienced team. This reduces procurement friction and improves accountability. At Shree Keshar Plastic, we keep this process practical and transparent. You can share your requirement, location, and expected timeline to receive a clear response aligned with your execution goal.`,
    `If you are evaluating ${keyword} for a new project or replacement requirement, speak with us before finalizing. We can help compare options based on your site and usage, then support you with timely dispatch planning. Our objective is to deliver value beyond basic supply by helping customers make better decisions. Call us directly or send your requirement on WhatsApp to receive a fast quotation and relevant recommendation from our Ahmedabad-based team.`
  ];

  return blocks.map(p).join('\n');
}

function faqHtml(faq) {
  return faq.map(([q, a]) => `<article class="faq-item"><h3>${q}</h3><p>${a}</p></article>`).join('');
}

function schema(page) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        name: 'Shree Keshar Plastic',
        url: base,
        telephone: phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '101, Shreenath Shoping Center, Nr. Bhumaria Kuva, Lambha Turning, Narol-Aslali Road, Narol',
          addressLocality: 'Ahmedabad',
          addressRegion: 'Gujarat',
          addressCountry: 'IN'
        }
      },
      {
        '@type': 'Product',
        name: `${page.product} - Ahmedabad`,
        brand: 'Shree Keshar Plastic',
        description: page.meta
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: a
          }
        }))
      }
    ]
  };
}

function template(page) {
  const content = longContent(page.keyword, page.product, `As a ${page.product.toLowerCase()} focused business, we understand that buyers need clarity on both technical suitability and commercial value before finalizing orders.`);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${page.title}</title>
  <meta name="description" content="${page.meta}" />
  <meta name="keywords" content="${page.keyword}, PVC pipes Ahmedabad, HDPE pipes Ahmedabad, Farm irrigation pipes Gujarat, Underground pipeline installation" />
  <link rel="canonical" href="${base}/${page.slug}" />
  <link rel="stylesheet" href="style.css" />
  <script type="application/ld+json">${JSON.stringify(schema(page))}</script>
</head>
<body class="seo-page">
  <header class="site-header">
    <nav class="nav" aria-label="Main Navigation">
      <a class="brand" href="index.html">Shree Keshar Plastic<small>PVC • HDPE • Farm Pipeline Experts</small></a>
      <div class="nav-links">
        <a href="index.html#products">Products</a>
        <a href="index.html#installation">Installation</a>
        <a href="index.html#contact">Contact</a>
      </div>
      <a class="btn btn-primary" href="tel:${phone}">Call Now</a>
      <button class="menu-btn" id="menuBtn" aria-label="Open menu">☰</button>
    </nav>
    <div class="mobile-nav" id="mobileNav">
      <a href="index.html">Home</a>
      <a href="index.html#products">Products</a>
      <a href="index.html#contact">Contact</a>
      <a href="pvc-pipes-ahmedabad.html">PVC Pipes Ahmedabad</a>
      <a href="hdpe-pipes-ahmedabad.html">HDPE Pipes Ahmedabad</a>
      <a href="farm-pipeline-installation-ahmedabad.html">Farm Pipeline Installation</a>
      <a href="black-pipes-manufacturer.html">Black Pipes Manufacturer</a>
      <a href="paper-tube-replacement-pipes.html">Paper Tube Replacement Pipes</a>
    </div>
  </header>

  <main class="hero">
    <div class="container">
      <article class="reveal">
        <h1>${page.h1}</h1>
        <p><strong>${page.meta}</strong></p>

        <h2>Product Overview</h2>
        ${content}

        <h2>Applications and Use Cases</h2>
        <p>${page.product} from Shree Keshar Plastic is used by farmers, contractors, and industrial buyers who need dependable performance and practical lifecycle value. Common use cases include irrigation networks, water movement lines, project-level routing, and process-support requirements. Because application context differs from project to project, we encourage buyers to share route details and expected usage before finalizing quantity.</p>

        <h2>Why Choose Shree Keshar Plastic</h2>
        <p>27+ years of market experience in Gujarat, practical communication, competitive pricing, and project-aware support are core reasons buyers trust us. We do not treat enquiries as simple transactions. We focus on helping customers choose right-fit solutions that deliver long-term value in real operating conditions.</p>

        <div class="hero-cta" style="margin:16px 0 6px;">
          <a class="btn btn-primary" href="tel:${phone}">Call Now</a>
          <a class="btn btn-whatsapp" href="https://wa.me/${whatsapp}?text=Hello%20Shree%20Keshar%20Plastic%2C%20I%20need%20a%20quotation%20for%20${encodeURIComponent(page.product)}" target="_blank" rel="noopener">WhatsApp</a>
        </div>

        <section>
          <h2>Related Pages</h2>
          ${linkBlock}
        </section>

        <section>
          <h2>FAQ</h2>
          <div class="faq-grid">${faqHtml(page.faq)}</div>
        </section>

        <section class="form-box" style="margin-top:14px;">
          <h2>Send Your Requirement</h2>
          <form class="form-grid lead-form">
            <input name="name" placeholder="Name" required />
            <input name="phone" placeholder="Phone" required />
            <input name="city" placeholder="City" value="Ahmedabad" />
            <textarea name="requirement" rows="4" placeholder="Requirement" required></textarea>
            <button type="submit">Get Quotation</button>
          </form>
        </section>
      </article>
    </div>
  </main>

  <footer class="footer"><div class="container">© <span id="year"></span> Shree Keshar Plastic</div></footer>
  <a class="float-call" href="tel:${phone}">Call</a>
  <a class="float-wa" href="https://wa.me/${whatsapp}?text=I%20need%20a%20quotation" target="_blank" rel="noopener">WA</a>
  <script src="script.js" defer></script>
</body>
</html>`;
}

pages.forEach((page) => {
  fs.writeFileSync(path.join(root, page.file), template(page), 'utf8');
});

console.log(`Generated ${pages.length} SEO landing pages in root.`);
