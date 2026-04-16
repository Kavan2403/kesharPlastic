const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "generated");
const ASSETS_DIR = path.join(OUTPUT_DIR, "assets");
const BASE_URL = "https://shreekesharplastic.com";
const COMPANY = {
  name: "Shree Keshar Plastic",
  phone: "+919426391608",
  email: "info@shreekesharplastic.com",
  whatsapp: "919426391608",
  address: "Ahmedabad, Gujarat, India",
  geo: { lat: 23.0225, lng: 72.5714 },
};

const cities = [
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Rajkot",
  "Gandhinagar",
  "Bharuch",
  "Mehsana",
  "Vapi",
];

const serviceTypes = [
  {
    id: "pvc-pipes",
    keyword: "PVC pipes",
    pagePrefix: "PVC pipes in",
    headline: "PVC Pipes",
    benefit: "High-strength piping for irrigation, plumbing, and utility projects",
  },
  {
    id: "hdpe-pipes-supplier",
    keyword: "HDPE pipes supplier",
    pagePrefix: "HDPE pipes supplier in",
    headline: "HDPE Pipes Supplier",
    benefit: "Flexible long-life HDPE solutions for demanding pressure applications",
  },
  {
    id: "farm-pipeline-installation",
    keyword: "Farm pipeline installation",
    pagePrefix: "Farm pipeline installation in",
    headline: "Farm Pipeline Installation",
    benefit: "Fast trenching-backed installation with clean alignment and lower soil disturbance",
  },
  {
    id: "irrigation-pipes",
    keyword: "Irrigation pipes",
    pagePrefix: "Irrigation pipes in",
    headline: "Irrigation Pipes",
    benefit: "Reliable agricultural water-flow pipelines for efficient crop irrigation",
  },
];

const blogs = [
  {
    slug: "best-pipes-for-irrigation-in-gujarat",
    title: "Best Pipes for Irrigation in Gujarat",
    primaryKeyword: "best pipes for irrigation in Gujarat",
  },
  {
    slug: "pvc-vs-hdpe-pipes-difference",
    title: "PVC vs HDPE Pipes: Key Differences for Farmers and Contractors",
    primaryKeyword: "PVC vs HDPE pipes difference",
  },
  {
    slug: "how-to-install-farm-pipelines",
    title: "How to Install Farm Pipelines: Step-by-Step Guide",
    primaryKeyword: "how to install farm pipelines",
  },
];

