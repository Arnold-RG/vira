/**
 * PLN and EUR QR cards next to the bank-details reveal.
 * Until QR_CONFIG is filled, each card is a placeholder.
 * When the required fields are present, a QR is drawn on a canvas
 * (no data: URLs, so the CSP can stay img-src 'self') after "Show bank details".
 */
import { qrcode } from './vendor/qrcode.mjs';
import { listAccounts } from './payments.js';
import { QR_CONFIG } from './qr-config.js';
import { zbpPayload, epcPayload, qrReadyFor } from './qr-payload.js';

function placeholder(currency) {
  const card = document.createElement('div');
  card.className = 'qr-card';
  const frame = document.createElement('div');
  frame.className = 'qr-frame';
  frame.setAttribute('aria-hidden', 'true');
  const label = document.createElement('p');
  label.className = 'qr-label';
  const title = document.createElement('span');
  title.className = 'qr-ccy';
  title.textContent = currency;
  const msg = document.createElement('span');
  msg.textContent = 'QR code coming soon, ask on WhatsApp';
  label.append(title, msg);
  card.append(frame, label);
  return card;
}

function drawQr(payload) {
  const qr = qrcode(0, 'M');
  qr.addData(payload);
  qr.make();
  const n = qr.getModuleCount();
  const cell = 4;
  const pad = 4;
  const canvas = document.createElement('canvas');
  canvas.width = n * cell + pad * 2;
  canvas.height = n * cell + pad * 2;
  canvas.className = 'qr-canvas';
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#E5E4E2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1A120D';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) ctx.fillRect(pad + c * cell, pad + r * cell, cell, cell);
    }
  }
  return canvas;
}

function liveCard(currency, payload) {
  const card = document.createElement('div');
  card.className = 'qr-card';
  const frame = document.createElement('div');
  frame.className = 'qr-frame is-live';
  frame.append(drawQr(payload));
  const label = document.createElement('p');
  label.className = 'qr-label';
  const title = document.createElement('span');
  title.className = 'qr-ccy';
  title.textContent = currency;
  const msg = document.createElement('span');
  msg.textContent = 'Scan to open a transfer. Confirm on WhatsApp before paying.';
  label.append(title, msg);
  card.append(frame, label);
  return card;
}

function payloadFor(acc) {
  const cfg = QR_CONFIG;
  if (!qrReadyFor(acc.currency, cfg)) return '';
  if (acc.currency === 'PLN') {
    return zbpPayload({
      account: acc.digits,
      name: cfg.recipientName,
      title: cfg.defaultTitle || ''
    });
  }
  if (acc.currency === 'EUR') {
    return epcPayload({
      bic: cfg.bic,
      name: cfg.recipientName,
      iban: cfg.eurIban,
      title: cfg.defaultTitle || ''
    });
  }
  return '';
}

function render(root, { forcePlaceholder = false } = {}) {
  const accounts = listAccounts();
  root.replaceChildren();
  for (const acc of accounts) {
    const payload = forcePlaceholder ? '' : payloadFor(acc);
    root.append(payload ? liveCard(acc.currency, payload) : placeholder(acc.currency));
  }
}

export function initQr() {
  const root = document.getElementById('qr-cards');
  const toggle = document.getElementById('bank-toggle');
  if (!root) return;
  // Placeholders first. A live QR is drawn on the same "Show bank details" click
  // once QR_CONFIG has the required fields.
  render(root, { forcePlaceholder: true });
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    render(root, { forcePlaceholder: !open });
  });
}
