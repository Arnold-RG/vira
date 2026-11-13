import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WHATSAPP } from './form.js';
import {
  suggestPlan,
  otherServicesNote,
  OTHER_SERVICES_NOTE,
  collectPages,
  collectFeatures,
  buildOverviewText,
  buildWhatsAppBuilderUrl
} from './builder.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'js/builder-data.json'), 'utf8'));
const html = readFileSync(join(root, 'index.html'), 'utf8');

const NOTE = 'Other services are quoted separately; the final quote comes after we talk.';

test('builder mapping covers all 11 services and suggests a plan only for Websites', () => {
  const names = Object.keys(data.services);
  assert.equal(names.length, 11);

  assert.deepEqual(suggestPlan(['Websites']), { id: 'Starter', price: '250 PLN' });
  // Other services do not size or replace the website plan.
  assert.deepEqual(suggestPlan(['Websites', 'Tech support']), { id: 'Starter', price: '250 PLN' });
  assert.deepEqual(suggestPlan(['Websites', 'Apps', 'AI creation']), { id: 'Starter', price: '250 PLN' });
  assert.equal(suggestPlan(['Apps']), null);
  assert.equal(suggestPlan(['AI creation']), null);
  assert.equal(suggestPlan(['Games']), null);
  assert.equal(suggestPlan(['Business management', 'Tech support']), null);
  assert.equal(suggestPlan([]), null);

  assert.equal(otherServicesNote(['Websites']), '');
  assert.equal(otherServicesNote(['Apps']), NOTE);
  assert.equal(otherServicesNote(['Websites', 'Apps']), NOTE);
  assert.equal(OTHER_SERVICES_NOTE, NOTE);

  const pages = collectPages(['Websites'], data);
  const feats = collectFeatures(['Websites'], data);
  assert.ok(pages.includes('Home'));
  assert.ok(feats.length > 0);
  for (const name of names) {
    assert.ok(html.includes(name) || html.includes(name.replace(' and ', ' &amp; ')), 'service missing from page: ' + name);
  }
});

test('builder WhatsApp URL targets Rwanda and encodes the overview', () => {
  const text = buildOverviewText({
    services: ['Websites', 'Apps'],
    palette: 'Vira',
    style: 'Editorial',
    pages: ['Home', 'About', 'Contact'],
    features: ['A contact form'],
    plan: suggestPlan(['Websites', 'Apps']),
    otherNote: otherServicesNote(['Websites', 'Apps'])
  });
  assert.match(text, /Websites, Apps/);
  assert.match(text, /Suggested plan: Starter \(250 PLN\)/);
  assert.match(text, /suggestion only, for the website work/);
  assert.match(text, /The final quote comes after we talk/);
  assert.ok(text.includes(NOTE));
  assert.equal(text.includes('Super'), false);
  assert.equal(text.includes('700 PLN'), false);

  const appsOnly = buildOverviewText({
    services: ['Apps'],
    palette: 'Vira',
    style: 'Minimal',
    pages: ['Home'],
    features: ['A focused set of screens for one real task'],
    plan: suggestPlan(['Apps']),
    otherNote: otherServicesNote(['Apps'])
  });
  assert.equal(/Suggested plan:/.test(appsOnly), false);
  assert.ok(appsOnly.includes(NOTE));

  const sitesOnly = buildOverviewText({
    services: ['Websites'],
    palette: 'Vira',
    style: 'Minimal',
    pages: ['Home'],
    features: ['A contact form'],
    plan: suggestPlan(['Websites']),
    otherNote: otherServicesNote(['Websites'])
  });
  assert.match(sitesOnly, /Suggested plan: Starter \(250 PLN\)/);
  assert.match(sitesOnly, /The final quote comes after we talk/);
  assert.equal(sitesOnly.includes(NOTE), false);

  const url = buildWhatsAppBuilderUrl(text);
  assert.ok(url.startsWith('https://wa.me/' + WHATSAPP.RW.e164 + '?text='));
  assert.equal(url.includes(' '), false);
  assert.equal(url.includes('48575217930'), false);
  const decoded = decodeURIComponent(url.split('text=')[1]);
  assert.equal(decoded, text);
  assert.equal(url, 'https://wa.me/' + WHATSAPP.RW.e164 + '?text=' + encodeURIComponent(text));
});