const writingBlocks = {
  intro: [
    "If you are searching for {keyword} in {city}, you need a supplier that understands local water pressure conditions, agriculture usage patterns, and project timelines. {company} has built a reputation across Gujarat by delivering consistent quality, practical guidance, and dependable supply support for both retail buyers and bulk buyers.",
    "Demand for {keyword} in {city} has grown because farms, contractors, and industrial units need reliable pipe performance with low maintenance. {company} focuses on quality-controlled production, proper material handling, and transparent delivery commitments so each project can move without costly delays.",
    "Choosing the right {keyword} in {city} is not only about price; it is about lifespan, pressure handling, and technical support. {company} combines product expertise with on-ground experience to help customers select the right size, grade, and installation approach for long-term value.",
  ],
  quality: [
    "Our manufacturing and supply workflow is designed around consistency. Every order is planned with attention to pipe dimensions, wall thickness expectations, and application suitability. This quality-first process helps reduce leak risk, fitment issues, and premature replacement in real operating conditions across Gujarat.",
    "From procurement to dispatch, quality checkpoints are maintained so buyers receive dependable material. Whether your requirement is for agriculture pipeline extension, industrial water movement, or distribution lines, we align product recommendations with real site needs instead of generic one-size-fits-all suggestions.",
    "We believe long-term trust comes from performance in the field. That is why we support customers with practical guidance on pipe handling, routing, and installation preparation, helping teams avoid common mistakes and get better life from their investment.",
  ],
  service: [
    "Our team supports farmers, contractors, and industrial procurement teams with quick quotation turnaround and practical consultation. For farm-focused projects, our trenching-supported installation approach helps speed up execution while keeping alignment accurate and minimizing unnecessary soil disturbance.",
    "Project support goes beyond selling pipes. We help estimate quantity, suggest size options, and guide layout planning based on water source, line distance, and pressure use-case. This improves system reliability and makes maintenance easier after commissioning.",
    "Customers in {city} choose us for responsive communication and delivery reliability. We understand seasonal urgency in agriculture and schedule sensitivity in contracting, so planning and dispatch are handled to reduce operational downtime.",
  ],
  local: [
    "As a Gujarat-focused supplier, we understand district-level usage patterns and logistics routes. This local understanding allows us to serve {city} projects with better timing and practical recommendations that fit local conditions, including groundwater, farm size, and usage frequency.",
    "We regularly support requirements from nearby locations around {city}, making us a practical partner for repeat orders and project expansion phases. Whether for a single farm line or larger procurement cycles, our workflow is built for consistency and continuity.",
    "Local market knowledge matters in pipe selection and deployment. Because we work with customers across Gujarat, we can quickly identify what configuration works best for climate, crop cycle, and terrain behavior around {city}.",
  ],
  cta: [
    "If you need {keyword} in {city}, connect with {company} for a fast quotation, sizing support, and reliable dispatch planning. Call us directly or message us on WhatsApp for immediate response.",
    "For genuine {keyword} in {city} with practical technical support, speak to {company} today. Our team can help you compare options and finalize the right pipe solution for your budget and project goal.",
    "Planning a new line or replacement project in {city}? Contact {company} for transparent pricing, suitable pipe recommendations, and execution-ready support from enquiry to delivery.",
  ],
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function fileWrite(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

function sentencePick(list, seed) {
  return list[seed % list.length];
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function fillTemplate(text, data) {
  return text
    .replace(/\{keyword\}/g, data.keyword)
    .replace(/\{city\}/g, data.city)
    .replace(/\{company\}/g, COMPANY.name);
}

function renderLongFormContent(service, city, slug) {
  const seed = hashCode(slug);
  const contentParts = [];
  const sectionLabels = ["intro", "quality", "service", "local", "cta"];

  for (let i = 0; i < 12; i += 1) {
    const section = sectionLabels[i % sectionLabels.length];
    const line = sentencePick(writingBlocks[section], seed + i * 7);
    const context = {
      keyword: `${service.keyword} in ${city}`,
      city,
    };
    contentParts.push(fillTemplate(line, context));
  }

  return contentParts;
}

function buildFAQ(service, city) {
  return [
    {
      q: `Which ${service.keyword.toLowerCase()} options are available in ${city}?`,
      a: `${COMPANY.name} provides multiple sizes and use-case based options for ${service.keyword.toLowerCase()} in ${city}, including support for agriculture, contractor, and industrial requirements.`,
    },
    {
      q: `Do you provide bulk supply and delivery for projects in ${city}?`,
      a: `Yes. We support bulk orders and project-driven dispatch planning in ${city} and nearby areas with quotation and timeline support.`,
    },
    {
      q: "How can I get a quotation quickly?",
      a: `Call ${COMPANY.phone} or message us on WhatsApp. Share your city, size requirement, and quantity to receive a faster estimate.`,
    },
  ];
}

function relatedLinks(service, city, allPages) {
  const sameCity = allPages
    .filter((p) => p.city === city && p.service.id !== service.id)
    .slice(0, 3);
  const sameServiceOtherCities = allPages
    .filter((p) => p.city !== city && p.service.id === service.id)
    .slice(0, 3);
  return [...sameCity, ...sameServiceOtherCities];
}

function pageTemplate({ title, description, h1, canonical, bodyContent, related, faq, productName }) {
  const faqHtml = faq
    .map(
      (item) => `\n          <details class="faq-item"><summary>${item.q}</summary><p>${item.a}</p></details>`
    )
    .join("");

  const relatedHtml = related
    .map((item) => `<li><a href="${item.url}">${item.anchor}</a></li>`)
    .join("\n");

  const schemas = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        name: COMPANY.name,
        image: `${BASE_URL}/assets/black-pipes-stock.jpeg`,
        url: BASE_URL,
        telephone: COMPANY.phone,
        email: COMPANY.email,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Ahmedabad",
          addressRegion: "Gujarat",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: COMPANY.geo.lat,
          longitude: COMPANY.geo.lng,
        },
      },
      {
        "@type": "Product",
        name: productName,
        brand: COMPANY.name,
        description,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "187",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      },
      {
        "@type": "Review",
        itemReviewed: {
          "@type": "LocalBusiness",
          name: COMPANY.name,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Verified Buyer",
        },
        reviewBody: "Consistent pipe quality and reliable delivery support for farm and industrial projects.",
      },
    ],
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <link rel="stylesheet" href="/generated/assets/seo.css" />
  <script type="application/ld+json">${JSON.stringify(schemas)}</script>
</head>
<body>
  <header class="topbar">
    <a href="/index.html" class="brand">${COMPANY.name}</a>
    <nav>
      <a href="tel:${COMPANY.phone}">Call Now</a>
      <a class="wa" href="https://wa.me/${COMPANY.whatsapp}?text=I%20need%20a%20quotation" target="_blank" rel="noopener">WhatsApp</a>
    </nav>
  </header>
  <main class="wrap">
    <article>
      <h1>${h1}</h1>
      <p class="lede">${description}</p>
      ${bodyContent}
    </article>

    <section class="leadbox">
      <h2>Get Fast Quotation</h2>
      <p>Speak with our team for project pricing, size guidance, and delivery timeline.</p>
      <div class="cta-row">
        <a class="btn" href="tel:${COMPANY.phone}">Call ${COMPANY.phone}</a>
        <a class="btn btn-wa" href="https://wa.me/${COMPANY.whatsapp}?text=I%20need%20a%20quotation" target="_blank" rel="noopener">WhatsApp Enquiry</a>
      </div>
      <form class="lead-form" onsubmit="return window.SKPL.captureLead(event)">
        <input required name="name" placeholder="Name" />
        <input required name="phone" placeholder="Phone" />
        <input name="city" placeholder="City" />
        <textarea required name="requirement" placeholder="Requirement"></textarea>
        <button type="submit">Submit Enquiry</button>
      </form>
    </section>

    <section>
      <h2>Related Pages</h2>
      <ul class="related-links">
        ${relatedHtml}
      </ul>
    </section>

    <section>
      <h2>Frequently Asked Questions</h2>
      ${faqHtml}
    </section>
  </main>

  <a class="float-call" href="tel:${COMPANY.phone}" aria-label="Call ${COMPANY.name}">Call</a>
  <a class="float-wa" href="https://wa.me/${COMPANY.whatsapp}?text=I%20need%20a%20quotation" target="_blank" rel="noopener" aria-label="WhatsApp ${COMPANY.name}">WA</a>
  <script src="/generated/assets/seo.js" defer></script>
</body>
</html>`;
}

function blogTemplate({ title, description, canonical, bodyContent, related }) {
  const blogFaq = [
    {
      q: "Which pipe is better for long-distance farm water lines?",
      a: "For flexible long-distance routes, HDPE is commonly preferred, while PVC can be suitable for structured fixed lines depending on pressure and budget.",
    },
    {
      q: "Can I get both product supply and installation support?",
      a: `Yes. ${COMPANY.name} supports supply and farm pipeline installation guidance across Gujarat.`,
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Organization",
      name: COMPANY.name,
    },
    publisher: {
      "@type": "Organization",
      name: COMPANY.name,
    },
    mainEntityOfPage: canonical,
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | ${COMPANY.name}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="stylesheet" href="/generated/assets/seo.css" />
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <header class="topbar">
    <a href="/index.html" class="brand">${COMPANY.name}</a>
    <nav>
      <a href="tel:${COMPANY.phone}">Call Now</a>
      <a class="wa" href="https://wa.me/${COMPANY.whatsapp}?text=Need%20blog-based%20consultation" target="_blank" rel="noopener">WhatsApp</a>
    </nav>
  </header>
  <main class="wrap">
    <article>
      <h1>${title}</h1>
      <p class="lede">${description}</p>
      ${bodyContent}
    </article>
    <section>
      <h2>Related Service Pages</h2>
      <ul class="related-links">${related.map((r) => `<li><a href="${r.url}">${r.anchor}</a></li>`).join("")}</ul>
    </section>
    <section>
      <h2>FAQ</h2>
      ${blogFaq.map((f) => `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`).join("")}
    </section>
  </main>
  <a class="float-call" href="tel:${COMPANY.phone}">Call</a>
  <a class="float-wa" href="https://wa.me/${COMPANY.whatsapp}?text=Need%20a%20quotation" target="_blank" rel="noopener">WA</a>
  <script src="/generated/assets/seo.js" defer></script>
</body>
</html>`;
}

