const KEY = 'vira-theme';

function current() {
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'dark' ? 'dark' : 'light';
}

function explicit() {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch (e) {
    return null;
  }
}

function apply(theme, persist) {
  const t = theme === 'dark' ? 'dark' : 'light';
  const root = document.documentElement;
  root.setAttribute('data-theme', t);
  root.style.colorScheme = t;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute('content', t === 'dark' ? '#14110F' : '#6F4E37');
  });
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  });
  if (persist) {
    try { localStorage.setItem(KEY, t); } catch (e) { /* ignore quota / private mode */ }
  }
}

export function initTheme() {
  apply(current(), false);

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      apply(current() === 'dark' ? 'light' : 'dark', true);
    });
  });

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = (e) => {
    if (explicit()) return;
    apply(e.matches ? 'dark' : 'light', false);
  };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
}
