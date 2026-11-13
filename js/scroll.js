/* Light inertia scroller for fine pointers only. Native scrolling on touch.
   All motion is off under prefers-reduced-motion. No dependencies. */

export function initScroll() {
  const bar = document.getElementById('progress');
  const nav = document.getElementById('nav');

  const onScrollChrome = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
    if (bar) {
      const h = document.documentElement;
      const max = Math.max(1, h.scrollHeight - h.clientHeight);
      bar.style.width = (h.scrollTop / max * 100) + '%';
    }
  };
  onScrollChrome();
  addEventListener('scroll', onScrollChrome, { passive: true });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches && matchMedia('(hover: hover)').matches;
  if (reduce || !fine) return;

  let current = window.scrollY;
  let target = window.scrollY;
  let running = false;
  let lastUser = 0;
  const ease = 0.145;

  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);

  const tick = () => {
    const max = maxScroll();
    if (target < 0) target = 0;
    if (target > max) target = max;
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.4) {
      current = target;
      running = false;
    }
    window.scrollTo(0, current);
    if (running) requestAnimationFrame(tick);
  };

  const start = () => {
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  };

  const inScrollable = (el) => {
    while (el && el !== document.body) {
      if (el === document.getElementById('lightbox')) return true;
      if (el === document.getElementById('nav-sheet')) return true;
      const s = getComputedStyle(el);
      const oy = s.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) return true;
      if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
      el = el.parentElement;
    }
    return false;
  };

  addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.defaultPrevented) return;
    if (inScrollable(e.target)) return;
    if (document.body.classList.contains('is-locked')) return;
    e.preventDefault();
    lastUser = performance.now();
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    target += delta;
    start();
  }, { passive: false });

  addEventListener('scroll', () => {
    if (performance.now() - lastUser > 80 && !running) {
      current = target = window.scrollY;
    }
  }, { passive: true });

  addEventListener('keydown', (e) => {
    const keys = ['PageUp', 'PageDown', 'Home', 'End', ' ', 'ArrowUp', 'ArrowDown'];
    if (!keys.includes(e.key)) return;
    if (inScrollable(e.target) || e.target.closest('input, textarea, select, [contenteditable]')) return;
    setTimeout(() => {
      target = current = window.scrollY;
    }, 0);
  });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', () => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      /* Let the native hash scroll run; resync after. */
      requestAnimationFrame(() => {
        target = current = window.scrollY;
      });
    });
  });
}
