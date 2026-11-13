/* Site configuration. Empty arrays and unset URLs are intentional — do not invent content. */

/*
 * TODO: HERO_VIDEO — the owner has not picked a hero background yet.
 * Valid values: '01-black-silk' | '02-liquid-metal' | '03-smoke' | '04-digital-grid'
 * Default is option 2 (liquid metal) so the component is wired and reviewable.
 * Change this one value to switch the hero clip and poster.
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
    poster: 'assets/video/02-liquid-metal.jpg',
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
  tiktok: '',
  github: 'https://github.com/Arnold-RG'
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
    alt: 'A close view of code on a computer screen'
  },
  {
    title: 'Web systems and dashboards',
    body: 'Custom web apps, private dashboards, booking and management tools tailored to how you work.',
    image: 'assets/photo-dashboard.jpg',
    alt: 'A laptop showing an analytics dashboard'
  },
  {
    title: 'Automation',
    body: 'Routines, reports and workflows that run on their own and free hours from your week.',
    image: 'assets/photo-servers.jpg',
    alt: 'Rows of network cables in a server rack'
  },
  {
    title: 'Security and QA',
    body: 'Code review, testing, privacy checks and security hardening for new or existing projects.',
    image: 'assets/photo-circuit.jpg',
    alt: 'Glowing circuit board lines'
  }
];
