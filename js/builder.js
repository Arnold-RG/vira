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
 * Basic (250 PLN).
 */
export function suggestPlan(services) {
  if (!Array.isArray(services) || !services.includes('Websites')) return null;
  return { id: 'Basic', price: '250 PLN' };
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
    'Services: ' + (services.length ? services.join(', ') : 'not chosen yet') + '.',
    'Palette: ' + (palette || 'not chosen yet') + '.',
    'Style: ' + (style || 'not chosen yet') + '.'
  ];
  if (pages.length) lines.push('Suggested pages: ' + pages.join(', ') + '.');
  if (features.length) {
    lines.push('Suggested features:');
    for (const f of features) lines.push('- ' + f);
  }
  if (plan) {
    lines.push(
      'Suggested plan: ' +
        plan.id +
        ' (' +
        plan.price +
        '). This is a suggestion only, for the website work. The final quote comes after we talk.'
    );
  }
  const note = otherNote != null ? otherNote : otherServicesNote(services);
  if (note) lines.push(note);
  return lines.join('\n');
}

export function buildWhatsAppBuilderUrl(text) {
  return 'https://wa.me/' + WHATSAPP.RW.e164 + '?text=' + encodeURIComponent(text);
}

const PALETTE_SWATCHES = {
  vira: ['sw-vira-0', 'sw-vira-1', 'sw-vira-2', 'sw-vira-3'],
  'ink-cream': ['sw-ink-0', 'sw-ink-1', 'sw-ink-2', 'sw-ink-3'],
  forest: ['sw-forest-0', 'sw-forest-1', 'sw-forest-2', 'sw-forest-3'],
  night: ['sw-night-0', 'sw-night-1', 'sw-night-2', 'sw-night-3'],
  clay: ['sw-clay-0', 'sw-clay-1', 'sw-clay-2', 'sw-clay-3'],
  sea: ['sw-sea-0', 'sw-sea-1', 'sw-sea-2', 'sw-sea-3']
};

function fillList(ul, items) {
  ul.replaceChildren();
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    ul.append(li);
  }
}

function fillSwatches(root, paletteId) {
  root.replaceChildren();
  const cls = PALETTE_SWATCHES[paletteId];
  if (!cls) return;
  for (const c of cls) {
    const i = document.createElement('i');
    i.className = 'sw ' + c;
    root.append(i);
  }
}

function markProgress(root, complete) {
  const items = [...root.querySelectorAll('.b-progress li')];
  let currentSet = false;
  items.forEach((li, i) => {
    const done = Boolean(complete[i]);
    li.classList.toggle('is-done', done);
    li.classList.remove('is-current');
    li.removeAttribute('aria-current');
    if (!done && !currentSet) {
      li.classList.add('is-current');
      li.setAttribute('aria-current', 'step');
      currentSet = true;
    }
  });
  if (!currentSet && items.length) {
    const last = items[items.length - 1];
    last.classList.add('is-current');
    last.setAttribute('aria-current', 'step');
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
  let sendUrl = '';

  const render = () => {
    const services = [...form.querySelectorAll('input[name="b-service"]:checked')].map((i) => i.value);
    const palEl = form.querySelector('input[name="b-palette"]:checked');
    const stEl = form.querySelector('input[name="b-style"]:checked');
    const palette = palEl ? palEl.value : '';
    const style = stEl ? stEl.value : '';
    const palName = palEl ? palEl.getAttribute('data-label') || palette : '';
    const stName = stEl ? stEl.getAttribute('data-label') || style : '';

    const plan = suggestPlan(services);
    const pages = data ? collectPages(services, data) : [];
    const features = data ? collectFeatures(services, data) : [];
    const otherNote = otherServicesNote(services);

    const svcOut = overview.querySelector('[data-ov="services"]');
    const palOut = overview.querySelector('[data-ov="palette"]');
    const stOut = overview.querySelector('[data-ov="style"]');
    const pagesOut = overview.querySelector('[data-ov="pages"]');
    const featOut = overview.querySelector('[data-ov="features"]');
    const planOut = overview.querySelector('[data-ov="plan"]');
    const otherOut = overview.querySelector('[data-ov="other"]');
    const swatchOut = overview.querySelector('[data-ov="palette-swatches"]');

    if (svcOut) svcOut.textContent = services.length ? services.join(', ') : 'Choose at least one service.';
    if (palOut) palOut.textContent = palName || 'Not chosen yet.';
    if (stOut) stOut.textContent = stName || 'Not chosen yet.';
    if (swatchOut) fillSwatches(swatchOut, palette);
    if (pagesOut) fillList(pagesOut, pages);
    if (featOut) fillList(featOut, features);
    if (planOut) {
      planOut.textContent = plan
        ? 'Suggested plan: ' +
          plan.id +
          ' — ' +
          plan.price +
          '. This is a suggestion only, for the website work. The final quote comes after we talk.'
        : '';
    }
    if (otherOut) otherOut.textContent = otherNote;

    markProgress(root, [services.length > 0, Boolean(palette), Boolean(style), services.length > 0]);

    const status = document.getElementById('builder-status');
    if (status) {
      const bits = [];
      if (services.length) bits.push('Services: ' + services.join(', ') + '.');
      if (plan) bits.push('Suggested plan: ' + plan.id + '.');
      status.textContent = bits.join(' ');
    }

    const ready = services.length > 0;
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
      sendUrl = buildWhatsAppBuilderUrl(text);
      send.disabled = false;
      send.removeAttribute('aria-disabled');
    } else {
      sendUrl = '';
      send.disabled = true;
      send.setAttribute('aria-disabled', 'true');
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
  send.addEventListener('click', () => {
    if (send.disabled || send.getAttribute('aria-disabled') === 'true' || !sendUrl) return;
    window.open(sendUrl, '_blank', 'noopener,noreferrer');
  });
}