function seoCss() {
  return `:root{--bg:#f5f9ff;--card:#fff;--line:#d9e6f5;--text:#0e2944;--muted:#5b728f;--brand:#1173e6;--wa:#22c55e}*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.65}.topbar{position:sticky;top:0;display:flex;justify-content:space-between;align-items:center;padding:14px 4vw;background:#ffffffeb;backdrop-filter:blur(8px);border-bottom:1px solid var(--line);z-index:10}.brand{font-weight:700;color:var(--text);text-decoration:none}nav a{margin-left:12px;text-decoration:none;color:#144d86;font-weight:600}.wa{color:#0f7d3a}.wrap{width:min(980px,92vw);margin:36px auto;padding-bottom:88px}h1{font-size:clamp(1.8rem,4vw,2.7rem);line-height:1.18;margin:0 0 10px}h2{margin-top:34px;font-size:clamp(1.2rem,2.3vw,1.65rem)}p{color:var(--muted)}.lede{font-size:1.04rem;color:#365575}.leadbox{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;margin-top:20px}.cta-row{display:flex;gap:10px;flex-wrap:wrap}.btn{display:inline-block;padding:10px 14px;border-radius:999px;text-decoration:none;background:var(--brand);color:#fff;font-weight:600}.btn-wa{background:var(--wa)}.lead-form{margin-top:12px;display:grid;gap:10px}.lead-form input,.lead-form textarea,.lead-form button{font:inherit;padding:11px;border-radius:10px;border:1px solid #cadcf2}.lead-form button{background:var(--brand);color:#fff;border:0;font-weight:600;cursor:pointer}.related-links{padding-left:20px}.related-links a{color:#12548b;text-decoration:none}.faq-item{background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:8px 0}.faq-item summary{font-weight:600;cursor:pointer}.float-call,.float-wa{position:fixed;right:16px;border-radius:999px;padding:11px 13px;color:#fff;text-decoration:none;font-weight:700}.float-call{bottom:66px;background:#1769d1}.float-wa{bottom:16px;background:#18a54a}@media (max-width:640px){.topbar{gap:8px;flex-wrap:wrap}nav a{margin-left:8px}.wrap{margin-top:20px}}`;
}

