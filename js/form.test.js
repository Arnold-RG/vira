import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppUrl, WHATSAPP } from './form.js';

test('Poland opens wa.me with the business number and encoded text', () => {
  const url = buildWhatsAppUrl({
    region: 'PL',
    name: 'Ada Nowak',
    service: 'Websites & web systems',
    message: 'I need a three-page site.',
    plan: 'Basic',
    currency: 'PLN'
  });
  assert.ok(url.startsWith('https://wa.me/' + WHATSAPP.PL.e164 + '?text='));
  const text = decodeURIComponent(url.split('text=')[1]);
  assert.match(text, /Ada Nowak/);
  assert.match(text, /Websites & web systems/);
  assert.match(text, /Plan: Basic/);
  assert.match(text, /three-page site/);
  assert.equal(url.includes(' '), false);
  assert.equal(url.includes('rurangwaarnold'), false);
  assert.equal(url.includes('mailto:'), false);
});

test('Rwanda uses the Rwanda number', () => {
  const url = buildWhatsAppUrl({
    region: 'RW',
    name: 'Jean',
    service: 'Tech support',
    message: 'Need a network check.'
  });
  assert.ok(url.startsWith('https://wa.me/' + WHATSAPP.RW.e164 + '?text='));
  assert.equal(url.includes('48575217930'), false);
});

test('unknown region is empty (no fallback mailto)', () => {
  assert.equal(buildWhatsAppUrl({ region: 'XX', name: 'A', service: 'B', message: 'C' }), '');
});

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRIMARY_REGION, CONTACT_ORDER } from './form.js';

const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../index.html'), 'utf8');

test('Rwanda is Main, is listed first, and Poland is Backup', () => {
  assert.deepEqual(CONTACT_ORDER, ['RW', 'PL']);
  assert.equal(PRIMARY_REGION, 'RW');
  assert.equal(WHATSAPP.RW.role, 'Main');
  assert.equal(WHATSAPP.PL.role, 'Backup');
  assert.equal(Object.keys(WHATSAPP)[0], 'RW');

  const wa = [...html.matchAll(/https:\/\/wa\.me\/(\d+)/g)].map((m) => m[1]);
  assert.ok(wa.length >= 2);
  assert.equal(wa[0], WHATSAPP.RW.e164);
  assert.equal(wa[1], WHATSAPP.PL.e164);
  // every pair in the page (cards, footer) is Rwanda then Poland
  for (let i = 0; i + 1 < wa.length; i += 2) {
    assert.equal(wa[i], WHATSAPP.RW.e164);
    assert.equal(wa[i + 1], WHATSAPP.PL.e164);
  }

  const tel = html.match(/"telephone":\s*\[([^\]]+)\]/)[1];
  assert.ok(tel.indexOf('+250') < tel.indexOf('+48'));
  assert.ok(html.indexOf('WhatsApp, Main: +250 794 607 518 (Rwanda)') < html.indexOf('WhatsApp, Backup: +48 575 217 930 (Poland)'));
});

test('form defaults to Rwanda', () => {
  const radios = [...html.matchAll(/<input type="radio" name="region" value="(\w+)"([^>]*)>/g)];
  assert.equal(radios[0][1], 'RW');
  assert.match(radios[0][2], /\bchecked\b/);
  const pl = radios.find((r) => r[1] === 'PL');
  assert.ok(pl);
  assert.equal(/\bchecked\b/.test(pl[2]), false);
});

test('primary WhatsApp CTA points at the Rwanda number', () => {
  const tags = [...html.matchAll(/<a\s[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => tag.includes('btn-wa-primary'));
  assert.ok(tags.length >= 1, 'expected a primary WhatsApp CTA');
  for (const tag of tags) {
    assert.match(tag, /href="https:\/\/wa\.me\/250794607518"/);
    assert.equal(tag.includes('48575217930'), false);
  }
});
