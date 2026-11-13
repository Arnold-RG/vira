/**
 * Light request form: opens WhatsApp click-to-chat in a new tab.
 * Nothing is stored. There is no backend.
 */

export const PRIMARY_REGION = 'RW';
export const CONTACT_ORDER = ['RW', 'PL'];

export const WHATSAPP = {
  RW: { e164: '250794607518', display: '+250 794 607 518 (Rwanda)', role: 'Main' },
  PL: { e164: '48575217930', display: '+48 575 217 930 (Poland)', role: 'Backup' }
};

export function buildWhatsAppUrl(payload) {
  const entry = WHATSAPP[payload.region];
  if (!entry) return '';
  const lines = [
    'Hello Vira, my name is ' + payload.name + '.',
    'I would like help with: ' + payload.service + '.'
  ];
  if (payload.plan) lines.push('Plan: ' + payload.plan + '.');
  if (payload.currency) lines.push('Currency shown: ' + payload.currency + '.');
  lines.push('', payload.message);
  return 'https://wa.me/' + entry.e164 + '?text=' + encodeURIComponent(lines.join('\n'));
}

function showError(form, name, message) {
  const el = form.querySelector('[data-error-for="' + name + '"]');
  if (!el) return;
  if (message) {
    el.textContent = message;
    el.hidden = false;
  } else {
    el.textContent = '';
    el.hidden = true;
  }
}

function validate(form) {
  const name = (form.name.value || '').trim();
  const service = (form.service.value || '').trim();
  const message = (form.message.value || '').trim();
  const region = (form.region && form.region.value) || '';
  const plan = (form.plan && form.plan.value) ? form.plan.value.trim() : '';
  const currency = (form.currency && form.currency.value) || '';
  let ok = true;

  if (name.length < 2) { showError(form, 'name', 'Please tell us your name.'); ok = false; }
  else showError(form, 'name', '');

  if (!service) { showError(form, 'service', 'Please choose a project type.'); ok = false; }
  else showError(form, 'service', '');

  if (message.length < 8) { showError(form, 'message', 'Please add a short message.'); ok = false; }
  else showError(form, 'message', '');

  if (!WHATSAPP[region]) { showError(form, 'region', 'Please choose Poland or Rwanda.'); ok = false; }
  else showError(form, 'region', '');

  return ok ? { name, service, message, region, plan, currency } : null;
}

function openWhatsApp(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const run = () => validate(form);
  ['name', 'service', 'message'].forEach((n) => {
    const el = form.elements[n];
    if (el) el.addEventListener('blur', run);
  });
  form.querySelectorAll('input[name="region"]').forEach((el) => {
    el.addEventListener('change', run);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = validate(form);
    if (!data) return;
    const url = buildWhatsAppUrl(data);
    if (url) openWhatsApp(url);
  });
}
