/* Site configuration. Empty arrays and unset URLs are intentional — do not invent content. */

/*
 * The owner picked option 2: liquid metal (Mixkit, free licence).
 * Other prepared clips remain in HERO_VIDEOS if a later swap is wanted.
 */
export const HERO_VIDEO = '02-liquid-metal';

export const HERO_VIDEOS = {
  '01-black-silk': {
    src: 'assets/video/01-black-silk-web.mp4',
    poster: 'assets/video/01-black-silk.jpg',
    label: 'Dark flowing silk'
  },
  '02-liquid-metal': {
    src: 'assets/video/02-liquid-metal-web.mp4',
    webm: 'assets/video/02-liquid-metal-web.webm',
    poster: 'assets/video/02-liquid-metal.jpg',
    posterWebp: 'assets/video/02-liquid-metal.webp',
    label: 'Liquid metal'
  },
  '03-smoke': {
    src: 'assets/video/03-smoke-web.mp4',
    poster: 'assets/video/03-smoke.jpg',
    label: 'Moody smoke'
  },
  '04-digital-grid': {
    src: 'assets/video/04-digital-grid-web.mp4',
    poster: 'assets/video/04-digital-grid.jpg',
    label: 'Digital grid'
  }
};

/* Fallback FX snapshot from https://open.er-api.com/v6/latest/PLN
   on 13 November 2026, 00:02 UTC (base PLN). */
export const FX_RATES = {
  EUR: 0.227,
  USD: 0.251,
  RWF: 372,
  asOf: '13 November 2026',
  source: 'https://open.er-api.com/v6/latest/PLN'
};

/* Prices are fixed in PLN. Feature lists in the markup are generic placeholders. */
export const PLANS = {
  Starter: { pln: 250, key: 'starter' },
  Basic: { pln: 500, key: 'basic' },
  Super: { pln: 700, key: 'super' },
  'Premium Plus': { pln: 1000, key: 'premium' }
};

export const SOCIAL = {
  linkedin: '',
  instagram: '',
  facebook: '',
  x: '',
  youtube: '',
  tiktok: ''
};

export const EVENTS = [];
export const REVIEWS = [];
export const FOUNDING_YEAR = 2026;

/* Only products already published on the previous site. */
export const PRODUCTS = [
  {
    title: 'AI-powered websites',
    body: 'Modern business and personal websites with smart features, built for speed, phones and search.',
    image: 'assets/photo-code.jpg',
    alt: 'A close view of programming code on a laptop screen',
    width: 1600,
    height: 1063
  },
  {
    title: 'Web systems and dashboards',
    body: 'Custom web apps, private dashboards, booking and management tools tailored to how you work.',
    image: 'assets/photo-dashboard.jpg',
    alt: 'A laptop showing a quarterly revenue chart on a wooden desk',
    width: 1600,
    height: 2400
  },
  {
    title: 'Automation',
    body: 'Routines, reports and workflows that run on their own and free hours from your week.',
    image: 'assets/photo-servers.jpg',
    alt: 'A row of server racks with red cables behind mesh doors',
    width: 1600,
    height: 1065
  },
  {
    title: 'Security and QA',
    body: 'Code review, testing, privacy checks and security hardening for new or existing projects.',
    image: 'assets/photo-circuit.jpg',
    alt: 'Close-up of a gold circuit board with silver solder points',
    width: 1600,
    height: 1067
  }
];
