/* Native scrolling only. The progress bar and nav "scrolled" state
   update on a rAF-throttled, passive listener. Anchor jumps use CSS
   scroll-behavior: smooth, which is already turned off under
   prefers-reduced-motion. */

export function initScroll() {
  const bar = document.getElementById('progress');
  const nav = document.getElementById('nav');
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 40);
    if (bar) {
      const h = document.documentElement;
      const max = Math.max(1, h.scrollHeight - h.clientHeight);
      bar.style.width = ((h.scrollTop / max) * 100) + '%';
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
}
