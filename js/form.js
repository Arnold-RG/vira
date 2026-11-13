/**
 * Request-assist form.
 *
 * TODO: delivery is pending the owner's decision (keep the current method,
 * use a dedicated studio address, or a form service). The destination is
 * isolated in deliver() and must not be changed until that decision lands.
 */

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
  const email = (form.email.value || '').trim();
  const service = (form.service.value || '').trim();
  const plan = (form.plan.value || '').trim();
  const message = (form.message.value || '').trim();
  let ok = true;

  if (name.length < 2) { showError(form, 'name', 'Please tell us your name.'); ok = false; }
  else showError(form, 'name', '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(form, 'email', 'Please enter a valid email address.'); ok = false; }
  else showError(form, 'email', '');

  if (!service) { showError(form, 'service', 'Please choose a project type.'); ok = false; }
  else showError(form, 'service', '');

  if (!plan) { showError(form, 'plan', 'Please choose a plan.'); ok = false; }
  else showError(form, 'plan', '');

  if (message.length < 20) { showError(form, 'message', 'Please tell us a little more (at least 20 characters).'); ok = false; }
  else showError(form, 'message', '');

  return ok ? { name, email, service, plan, message } : null;
}

function deliver(payload) {
  const pricing = window.ViraPricing;
  const currency = (pricing && pricing.currency) || (document.getElementById('c-currency') || {}).value || 'PLN';
  const price = pricing && pricing.priceLine ? pricing.priceLine(payload.plan) : '';
  const subject = 'Vira request: ' + payload.plan + ' — ' + payload.name;
  const body = [
    'Name: ' + payload.name,
    'Email: ' + payload.email,
    'Project type: ' + payload.service,
    'Plan: ' + payload.plan + (price ? ' (' + price + ')' : ''),
    'Currency shown: ' + currency,
    '',
    payload.message
  ].join('\n');
  const url = 'mailto:rurangwaarnold32@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  window.location.href = url;
}

export function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const run = () => validate(form);
  ['name', 'email', 'service', 'plan', 'message'].forEach((n) => {
    const el = form.elements[n];
    if (el) el.addEventListener('blur', run);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = validate(form);
    if (!data) return;
    deliver(data);
  });
}
