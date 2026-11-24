// Owner-confirmed business facts; core application positioning updated 24 November 2026.
export const business = {
  name: 'Shree Keshar Plastic',
  url: 'https://shreekesharplastic.com',
  phone: '+919426391608',
  phoneLabel: '+91 94263 91608',
  whatsapp: '919426391608',
  email: 'info@shreekesharplastic.com',
  street: '101, Shreenath Shoping Center, Nr. Bhumaria Kuva, Lambha Turning, Narol-Aslali Road, Narol',
  locality: 'Ahmedabad',
  region: 'Gujarat',
  installationRadiusKm: 100,
  installationScope: ['Pipe supply', 'Trenching', 'Laying', 'Jointing', 'Testing', 'Backfilling'],
  profile: 'https://share.google/bCspryhj61rpTdYlm',
  logo: { src: 'assets/brand/shree-keshar-plastic-logo.png', width: 1254, height: 1254 },
};

export const blackPipeSizes = [
  { inches: 2, maxLength: '100 metres', format: 'Continuous coil' },
  { inches: 3, maxLength: '100 metres', format: 'Continuous coil' },
  { inches: 4, maxLength: '100 metres', format: 'Continuous coil' },
  { inches: 5, maxLength: '20 feet', format: 'Confirm format with your order' },
  { inches: 6, maxLength: '20 feet', format: 'Confirm format with your order' },
  { inches: 8, maxLength: '20 feet', format: 'Confirm format with your order' },
  { inches: 10, maxLength: '20 feet', format: 'Confirm format with your order' },
];

export const images = {
  black: { src: 'assets/black-pipes-stock-optimized.jpg', small: 'assets/black-pipes-700.jpg', width: 1400, height: 1050, alt: 'Coiled black pipes in front of stacked straight pipe lengths', caption: 'Black pipe stock: coils and straight lengths' },
  blackRoll: { src: 'assets/black-pipe-rolls/black-pipe-roll.jpg', small: 'assets/black-pipe-rolls/black-pipe-roll-600.jpg', smallWidth: 600, width: 1086, height: 1448, portrait: true, alt: 'Single black pipe roll secured with rope against a brick wall', caption: 'Black pipe roll manufactured by Shree Keshar Plastic. Colour-corrected photograph.' },
  blackRolls: { src: 'assets/black-pipe-rolls/black-pipe-rolls-stacked.jpg', small: 'assets/black-pipe-rolls/black-pipe-rolls-stacked-600.jpg', smallWidth: 600, width: 1086, height: 1448, portrait: true, alt: 'Stacked black pipe rolls secured with rope, with an upright roll behind them', caption: 'Black pipe rolls manufactured by Shree Keshar Plastic. Colour-corrected photograph.' },
  pvc: { src: 'assets/redesign/PVC2.jpg', width: 612, height: 459, alt: 'Grey PVC pipes with socket ends in several diameters', caption: 'PVC product reference; supplied, not manufactured by us' },
  core: { src: 'assets/paper-tube-replacement-comparison.png', width: 401, height: 370, alt: 'Illustration of a black plastic core beside a paper tube', caption: 'Product illustration, not a performance test' },
  coreStudy: { src: 'assets/core-study.svg', width: 800, height: 700, alt: 'Illustration of a hollow plastic replacement core with visible bore', caption: 'Plastic core product illustration. Dimensions are made to order; not to scale.' },
  coreShare: { src: 'assets/core-share.jpg', width: 1440, height: 810, alt: 'Shree Keshar Plastic custom plastic core manufacturing homepage with an illustrative hollow core' },
  trencher: { src: 'https://i.ytimg.com/vi/5yqJE24A1k8/maxresdefault.jpg', width: 1280, height: 720, alt: 'YouTube thumbnail for the linked trencher demonstration', caption: 'Trencher video reference; not a documented completed project', video: 'https://www.youtube.com/shorts/5yqJE24A1k8' },
};

export const applicationImages = {
  'insulator-packaging': { src: 'assets/core-applications/insulator-packaging.jpg', small: 'assets/core-applications/insulator-packaging-600.jpg', alt: 'Concept illustration of a black protective tube beside a ceramic insulator and cushioning rings' },
  tarpaulin: { src: 'assets/core-applications/tarpaulin.jpg', small: 'assets/core-applications/tarpaulin-600.jpg', alt: 'Concept illustration of blue tarpaulin wound around a hollow black plastic core' },
  'woven-sacks': { src: 'assets/core-applications/woven-sacks.jpg', small: 'assets/core-applications/woven-sacks-600.jpg', alt: 'Concept illustration of a long, wide woven polypropylene fabric roll supported by a full-length black plastic core' },
  fabric: { src: 'assets/core-applications/fabric.jpg', small: 'assets/core-applications/fabric-600.jpg', alt: 'Concept illustration of beige and slate-blue textile rolls with black plastic winding cores' },
};

export const products = [
  { id: 'cores', name: 'Plastic Replacement Cores', file: 'paper-tube-replacement-pipes.html', role: 'Made to order', image: 'coreStudy', text: 'Manufactured to your diameter, length and order requirements.', bullets: ['Fabric and tarpaulin winding', 'Woven-fabric roll requirements', 'Protective and export packaging'], cta: 'Discuss a custom core' },
  { id: 'black', name: 'Black Pipes', file: 'black-pipes-manufacturer.html', role: 'Manufactured by us', image: 'blackRoll', text: 'OD-based inch trade sizes for dimension-led OEM and industrial enquiries.', bullets: ['2, 3, 4, 5, 6, 8 and 10-inch sizes', '2, 3 and 4-inch coils up to 100 m', '5, 6, 8 and 10-inch lengths up to 20 ft'], cta: 'View black pipe sizes' },
  { id: 'pvc', name: 'PVC Pipes', file: 'pvc-pipes-ahmedabad.html', role: 'Traded / supplied', image: 'pvc', text: 'PVC supply across sizes for farm, contractor and project requirements.', bullets: ['Share size, class and quantity', 'Confirm availability before ordering', 'Material and installation enquiries'], cta: 'Explore PVC supply' },
  { id: 'hdpe', name: 'HDPE Pipes', file: 'hdpe-pipes-ahmedabad.html', role: 'Traded / supplied', text: 'HDPE supply across sizes, selected around the specification your project needs.', bullets: ['Size, grade and pressure-class enquiry', 'Confirm length and supplied format', 'Farm and contractor requirements'], cta: 'Explore HDPE supply' },
];

export const requirementOptions = [
  ...products.map(({ id, name }) => ({ id, name })),
  { id: 'installation', name: 'Farm pipeline installation' },
  { id: 'guidance', name: 'Help choosing a pipe or core' },
];
