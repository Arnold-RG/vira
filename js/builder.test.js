import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WHATSAPP } from './form.js';
import {
  suggestPlan,
  collectPages,
  collectFeatures,
  buildOverviewText,
  buildWhatsAppBuilderUrl
} from './builder.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'js/builder-data.json'), 'utf8'));
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('builder mapping covers all 11 services and suggests an existing plan', () => {
  const names = Object.keys(data.services);
  assert.equal(names.length, 11);
  assert.equal(suggestPlan(['Websites']).id, 'Starter');
  assert.equal(suggestPlan(['Websites', 'Tech support']).id, 'Basic');
  assert.equal(suggestPlan(['Apps']).id, 'Super');
  assert.equal(suggestPlan(['AI creation']).id, 'Premium Plus');
  assert.equal(suggestPlan(['Websites']).price, '250 PLN');
  assert.equal(suggestPlan(['AI creation']).price, '1000 PLN');
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
    plan: { id: 'Super', price: '700 PLN' }
  });
  assert.match(text, /Websites, Apps/);
  assert.match(text, /Suggested plan: Super \(700 PLN\)/);
  assert.match(text, /suggestion only/);
  const url = buildWhatsAppBuilderUrl(text);
  assert.ok(url.startsWith('https://wa.me/' + WHATSAPP.RW.e164 + '?text='));
  assert.equal(url.includes(' '), false);
  assert.equal(url.includes('48575217930'), false);
  const decoded = decodeURIComponent(url.split('text=')[1]);
  assert.equal(decoded, text);
  assert.equal(url, 'https://wa.me/' + WHATSAPP.RW.e164 + '?text=' + encodeURIComponent(text));
});
