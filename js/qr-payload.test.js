import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zbpPayload, epcPayload, qrReadyFor } from './qr-payload.js';
import { QR_CONFIG } from './qr-config.js';

// Test-only dummies. These must never appear on the page or in QR_CONFIG.
const DUMMY = {
  name: 'Example Recipient Spzoo',
  account: '11112222333344445555666677',
  nip: '',
  title: 'Order 42',
  amountGrosze: '12345',
  bic: 'EXAMPPLPW',
  iban: 'PL11112222333344445555666677',
  amountEur: '12.3'
};

test('ZBP payload is pipe-separated with empty NIP, PL, grosze, name, title and trailing pipes', () => {
  const s = zbpPayload({
    nip: DUMMY.nip,
    country: 'PL',
    account: DUMMY.account,
    amountGrosze: DUMMY.amountGrosze,
    name: DUMMY.name,
    title: DUMMY.title
  });
  assert.equal(
    s,
    '|PL|11112222333344445555666677|12345|Example Recipient Spzoo|Order 42|||'
  );
});

test('EPC payload is BCD 002 SCT with BIC, name, IBAN, EUR amount, empty purpose and title', () => {
  const s = epcPayload({
    bic: DUMMY.bic,
    name: DUMMY.name,
    iban: DUMMY.iban,
    amountEur: DUMMY.amountEur,
    title: DUMMY.title
  });
  assert.equal(
    s,
    'BCD\n002\n1\nSCT\nEXAMPPLPW\nExample Recipient Spzoo\nPL11112222333344445555666677\nEUR12.30\n\nOrder 42'
  );
});

test('live QR_CONFIG stays empty and dummy strings are not on the page', async () => {
  assert.equal(QR_CONFIG.recipientName, null);
  assert.equal(QR_CONFIG.bic, null);
  assert.equal(QR_CONFIG.eurIban, null);
  assert.equal(QR_CONFIG.plnIban, null);
  assert.equal(qrReadyFor('PLN', QR_CONFIG), false);
  assert.equal(qrReadyFor('EUR', QR_CONFIG), false);

  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const cfg = readFileSync(join(root, 'js/qr-config.js'), 'utf8');
  for (const n of [DUMMY.name, DUMMY.account, DUMMY.iban, DUMMY.bic]) {
    assert.equal(html.includes(n), false, 'dummy on page: ' + n);
    assert.equal(cfg.includes(n), false, 'dummy in live config: ' + n);
  }
});
