import { initForm } from './form.js';
import { initPayments } from './payments.js';
import { initQr } from './qr-ui.js';
import { initBuilder } from './builder.js';
import { initCarousel } from './carousel.js';
import { initTheme } from './theme.js';

function initYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

function initNav() {
  const btn = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!btn || !nav) return;
  const close = () => {
    btn.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  };
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    nav.classList.toggle('is-open', !open);
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
}

function initPlans() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-choose]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const plan = document.getElementById('c-plan');
      if (plan) plan.value = btn.dataset.choose;
      const contact = document.getElementById('contact');
      if (contact) {
        contact.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
      const name = document.getElementById('c-name');
      if (name) name.focus();
    });
  });
}

/**
 * Fill marked slots from content.json. Empty photo src and empty
 * project lists keep the coming-soon labels — nothing is invented.
 */
async function initSlots() {
  let data;
  try {
    const res = await fetch('content.json', { cache: 'no-store' });
    if (!res.ok) return;
    data = await res.json();
  } catch (e) {
    return;
  }
  const slots = data && data.slots;
  if (!slots) return;

  const photo = document.querySelector('[data-slot="founder_photo"]');
  if (photo && slots.founder_photo) {
    const label = photo.querySelector('[data-slot-label]');
    if (slots.founder_photo.src) {
      const img = document.createElement('img');
      img.src = slots.founder_photo.src;
      img.alt = slots.founder_photo.alt || 'Arnold Rurangwa, founder of Vira';
      photo.replaceChildren(img);
      photo.removeAttribute('role');
      photo.removeAttribute('aria-label');
    } else if (label && slots.founder_photo.label) {
      label.textContent = slots.founder_photo.label;
      photo.setAttribute('aria-label', slots.founder_photo.label);
    }
  }

  for (const key of ['why_i_built_vira', 'motivation', 'education', 'experience', 'mission', 'motto', 'about']) {
    const root = document.querySelector('[data-slot="' + key + '"]');
    const slot = slots[key];
    if (!root || !slot) continue;
    const title = root.querySelector('[data-slot-title]');
    const body = root.querySelector('[data-slot-body]');
    if (title && slot.title) title.textContent = slot.title;
    if (body && slot.body) body.textContent = slot.body;
  }

  const gallery = document.querySelector('[data-slot="work_gallery"]');
  if (gallery && slots.work_gallery) {
    const projects = Array.isArray(slots.work_gallery.projects) ? slots.work_gallery.projects : [];
    const real = projects.filter((p) => p && p.src);
    if (real.length) {
      const list = document.createElement('ul');
      list.className = 'gallery';
      for (const p of real) {
        const li = document.createElement('li');
        const img = document.createElement('img');
        img.src = p.src;
        img.alt = p.alt || '';
        li.append(img);
        if (p.caption) {
          const cap = document.createElement('p');
          cap.textContent = p.caption;
          li.append(cap);
        }
        list.append(li);
      }
      gallery.replaceChildren(list);
    } else {
      const empty = gallery.querySelector('[data-slot-empty]');
      if (empty && slots.work_gallery.empty) empty.textContent = slots.work_gallery.empty;
    }
  }
}

function initFaq() {
  document.querySelectorAll('.faq details, details.plan-includes').forEach((d) => {
    const summary = d.querySelector('summary');
    if (!summary) return;
    const panel = d.querySelector('.faq-panel');
    summary.setAttribute('aria-expanded', d.open ? 'true' : 'false');
    if (panel && panel.id) summary.setAttribute('aria-controls', panel.id);
    d.addEventListener('toggle', () => {
      summary.setAttribute('aria-expanded', d.open ? 'true' : 'false');
    });
  });
}

initYear();
initNav();
initTheme();
initFaq();
initPlans();
initForm();
initPayments();
initQr();
initBuilder();
initCarousel();
initSlots();
