import { HERO_VIDEO, HERO_VIDEOS, PRODUCTS, SOCIAL, EVENTS, REVIEWS, FOUNDING_YEAR } from './config.js';
import { initTheme } from './theme.js';
import { initScroll } from './scroll.js';
import { initPointerLight } from './pointer-light.js';
import { initReveal } from './reveal.js';
import { initPricing } from './pricing.js';
import { initForm } from './form.js';
import { initGallery } from './gallery.js';

function initYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

function prefersPosterOnly() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 767px)').matches;
  const conn = navigator.connection;
  const saveData = !!(conn && conn.saveData);
  const slow = !!(conn && /^(slow-2g|2g|3g)$/i.test(conn.effectiveType || ''));
  return reduce || narrow || saveData || slow;
}

function initHero() {
  const video = document.getElementById('hero-video');
  const poster = document.getElementById('hero-poster');
  const media = document.querySelector('.hero-media');
  const choice = HERO_VIDEOS[HERO_VIDEO] || HERO_VIDEOS['02-liquid-metal'];
  if (!choice || !media) return;

  if (poster) {
    poster.src = choice.poster;
    poster.alt = '';
    poster.width = 1920;
    poster.height = 1080;
  }
  if (media) media.setAttribute('aria-hidden', 'true');

  /* Load the file from JS only when the viewport, motion preference and
     network allow it. Never set src on small screens or constrained links. */
  if (!video || prefersPosterOnly()) {
    if (video) {
      video.removeAttribute('src');
      video.remove();
    }
    return;
  }

  video.poster = choice.poster;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.preload = 'metadata';
  video.setAttribute('aria-hidden', 'true');
  video.src = choice.src;

  const tryPlay = () => {
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => { video.remove(); });
  };

  if (video.readyState >= 2) tryPlay();
  else video.addEventListener('canplay', tryPlay, { once: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else tryPlay();
  });
}


function photoPicture(file, alt, width, height, sizes) {
  const stem = String(file || '').replace(/\.(jpe?g|webp)$/i, '');
  return (
    '<picture>' +
      '<source type="image/webp" srcset="' + escapeAttr(stem + '-800.webp') + ' 800w, ' + escapeAttr(stem + '.webp') + ' 1600w" sizes="' + escapeAttr(sizes) + '">' +
      '<source type="image/jpeg" srcset="' + escapeAttr(stem + '-800.jpg') + ' 800w, ' + escapeAttr(stem + '.jpg') + ' 1600w" sizes="' + escapeAttr(sizes) + '">' +
      '<img src="' + escapeAttr(stem + '.jpg') + '" alt="' + escapeAttr(alt) + '" width="' + width + '" height="' + height + '" loading="lazy" decoding="async">' +
    '</picture>'
  );
}

function initProducts() {
  const root = document.getElementById('products-grid');
  if (!root) return;
  const cards = PRODUCTS.map((p, i) => {
    const n = String(i + 1).padStart(2, '0');
    return (
      '<article class="product reveal">' +
        '<div class="p-img">' + photoPicture(p.image, p.alt, p.width || 1600, p.height || 1000, '(max-width: 700px) 92vw, 45vw') + '</div>' +
        '<div class="p-body"><div class="num">' + n + '</div><h3>' + escapeHtml(p.title) + '</h3><p>' + escapeHtml(p.body) + '</p></div>' +
      '</article>'
    );
  });
  cards.push(
    '<article class="product is-empty reveal">' +
      '<div class="p-body empty-state">' +
        '<p>More products will appear here as they are ready to share.</p>' +
        '<p class="empty-hint">We only list work we can stand behind.</p>' +
      '</div>' +
    '</article>'
  );
  root.innerHTML = cards.join('');
}

