import { business, applicationImages } from './catalogue.mjs';
import { closing, faq, section } from './components.mjs';

const coreUrl = 'paper-tube-replacement-pipes.html';
const quote = 'contact.html?product=cores#quote-form';

export function coreScene(mode = 'hero') {
  return `<figure class="core-scene" data-core-scene="${mode}">
    <div class="core-stage"><span class="scene-index">SKP / MATERIAL STUDY</span>
      <img class="core-poster" src="assets/core-study.svg" alt="Hollow black plastic core with Shree Keshar Plastic printed in white along its body" width="800" height="700" loading="${mode === 'story' ? 'lazy' : 'eager'}">
      <canvas aria-hidden="true" role="group" aria-label="360 degree plastic core viewer" aria-describedby="core-help-${mode}"></canvas>
      <span class="scene-note">Custom diameter<br>Custom length</span><span class="scene-datum" aria-hidden="true">+<span>MADE TO YOUR REQUIREMENT</span>+</span>
    </div>
    <p class="scene-help" id="core-help-${mode}" hidden><strong>360&#176; view</strong> Drag to rotate. Arrow keys or buttons also work.</p>
    <div class="scene-bottom"><figcaption>Product illustration <span>/ Not to scale</span></figcaption><div class="scene-controls" hidden role="group" aria-label="Product illustration controls">
      <div class="orbit-buttons" role="group" aria-label="Rotate the core"><button type="button" data-core-rotate="left" aria-label="Rotate core left" title="Rotate left"><span aria-hidden="true">&#8592;</span></button><button type="button" data-core-rotate="right" aria-label="Rotate core right" title="Rotate right"><span aria-hidden="true">&#8594;</span></button><button type="button" data-core-rotate="up" aria-label="Tilt core up" title="Tilt up"><span aria-hidden="true">&#8593;</span></button><button type="button" data-core-rotate="down" aria-label="Tilt core down" title="Tilt down"><span aria-hidden="true">&#8595;</span></button></div>
      <button type="button" data-core-view="perspective" aria-pressed="true">Reset view</button><button type="button" data-core-view="end" aria-pressed="false">End view</button><button type="button" data-core-pause aria-pressed="false">Pause motion</button>
    </div></div><p class="visually-hidden" data-core-status role="status" aria-live="polite"></p>
  </figure>`;
}

const applications = [
  { id: 'insulator-packaging', tag: 'Protective & export packaging', title: 'Insulator manufacturers', text: 'Discuss plastic tube packaging for your insulators, with space for the protection your complete pack requires.', detail: 'Share the insulator dimensions, clearance, cushioning, end closures and transport conditions. The tube is one part of the complete package, not an electrical insulator or a guaranteed protection system.', ask: 'Component size / Clearance / Packing method', art: 'pack' },
  { id: 'tarpaulin', tag: 'Roll support', title: 'Tarpaulin manufacturers', text: 'Start with the roll width, winding fit and handling requirements. Specify the core around the tarpaulin you produce.', detail: 'Share the winding shaft or chuck dimensions, finished roll width, roll weight and how it will be handled. Diameter, wall and length need to be considered together.', ask: 'Winding fit / Roll width / Handling', art: 'roll' },
  { id: 'woven-sacks', tag: 'Winding & conversion', title: 'Woven-sack manufacturers', text: 'Discuss cores for the woven-fabric roll stage of your process, with the dimensions your equipment needs.', detail: 'Tell us where the core sits in your winding or conversion process. Include the existing core bore, outside diameter, length and order quantity. Equipment compatibility is confirmed against your requirement.', ask: 'Core dimensions / Machine fit / Quantity', art: 'woven' },
  { id: 'fabric', tag: 'Fabric & cloth rolls', title: 'Textile & fabric businesses', text: 'Made-to-order cores for rolling, supporting and handling cloth. Bring your existing measurements or a drawing.', detail: 'Include fabric width, shaft or chuck fit, core length and the handling demands of the finished roll. If you are replacing a paper core, explain what needs to change in the current workflow.', ask: 'Fabric width / Bore / Core length', art: 'fabric' },
];

