/**
 * "What do you want us to build" — client-side only.
 * No innerHTML with user or generated data. The WhatsApp text is
 * built as a string and passed through encodeURIComponent.
 */
import { WHATSAPP } from './form.js';

/** Exact line shown and sent for any selected service that is not Websites. */
export const OTHER_SERVICES_NOTE =
  'Other services are quoted separately; the final quote comes after we talk.';

/**
 * Suggest a website plan only when Websites is selected, using the existing
 * website-plan inclusions and labelled "suggested". Other services never
 * change the plan: they are quoted separately.
 * Without a page count from the client, the suggested starting plan is
 * Starter (one landing page, one revision round, about one week).
 */
export function suggestPlan(services) {
  if (!Array.isArray(services) || !services.includes('Websites')) return null;
  return { id: 'Starter', price: '250 PLN' };
}

export function otherServicesNote(services) {
  if (!Array.isArray(services)) return '';
  return services.some((s) => s !== 'Websites') ? OTHER_SERVICES_NOTE : '';
}

export function collectPages(services, data) {
  const pages = [];
  for (const s of services) {
    const entry = data.services[s];
    if (!entry) continue;
    for (const p of entry.pages) {
      if (!pages.includes(p)) pages.push(p);
    }
  }
  return pages;
}

export function collectFeatures(services, data) {
  const features = [];
  for (const s of services) {
    const entry = data.services[s];
    if (!entry) continue;
    for (const f of entry.features) features.push(f);
  }
  return features;
}

export function buildOverviewText({ services, palette, style, pages, features, plan, otherNote }) {
  const lines = [
    'Hello Vira,',
    'I used the project builder on your site.',
    '',
    'Services: ' + services.join(', ') + '.',
    'Palette: ' + palette + '.',
    'Style: ' + style + '.'
  ];
  if (pages.length) lines.push('Suggested pages: ' + pages.join(', ') + '.');
  if (features.length) {
    lines.push('Suggested features:');
    for (const f of features) lines.push('- ' + f);
  }
  if (plan) {
    lines.push(
      'Suggested plan: ' + plan.id + ' (' + plan.price + '). This is a suggestion only, for the website work.'
    );
  }
  const note = otherNote != null ? otherNote : otherServicesNote(services);
  if (note) lines.push(note);
  return lines.join('\n');
}

export function buildWhatsAppBuilderUrl(text) {
  return 'https://wa.me/' + WHATSAPP.RW.e164 + '?text=' + encodeURIComponent(text);
}

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

function fillList(ul, items) {
  ul.replaceChildren();
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    ul.append(li);
  }
}

export function initBuilder() {
  const root = document.getElementById('builder');
  if (!root) return;

  const form = document.getElementById('builder-form');
  const overview = document.getElementById('builder-overview');
  const send = document.getElementById('builder-send');
  if (!form || !overview || !send) return;

  let data = null;

  const render = () => {
    if (!data) return;
    const services = [...form.querySelectorAll('input[name="b-service"]:checked')].map((i) => i.value);
    const palEl = form.querySelector('input[name="b-palette"]:checked');
    const stEl = form.querySelector('input[name="b-style"]:checked');
    const palette = palEl ? palEl.value : '';
    const style = stEl ? stEl.value : '';
    const palName = palEl ? (palEl.getAttribute('data-label') || palette) : '';
    const stName = stEl ? (stEl.getAttribute('data-label') || style) : '';

    const ready = services.length > 0 && palette && style;
    const plan = suggestPlan(services);
    const pages = collectPages(services, data);
    const features = collectFeatures(services, data);

    const svcOut = overview.querySelector('[data-ov="services"]');
    const palOut = overview.querySelector('[data-ov="palette"]');
    const stOut = overview.querySelector('[data-ov="style"]');
    const pagesOut = overview.querySelector('[data-ov="pages"]');
    const featOut = overview.querySelector('[data-ov="features"]');
    const planOut = overview.querySelector('[data-ov="plan"]');

    if (svcOut) svcOut.textContent = services.length ? services.join(', ') : 'Choose at least one service.';
    if (palOut) palOut.textContent = palName || 'Choose a palette.';
    if (stOut) stOut.textContent = stName || 'Choose a style.';
    if (pagesOut) fillList(pagesOut, pages);
    if (featOut) fillList(featOut, features);
    const otherNote = otherServicesNote(services);
    if (planOut) {
      planOut.textContent = plan
        ? ('Suggested plan: ' + plan.id + ' — ' + plan.price + '. This is a suggestion only, for the website work.')
        : '';
    }
    const otherOut = overview.querySelector('[data-ov="other"]');
    if (otherOut) otherOut.textContent = otherNote;

    overview.hidden = !ready;
    if (ready) {
      const text = buildOverviewText({
        services,
        palette: palName,
        style: stName,
        pages,
        features,
        plan,
        otherNote
      });
      send.setAttribute('href', buildWhatsAppBuilderUrl(text));
      send.removeAttribute('aria-disabled');
      send.hidden = false;
    } else {
      send.removeAttribute('href');
      send.setAttribute('aria-disabled', 'true');
      send.hidden = true;
    }
  };

  fetch('js/builder-data.json', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      data = json;
      render();
    })
    .catch(() => {});

  form.addEventListener('change', render);
  send.addEventListener('click', (e) => {
    if (send.getAttribute('aria-disabled') === 'true' || !send.getAttribute('href')) {
      e.preventDefault();
    }
  });
}
