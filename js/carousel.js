/**
 * Horizontal photo carousel for the services section.
 * Transforms are set through the CSSOM (allowed by the CSP).
 * No innerHTML, no inline event handlers.
 */
const INTERVAL = 4500;
const GAP = 20;
const BREAKPOINT = 720;

function perViewFor() {
  return window.innerWidth <= BREAKPOINT ? 1 : 3;
}

export function initCarousel(root = document.getElementById('photo-carousel')) {
  if (!root) return;

  const viewport = root.querySelector('.carousel-viewport');
  const track = root.querySelector('.carousel-track');
  const prev = root.querySelector('.carousel-prev');
  const next = root.querySelector('.carousel-next');
  const dotsRoot = root.querySelector('.carousel-dots');
  if (!viewport || !track || !prev || !next || !dotsRoot) return;

  const slides = [...track.querySelectorAll('.carousel-slide')];
  if (!slides.length) return;

  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = reduceMq.matches;
  let perView = perViewFor();
  let page = 0;
  let timer = null;
  let slideW = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragDelta = 0;
  let pointerId = null;

  function pageCount() {
    return Math.max(1, slides.length - perView + 1);
  }

  function measure() {
    perView = perViewFor();
    const wrap = root.closest('.wrap') || root.parentElement || root;
    const vw = Math.max(0, wrap.clientWidth);
    const gaps = Math.max(0, perView - 1) * GAP;
    slideW = vw > 0 ? (vw - gaps) / perView : 0;
    track.style.setProperty('--slide-w', slideW + 'px');
    track.style.setProperty('--carousel-gap', GAP + 'px');
    if (page > pageCount() - 1) page = pageCount() - 1;
  }

  function renderDots() {
    const n = pageCount();
    dotsRoot.replaceChildren();
    for (let i = 0; i < n; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-dot';
      const last = Math.min(i + perView, slides.length);
      b.setAttribute(
        'aria-label',
        perView === 1
          ? 'Show photograph ' + (i + 1)
          : 'Show photographs ' + (i + 1) + ' to ' + last
      );
      b.addEventListener('click', () => go(i));
      dotsRoot.append(b);
    }
  }

  function syncDots() {
    [...dotsRoot.querySelectorAll('.carousel-dot')].forEach((b, i) => {
      if (i === page) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  }

  function offsetFor(p, extra = 0) {
    return -(p * (slideW + GAP)) + extra;
  }

  function apply(x, instant) {
    const instantNow = instant || reduce;
    track.style.transition = instantNow ? 'none' : 'transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)';
    track.style.transform = 'translate3d(' + x + 'px, 0, 0)';
  }

  function go(n, instant) {
    const max = pageCount() - 1;
    page = ((n % (max + 1)) + (max + 1)) % (max + 1);
    apply(offsetFor(page), instant);
    syncDots();
    restartTimer();
  }

  function nextPage() { go(page + 1); }
  function prevPage() { go(page - 1); }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function paused() {
    return reduce || document.hidden || root.matches(':hover') || root.matches(':focus-within') || dragging;
  }

  function restartTimer() {
    stopTimer();
    if (paused()) return;
    timer = setInterval(() => {
      if (paused()) return;
      go(page + 1);
    }, INTERVAL);
  }

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    dragStartX = e.clientX;
    dragDelta = 0;
    pointerId = e.pointerId;
    try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
    apply(offsetFor(page), true);
    stopTimer();
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    dragDelta = e.clientX - dragStartX;
    apply(offsetFor(page, dragDelta), true);
  }

  function onPointerUp(e) {
    if (!dragging || (pointerId != null && e.pointerId !== pointerId)) return;
    dragging = false;
    pointerId = null;
    const threshold = Math.max(40, slideW * 0.18);
    if (dragDelta <= -threshold) go(page + 1);
    else if (dragDelta >= threshold) go(page - 1);
    else go(page);
    dragDelta = 0;
  }

  function onKey(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextPage();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevPage();
    }
  }

  function onResize() {
    const before = perView;
    measure();
    if (before !== perView) renderDots();
    go(page, true);
  }

  prev.addEventListener('click', prevPage);
  next.addEventListener('click', nextPage);
  root.addEventListener('keydown', onKey);
  root.addEventListener('mouseenter', stopTimer);
  root.addEventListener('mouseleave', restartTimer);
  root.addEventListener('focusin', stopTimer);
  root.addEventListener('focusout', () => {
    requestAnimationFrame(restartTimer);
  });
  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', onPointerUp);
  viewport.addEventListener('pointercancel', onPointerUp);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTimer();
    else restartTimer();
  });
  window.addEventListener('resize', onResize);
  if (reduceMq.addEventListener) {
    reduceMq.addEventListener('change', (ev) => {
      reduce = ev.matches;
      go(page, true);
    });
  }

  measure();
  renderDots();
  go(0, true);
}