function applicationArt(id) {
  const image = applicationImages[id];
  return `<img class="application-art" src="${image.src}" srcset="${image.small} 600w, ${image.src} 1200w" sizes="(min-width: 1320px) 606px, (min-width: 640px) calc((100vw - 108px) / 2), calc(100vw - 32px)" width="1200" height="800" alt="${image.alt}" loading="lazy" decoding="async">`;
}

function applicationCards(detailed = false) {
  return `<div class="application-grid">${applications.map(item => `<article class="application-card"${detailed ? ` id="${item.id}"` : ''}>
    <div class="application-visual ${item.art}">${applicationArt(item.id)}</div>
    <div class="application-copy"><span class="application-tag">${item.tag}</span><h3>${item.title}</h3><p>${detailed ? item.detail : item.text}</p>${detailed ? `<p class="application-ask">${item.ask}</p>` : ''}<a class="text-link" href="${detailed ? quote : `${coreUrl}#${item.id}`}">${detailed ? 'Discuss your requirement' : 'Explore the application'} <span aria-hidden="true">&#8599;</span></a></div>
  </article>`).join('')}</div><p class="application-disclosure">AI-generated application illustrations, not customer or project photographs. Final fit and packaging design are discussed for your requirement.</p>`;
}

function coreIntro(detail = false) {
  return `<section class="core-hero"><div class="container core-hero-grid"><div class="core-hero-copy">
    <p class="eyebrow"><span class="status-dot" aria-hidden="true"></span> ${detail ? 'PLASTIC REPLACEMENT CORES' : 'CUSTOM PLASTIC CORE MANUFACTURER / AHMEDABAD'}</p>
    <h1>${detail ? 'Your process.<br>Your dimensions.<br><span>Your plastic core.</span>' : 'Plastic cores.<br>Built around<br><span>your business.</span>'}</h1>
    <p class="core-lead">${detail ? 'Made-to-order plastic cores for winding, roll support and protective packaging. A considered replacement starts with the application, not just a diameter.' : 'For the material you wind. The rolls you handle. The products you protect. Made to your diameter, length and order requirements.'}</p>
    <div class="cta-row"><a class="btn btn-primary" href="${quote}">Discuss a core requirement <span aria-hidden="true">&#8599;</span></a><a class="btn btn-quiet" href="${detail ? '#core-specification' : '#core-story'}">${detail ? 'What to specify' : 'Explore the core'} <span aria-hidden="true">&#8595;</span></a></div>
    <div class="hero-contact"><a href="tel:${business.phone}">${business.phoneLabel}</a><span>Manufactured in Ahmedabad, India</span></div>
  </div>${coreScene('hero')}</div><div class="container core-hero-foot"><span>WINDING / ROLL SUPPORT / PROTECTIVE PACKAGING</span><a href="#${detail ? 'core-specification' : 'core-story'}">Scroll to explore <span aria-hidden="true">&#8595;</span></a></div></section>`;
}

function orderSteps() {
  return `<ol class="order-steps"><li><span>01 / APPLICATION</span><h3>Tell us what it needs to do.</h3><p>Describe the material being wound or the product being packed. Include what needs to change from your current core.</p></li><li><span>02 / DIMENSIONS</span><h3>Share the measurements.</h3><p>Bore, outside diameter, length and quantity. A drawing or measured sample helps make the requirement clear.</p></li><li><span>03 / DISCUSSION</span><h3>Confirm before you order.</h3><p>Discuss the specification, feasibility, commercial terms and delivery requirement with our team.</p></li></ol>`;
}