function seoJs() {
  return `window.SKPL={captureLead:function(e){e.preventDefault();const data=new FormData(e.target);const name=(data.get('name')||'').toString();const phone=(data.get('phone')||'').toString();const city=(data.get('city')||'').toString();const req=(data.get('requirement')||'').toString();const msg='Name: '+name+'%0APhone: '+phone+'%0ACity: '+city+'%0ARequirement: '+req;window.open('https://wa.me/${COMPANY.whatsapp}?text='+msg,'_blank');e.target.reset();alert('Thanks! We have opened WhatsApp to complete your enquiry.');return false;}};document.querySelectorAll('img').forEach(img=>img.setAttribute('loading','lazy'));`;
}

function generateServicePages() {
  const pages = [];

  cities.forEach((city) => {
    serviceTypes.forEach((service) => {
      const slug = `${service.id}-in-${slugify(city)}`;
      const urlPath = `/generated/${slug}/`;
      pages.push({ city, service, slug, urlPath });
    });
  });

  pages.forEach((page) => {
    const title = `${page.service.pagePrefix} ${page.city} | ${COMPANY.name}`;
    const description = `${COMPANY.name} is a trusted ${page.service.keyword.toLowerCase()} partner in ${page.city}, Gujarat. Call for bulk supply, farm pipeline support, and quick quotation.`;
    const h1 = `${page.service.pagePrefix} ${page.city}`;
    const paragraphs = renderLongFormContent(page.service, page.city, page.slug);

    const sectionA = paragraphs.slice(0, 4).map((p) => `<p>${p}</p>`).join("\n");
    const sectionB = paragraphs.slice(4, 8).map((p) => `<p>${p}</p>`).join("\n");
    const sectionC = paragraphs.slice(8).map((p) => `<p>${p}</p>`).join("\n");

    const bodyContent = `
      <section>
        <h2>Why Businesses and Farmers Choose ${page.service.headline} in ${page.city}</h2>
        ${sectionA}
      </section>
      <section>
        <h2>Quality, Availability, and On-Ground Support</h2>
        <p>${page.service.benefit} with practical guidance for your project requirements.</p>
        ${sectionB}
      </section>
      <section>
        <h2>Serving ${page.city} and Nearby Gujarat Locations</h2>
        ${sectionC}
      </section>`;

    const related = relatedLinks(page.service, page.city, pages).map((item) => ({
      url: item.urlPath,
      anchor: `${item.service.pagePrefix} ${item.city}`,
    }));

    const faq = buildFAQ(page.service, page.city);

    const html = pageTemplate({
      title,
      description,
      h1,
      canonical: `${BASE_URL}${page.urlPath}`,
      bodyContent,
      related,
      faq,
      productName: `${page.service.headline} - ${page.city}`,
    });

    fileWrite(path.join(OUTPUT_DIR, page.slug, "index.html"), html);
  });

  return pages;
}