function initSocial() {
  const icons = {
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 8.4v11.1H2.9V8.4h3.6zM6.7 4.9A2.1 2.1 0 1 1 2.6 4.9a2.1 2.1 0 0 1 4.1 0zM21.1 19.5h-3.6v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.5H10V8.4h3.4v1.5h.1c.5-.9 1.6-1.8 3.3-1.8 3.5 0 4.2 2.3 4.2 5.3v6.1z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 3.5h3.1l-6.8 7.8 8 9.2h-6.3l-4.9-6.4-5.6 6.4H2l7.3-8.3L1.6 3.5h6.4l4.5 5.9 5-5.9zm-1.1 15.4h1.7L7.7 5.1H5.9l10.5 13.8z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.2c0-2.3-.3-3.8-.8-4.7-.5-.9-1.3-1.5-2.3-1.8C17.2 5.3 12 5.3 12 5.3s-5.2 0-6.9.4c-1 .3-1.8.9-2.3 1.8-.5.9-.8 2.4-.8 4.7s.3 3.8.8 4.7c.5.9 1.3 1.5 2.3 1.8 1.7.4 6.9.4 6.9.4s5.2 0 6.9-.4c1-.3 1.8-.9 2.3-1.8.5-.9.8-2.4.8-4.7zM10 15.5V8.9l6 3.3-6 3.3z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 4c.4 2.8 1.9 4.6 4.6 5v3c-1.6 0-3-.5-4.6-1.5v6.3A5.8 5.8 0 1 1 11.2 11v3.1a2.8 2.8 0 1 0 2.8 2.7V4h0z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z"/></svg>'
  };
  const labels = { linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook', x: 'X', youtube: 'YouTube', tiktok: 'TikTok', github: 'GitHub' };
  const html = Object.entries(SOCIAL).filter(([, url]) => url).map(([key, url]) =>
    '<a href="' + escapeAttr(url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + (labels[key] || key) + '">' + (icons[key] || '') + '</a>'
  ).join('');
  document.querySelectorAll('[data-social]').forEach((el) => {
    el.innerHTML = html;
    if (!html) el.hidden = true;
  });
}

function initEvents() {
  const root = document.getElementById('events-list');
  if (!root) return;
  if (!EVENTS.length) {
    root.innerHTML = '<div class="empty-state"><p>No upcoming events yet.</p><p class="empty-hint">Follow us for announcements.</p></div>';
    return;
  }
  root.innerHTML = EVENTS.map((ev) =>
    '<article class="event-card"><time datetime="' + escapeAttr(ev.date || '') + '">' + escapeHtml(ev.date || '') + '</time><h3>' + escapeHtml(ev.title || '') + '</h3><p>' + escapeHtml(ev.blurb || '') + '</p></article>'
  ).join('');
}

function initReviews() {
  const root = document.getElementById('reviews-wrap');
  if (!root) return;
  if (!REVIEWS.length) {
    root.innerHTML = '<div class="empty-state"><p>Be among our first clients.</p><p class="empty-hint">Reviews will appear here when we have them to share.</p></div>';
    return;
  }
  root.innerHTML = REVIEWS.map((r) =>
    '<figure class="review-card"><blockquote>' + escapeHtml(r.quote || '') + '</blockquote><figcaption>' + escapeHtml(r.name || '') + (r.role ? ' · ' + escapeHtml(r.role) : '') + '</figcaption></figure>'
  ).join('');
}

function initMenu() {
  const btn = document.getElementById('menu-btn');
  const sheet = document.getElementById('nav-sheet');
  const backdrop = document.getElementById('nav-sheet-backdrop');
  const closeBtn = document.getElementById('nav-sheet-close');
  if (!btn || !sheet) return;

  const focusables = () => {
    if (sheet.inert) return [];
    return sheet.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
  };
  let last = null;

  const parkSheet = () => {
    sheet.inert = true;
    sheet.setAttribute('inert', '');
    sheet.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
  };
  const unparkSheet = () => {
    sheet.inert = false;
    sheet.removeAttribute('inert');
    sheet.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
  };
  parkSheet();

  const open = () => {
    last = document.activeElement;
    unparkSheet();
    sheet.classList.add('is-open');
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add('is-open');
    }
    document.body.classList.add('is-locked');
    const list = focusables();
    (closeBtn || list[0] || sheet).focus();
  };

  const close = (opts) => {
    opts = opts || {};
    sheet.classList.remove('is-open');
    parkSheet();
    if (backdrop) {
      backdrop.classList.remove('is-open');
      setTimeout(() => { if (!sheet.classList.contains('is-open')) backdrop.hidden = true; }, 450);
    }
    document.body.classList.remove('is-locked');
    if (opts.restore === false) return;
    const fallback = (last && last.focus) ? last : btn;
    if (fallback && fallback.focus) fallback.focus();
    else if (btn && btn.focus) btn.focus();
  };

  const resolveFocusTarget = (href) => {
    if (!href || href.charAt(0) !== '#' || href.length < 2) return null;
    const el = document.getElementById(href.slice(1));
    if (!el) return null;
    return el.tagName === 'SECTION' ? el : (el.closest('section') || el);
  };

  btn.addEventListener('click', () => {
    sheet.classList.contains('is-open') ? close() : open();
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
  sheet.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      const target = resolveFocusTarget(href);
      if (!target) {
        close();
        return;
      }
      e.preventDefault();
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      close({ restore: false });
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
      try { history.pushState(null, '', href); }
      catch (err) { location.hash = href; }
    });
  });

  sheet.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const list = Array.from(focusables());
    if (!list.length) return;
    const first = list[0];
    const lastEl = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

initTheme();
initYear();
initHero();
initProducts();
initSocial();
initEvents();
initReviews();
initMenu();
initScroll();
initPointerLight();
initReveal();
initPricing();
initForm();
initGallery();