function otherOfferings() {
  return `<section class="section other-offerings"><div class="container"><div class="section-head"><div><p class="eyebrow">BEYOND PLASTIC CORES</p><h2>One business.<br>More ways to work together.</h2></div><p>Our pipe manufacturing, supply and farm installation offerings remain part of Shree Keshar Plastic.</p></div><div class="offering-links">
    <a href="black-pipes-manufacturer.html"><span>Manufactured by us</span><strong>Black pipes</strong><span aria-hidden="true">&#8599;</span></a>
    <a href="products.html#supplied-pipes"><span>Traded &amp; supplied</span><strong>PVC &amp; HDPE pipes</strong><span aria-hidden="true">&#8599;</span></a>
    <a href="farm-pipeline-installation-ahmedabad.html"><span>Within 100 km of Ahmedabad</span><strong>Farm pipeline installation</strong><span aria-hidden="true">&#8599;</span></a>
  </div></div></section>`;
}

const story = `<section class="core-story section" id="core-story"><div class="container"><div class="section-head"><div><p class="eyebrow">A CLOSER LOOK</p><h2>The details make<br>the difference.</h2></div><p>A core has a simple shape. Specifying it well means understanding what happens around it.</p></div><div class="core-story-grid"><div class="core-story-visual">${coreScene('story')}<p class="story-hint">Scroll to explore <span aria-hidden="true">&#8595;</span> &nbsp; / &nbsp; <a href="#applications">Skip to applications</a></p></div><div class="core-chapters">
  <article data-core-chapter><p class="chapter-number">01 / THE FIT</p><h3>Start on the inside.</h3><p>The bore must suit your shaft, chuck or packed product. Share the inside diameter and any clearance your application needs.</p><span class="dimension-tag">Inside diameter / Bore</span></article>
  <article data-core-chapter><p class="chapter-number">02 / THE FORMAT</p><h3>Made around your material.</h3><p>Core length, outside diameter and wall requirement belong in the same conversation. Include roll width, handling conditions and machine fit.</p><span class="dimension-tag">Length / Outside diameter / Wall</span></article>
  <article data-core-chapter><p class="chapter-number">03 / THE ORDER</p><h3>Bring the whole requirement.</h3><p>Tell us the quantity, application and delivery location. We discuss the specification and order terms before manufacturing.</p><a class="text-link" href="${quote}">Start the conversation <span aria-hidden="true">&#8599;</span></a></article>
</div></div></div></section>`;

export const coreHome = coreIntro()
  + `<section class="application-strip" aria-label="Applications to discuss"><div class="container"><p>Made for your next requirement</p><ul><li>Insulator packaging</li><li>Tarpaulin</li><li>Woven sacks</li><li>Textiles</li></ul></div></section>`
  + story
  + section('Different businesses.<br>One well-considered core.', applicationCards(), { eyebrow: 'APPLICATIONS', intro: 'Choose the application closest to your work. We will start with the details that matter to your business.', tone: 'core-applications', id: 'applications' })
  + `<section class="section core-about"><div class="container two-col"><div><p class="eyebrow">SHREE KESHAR PLASTIC / AHMEDABAD</p><h2>A manufacturing business.<br>A direct conversation.</h2></div><div class="reading-copy"><p>We manufacture plastic replacement cores against business requirements for diameter, length and order quantity. Speak with us about your current paper core, winding setup or protective packaging requirement.</p><p>Our manufactured range also includes black pipes. PVC and HDPE are supplied separately, alongside complete farm pipeline installation.</p><a class="text-link" href="about.html">Get to know the company <span aria-hidden="true">&#8599;</span></a></div></div></section>`
  + section('From your requirement<br>to a clear conversation.', orderSteps(), { eyebrow: 'HOW TO START', intro: 'You do not need a finished technical brief to get in touch. Start with the application and the dimensions you know.', id: 'how-to-order' })
  + otherOfferings()
  + closing('Let\'s talk about your next core.', 'Share your application, dimensions and quantity. We will discuss the requirement directly with you.', 'cores');