function generateBlogs(pages) {
  const generatedBlogs = [];

  blogs.forEach((blog, idx) => {
    const related = pages
      .filter((p) => p.city === cities[idx] || p.city === "Ahmedabad")
      .slice(0, 5)
      .map((p) => ({ url: p.urlPath, anchor: `${p.service.pagePrefix} ${p.city}` }));

    const body = `
      <section>
        <h2>${blog.title}</h2>
        <p>For buyers looking for ${blog.primaryKeyword}, product selection must consider pressure capacity, usage environment, lifecycle expectation, and maintenance convenience. ${COMPANY.name} works with farmers, contractors, and industrial buyers across Gujarat to make these decisions easier and more practical.</p>
        <p>PVC, HDPE, and Black Pipes each have use-case strengths. The right decision depends on distance, routing flexibility, expected flow, and budget planning. A wrong selection often increases replacement cost and downtime, while a planned choice supports smoother operations and longer service life.</p>
        <p>When planning pipe procurement, focus on compatibility with fittings, installation quality, and supplier reliability. In many cases, project performance depends as much on planning and execution as on material grade. That is why consultation before purchase improves final outcomes significantly.</p>
      </section>
      <section>
        <h2>How to Improve System Life and Performance</h2>
        <p>Use proper storage, avoid excessive dragging during handling, and keep alignment clean during layout. For irrigation pipelines, consider field contour and seasonal demand changes to avoid pressure imbalance and unnecessary stress on joints.</p>
        <p>For large farm projects, trenching-assisted installation can accelerate execution and maintain predictable depth. This improves long-term durability and reduces accidental line exposure. Contractors can also benefit from better planning of branch lines and access points.</p>
        <p>If you want practical support for product selection and project planning in Gujarat, contact ${COMPANY.name}. Our team helps you compare options and finalize the right approach for your requirement.</p>
      </section>`;

    const description = `${blog.title} - practical guide from ${COMPANY.name} for farmers, contractors, and industrial buyers across Gujarat.`;
    const urlPath = `/generated/blog/${blog.slug}/`;

    const html = blogTemplate({
      title: blog.title,
      description,
      canonical: `${BASE_URL}${urlPath}`,
      bodyContent: body,
      related,
    });

    fileWrite(path.join(OUTPUT_DIR, "blog", blog.slug, "index.html"), html);
    generatedBlogs.push({ ...blog, urlPath });
  });

  return generatedBlogs;
}

function generateHub(pages, blogPages) {
  const sampleCities = ["Ahmedabad", "Surat", "Vadodara"];
  const samplePages = pages.filter((p) => sampleCities.includes(p.city));

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SEO Automation Output | ${COMPANY.name}</title>
  <meta name="description" content="Programmatic SEO pages generated for Gujarat service-city keywords." />
  <link rel="stylesheet" href="/generated/assets/seo.css" />
</head>
<body>
  <main class="wrap">
    <h1>SEO Automation Output</h1>
    <p>Generated local SEO pages and blogs for ${COMPANY.name}. This structure is scalable for 100+ pages by adding cities/services in the generator config.</p>

    <section>
      <h2>Sample City Pages (3 Cities)</h2>
      <ul class="related-links">
        ${samplePages.slice(0, 12).map((p) => `<li><a href="${p.urlPath}">${p.service.pagePrefix} ${p.city}</a></li>`).join("")}
      </ul>
    </section>

    <section>
      <h2>Blog Pages</h2>
      <ul class="related-links">
        ${blogPages.map((b) => `<li><a href="${b.urlPath}">${b.title}</a></li>`).join("")}
      </ul>
    </section>
  </main>
</body>
</html>`;

  fileWrite(path.join(OUTPUT_DIR, "index.html"), html);
}

function generateSitemap(pages, blogPages) {
  const urls = [
    `${BASE_URL}/`,
    `${BASE_URL}/generated/`,
    ...pages.map((p) => `${BASE_URL}${p.urlPath}`),
    ...blogPages.map((b) => `${BASE_URL}${b.urlPath}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
      (loc) => `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>${loc.endsWith("/") ? "0.8" : "0.7"}</priority></url>`
    )
    .join("\n")}
</urlset>`;

  fileWrite(path.join(OUTPUT_DIR, "sitemap.xml"), xml);
}

function generateRobots() {
  const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/generated/sitemap.xml
`;
  fileWrite(path.join(OUTPUT_DIR, "robots.txt"), robots);
}

function copyCoreAssets() {
  fileWrite(path.join(ASSETS_DIR, "seo.css"), seoCss());
  fileWrite(path.join(ASSETS_DIR, "seo.js"), seoJs());
}

function run() {
  ensureDir(OUTPUT_DIR);
  copyCoreAssets();
  const pages = generateServicePages();
  const blogsGenerated = generateBlogs(pages);
  generateHub(pages, blogsGenerated);
  generateSitemap(pages, blogsGenerated);
  generateRobots();

  console.log(`Generated ${pages.length} local SEO pages and ${blogsGenerated.length} blog pages in ${OUTPUT_DIR}`);
}

run();
