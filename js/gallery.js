export function initGallery() {
  const root = document.getElementById('gallery');
  const dialog = document.getElementById('lightbox');
  if (!root || !dialog) return;

  const figures = Array.from(root.querySelectorAll('figure[data-full]'));
  if (!figures.length) return;

  const img = dialog.querySelector('.lightbox-image');
  const caption = dialog.querySelector('.lightbox-caption');
  const btnClose = dialog.querySelector('.lightbox-close');
  const btnPrev = dialog.querySelector('.lightbox-prev');
  const btnNext = dialog.querySelector('.lightbox-next');
  let index = 0;
  let lastFocus = null;

  const items = figures.map((fig) => {
    const pic = fig.querySelector('img');
    const title = fig.querySelector('figcaption b');
    const sub = fig.querySelector('figcaption span');
    return {
      src: fig.dataset.full || (pic && pic.currentSrc) || (pic && pic.src),
      alt: (pic && pic.alt) || '',
      title: title ? title.textContent : '',
      sub: sub ? sub.textContent : ''
    };
  });

  const show = (i) => {
    index = (i + items.length) % items.length;
    const it = items[index];
    img.src = it.src;
    img.alt = it.alt;
    caption.innerHTML = (it.title ? '<b>' + it.title + '</b>' : '') + (it.sub ? '<span>' + it.sub + '</span>' : '');
    btnPrev.hidden = items.length < 2;
    btnNext.hidden = items.length < 2;
  };

  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.classList.add('is-locked');
    btnClose.focus();
  };

  const close = () => {
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  figures.forEach((fig, i) => {
    const btn = fig.querySelector('button') || fig;
    btn.addEventListener('click', () => open(i));
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(index - 1));
  btnNext.addEventListener('click', () => show(index + 1));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    img.removeAttribute('src');
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    if (e.key === 'Escape') { /* native dialog already closes */ }
  });
}
