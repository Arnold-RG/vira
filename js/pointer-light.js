export function initPointerLight() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const layer = document.querySelector('.pointer-light');
  if (reduce || coarse || !layer) {
    if (layer) layer.hidden = true;
    return;
  }

  let ticking = false;
  let x = innerWidth / 2;
  let y = innerHeight / 2;

  const paint = () => {
    document.documentElement.style.setProperty('--spot-x', x + 'px');
    document.documentElement.style.setProperty('--spot-y', y + 'px');
    layer.classList.add('on');
    ticking = false;
  };

  addEventListener('pointermove', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    x = e.clientX;
    y = e.clientY;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  }, { passive: true });

  addEventListener('pointerleave', () => layer.classList.remove('on'), { passive: true });
}
