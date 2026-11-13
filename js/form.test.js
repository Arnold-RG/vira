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
