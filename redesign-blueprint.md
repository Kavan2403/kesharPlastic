# Shree Keshar Plastic - Full Redesign Blueprint

## 1) Revised Sitemap
- Home (`index.html`)
- About / Factory / Company Profile (`about.html`)
- Products Hub (`products.html`)
- PVC Pipes (`pvc-pipes-ahmedabad.html`)
- HDPE Pipes (`hdpe-pipes-ahmedabad.html`)
- Black Pipes for OEM / Industrial Use (`black-pipes-manufacturer.html`)
- Plastic Replacement Cores / Paper Tube Replacement Pipes (`paper-tube-replacement-pipes.html`)
- Underground Farm Pipeline Installation (`farm-pipeline-installation-ahmedabad.html`)
- Technical / Buyer Resources Hub (`technical-resources.html`)
- Pipe Size Guide (`pipe-size-guide.html`)
- PVC vs HDPE for Irrigation (`pvc-vs-hdpe-for-irrigation.html`)
- How to Choose Pipe Diameter (`how-to-choose-pipe-diameter.html`)
- Installation Process (`installation-process.html`)
- Industries Served (`industries-served.html`)
- Gallery / Site Work (`gallery.html`)
- Contact / Get Quote (`contact.html`)
- Quality / Testing Draft (optional, noindex until verified) (`quality-testing.html`)

## 2) Revised Navigation Model
- Primary top-nav order:
  - Products
  - Installation
  - Industries
  - Gallery
  - About
  - Contact / Get Quote
- Mobile nav approach:
  - `<details>` based menu for no-JS reliability
  - No hidden-content dependency on JS
- Header conversion actions:
  - Call
  - WhatsApp

## 3) Homepage Wireframe and Section Order
- Hero: identity + value + CTAs + trust strip
- Product categories: 4 distinct cards with use-case snippets
- Why Shree Keshar Plastic: proof-oriented bullets
- Installation capability: trencher workflow + execution benefit
- Technical snapshot: desktop table + mobile cards
- Proof layer: factory, stock, dispatch, site-work visuals with captions
- Industries served: segmented buyer relevance
- Common requirements handled: trust without fabricated testimonials
- Buyer questions: practical FAQ
- Final CTA: full quote form + direct contact + map

## 4) Page Templates for Main Commercial Pages
- Product template:
  - Product-specific hero
  - “Where this fits” guidance
  - Application map
  - Selection checklist
  - Objection handling / FAQ
  - Clear conversion CTA
- Service template:
  - Service-specific hero
  - Scope of service
  - Process workflow
  - Use-case relevance
  - Project CTA
- Company template:
  - Profile
  - Operating model
  - buyer segmentation
  - visual proof
  - contact CTA

## 5) Section-by-Section Copy Recommendations
- Core voice:
  - practical
  - technically aware
  - procurement-friendly
  - non-hype
- Homepage copy guidance:
  - avoid generic claims
  - show buyer outcomes and decision support
  - avoid city-keyword repetition
- Product page copy guidance:
  - differentiate by decision logic, not word swaps
  - include “where this is not first fit” when relevant
- Service page copy guidance:
  - sell execution clarity
  - include process and prep requirements
- Trust copy guidance:
  - use “common requirements handled” if testimonials are not verified

## 6) Image Brief and Art Direction Guide
- Required visual categories:
  - factory exterior/interior context
  - stock-yard inventory
  - product close views
  - dispatch/loading visuals
  - installation workflow visuals
  - replacement core use-case visuals
- Art direction:
  - documentary industrial realism
  - clean color grade
  - consistent aspect ratios
  - caption every image with context
- Avoid:
  - unrelated stock clichés
  - generic office imagery
  - decorative-only hero visuals

## 7) SEO Metadata Plan
- Unique title and description per page
- One H1 per page
- Canonical tags across all indexable pages
- Page intent mapping:
  - commercial pages for products/services
  - support pages for buyer decisions
- Keyword strategy:
  - natural integration
  - no repetitive “Looking for X in Y?” template use

## 8) Internal Linking Plan
- Home links to all core commercial pages
- Product pages cross-link to:
  - related product alternatives
  - size and comparison resources
  - contact page
- Service page links to:
  - product pages
  - installation process resource
  - contact page
- Resource pages link back to:
  - relevant commercial pages
  - contact page
- Footer links maintain crawl pathways to core pages

## 9) Structured Data Plan
- Homepage:
  - `Organization`
  - `LocalBusiness`
  - `WebSite`
- Product pages:
  - `Product`
  - `BreadcrumbList`
- Installation page:
  - `Service`
  - `LocalBusiness`
  - `BreadcrumbList`
- About / resources:
  - `WebPage` or `AboutPage`
  - `BreadcrumbList`
- Avoided:
  - fabricated ratings
  - fabricated reviews
  - unverified certification claims

## 10) Accessibility Requirements Implemented
- Skip link on all pages
- Semantic landmarks (`header`, `nav`, `main`, `footer`)
- Form fields with visible labels
- Focus-visible style for keyboard users
- Mobile menu accessible through native `<details>` semantics
- Adequate contrast and readable type scale
- No content hidden behind JS-dependent reveal states
- Reduced motion support through `prefers-reduced-motion`

## 11) Mobile Rendering / Front-End Requirements
- Mobile-first layout system
- No JS-required content visibility
- No overflow-based clipping for main content
- Responsive cards and image grids
- Desktop table + mobile card equivalent for technical sections
- Sticky header with compact interactions
- Floating CTAs kept simple and touch-sized

## 12) Performance and Media Optimization Requirements
- Compressed local assets used where available
- Width/height attributes present to reduce layout shift
- Lazy loading for below-the-fold images
- Minimal JS bundle (navigation + form + analytics events)
- No animation gate for content rendering
- Static HTML architecture for fast first content paint

## 13) Form Strategy and Conversion Path
- Primary paths:
  - Call
  - WhatsApp
  - Quote form
- Form fields aligned to procurement context:
  - full name
  - phone
  - city
  - buyer type
  - product/service
  - size/quantity
  - message
  - preferred contact method
- JS behavior:
  - form submits to WhatsApp prefilled message
  - analytics events for lead actions

## 14) QA / Launch Checklist
- Content QA:
  - one H1 per page
  - no duplicated intro templates
  - no fabricated testimonial/certification/rating claims
- Technical QA:
  - canonical tags
  - sitemap updated
  - robots updated
  - schema validation in Rich Results / validator
- UX QA:
  - mobile navigation
  - form usability
  - tap target sizing
  - no blank internal pages on mobile
- Accessibility QA:
  - keyboard navigation
  - skip link check
  - color contrast check
  - form label check
- Performance QA:
  - image compression verification
  - CLS and LCP spot checks on mobile

## 15) Missing Business Information (Must Be Collected)
- Exact establishment year for “27+ years” validation
- Postal code for full structured address
- Official working hours
- Confirmed response-time promise for enquiries
- Verified product size charts by category
- Fitting compatibility notes (if publicly publishable)
- Installation service boundaries and minimum project scope
- Any real quality/testing documentation and responsible owner
- Approved testimonial set with names/roles (if public publishing is allowed)
- Project photos with approved captions (date, location, use-case)