export const coreProduct = coreIntro(true)
  + section('A specification, not a guess.', `<div class="specification-grid"><div class="spec-heading"><h3>Four details.<br>A useful starting point.</h3><p>These are quotation inputs, not a published stock-size list. Core dimensions are made to order.</p><a class="text-link" href="${quote}">Share a drawing or requirement &#8599;</a></div><dl class="core-spec-list"><div><dt>Inside diameter</dt><dd>The opening that fits your shaft, chuck or packed item.</dd></div><div><dt>Outside diameter &amp; wall</dt><dd>The external dimension and wall requirement for the intended application.</dd></div><div><dt>Finished length</dt><dd>The core length, units and any cut-length tolerance you require.</dd></div><div><dt>Quantity &amp; application</dt><dd>How many you need, what they will do and where they need to go.</dd></div></dl></div>`, { eyebrow: 'THE BUYING BRIEF', id: 'core-specification', tone: 'muted-section' })
  + section('What will your core support?', applicationCards(true), { eyebrow: 'APPLICATION-SPECIFIC CONVERSATIONS', intro: 'Winding and packaging need different specifications. Use these starting points to prepare your enquiry.', tone: 'core-applications', id: 'applications' })
  + section('Replacing a paper tube?<br>Start with what needs to change.', `<div class="two-col"><div class="reading-copy"><p>Tell us if the current tube deforms during handling, softens in storage or does not suit the intended reuse. The replacement should be evaluated against that specific requirement.</p><p>Material, wall thickness, fit and operating conditions affect performance. Discuss a fit or handling assessment before a repeat order rather than assuming all plastic cores behave the same way.</p></div><div class="core-question"><span class="eyebrow">YOUR CURRENT CORE</span><h3>What works?<br>What needs to improve?</h3><p>Share a photograph, dimensions or drawing when you contact us. Include the process and handling conditions.</p><a class="btn btn-primary" href="${quote}">Discuss a replacement &#8599;</a></div></div>`)
  + faq([
    ['Can you make cores to our diameter and length?', 'Yes. We manufacture based on the business requirement and order. Share the inside and outside diameters, wall requirement, length, quantity and application so feasibility can be discussed.'],
    ['Do you supply tubes for insulator export packaging?', 'Protective packaging for insulators is an application to discuss with us. Share component dimensions, clearance, cushioning, closure and transport requirements. These tubes are packaging components, not electrical insulators; suitability depends on the complete packing design.'],
    ['Can you replace the paper cores used on our line?', 'Send the existing core measurements, machine-fit requirements and the problem you want to address. The replacement specification and suitability need to be discussed for your process.'],
    ['What are your minimum order and lead time?', 'Quantity, specification and delivery requirements are discussed with the quotation. No fixed minimum order or production lead time is published here.'],
  ]) + closing('Your requirement is the starting point.', 'Send the application, inside and outside diameters, length, quantity and delivery location.', 'cores');

export const coreIndustries = `<section class="section industry-intro"><div class="container"><p class="eyebrow">INDUSTRIES &amp; APPLICATIONS</p><h1>For what you protect.<br><span>For what you wind.</span></h1><div class="industry-intro-bottom"><p>From insulator export packaging to tarpaulin and fabric winding, the application sets the specification. Tell us what your business makes, handles or protects.</p><a class="btn btn-primary" href="${quote}">Discuss your application &#8599;</a></div></div></section>`
  + section('Find your application.', applicationCards(true), { tone: 'core-applications', intro: 'Application guidance for prospective buyers, not a list of customer endorsements.' })
  + section('A straightforward buying conversation.', orderSteps(), { eyebrow: 'WORK WITH US' })
  + otherOfferings() + closing('A different application in mind?', 'Describe the product, process and dimensions. We can discuss whether a made-to-order plastic core fits the requirement.', 'cores');
