function currentTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'dark' ? 'dark' : 'light';
}

function syncToggle(btn, theme) {
  if (!btn) return;
  const dark = theme === 'dark';
  btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  btn.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
  btn.textContent = dark ? 'Light' : 'Dark';
}

export function applyTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem('vira-theme', next);
  } catch (e) {
    /* ignore quota / private mode */
  }
  syncToggle(document.getElementById('theme-toggle'), next);
}

export function initTheme() {
  const btn = document.getElementById('theme-toggle');
  syncToggle(btn, currentTheme());
  if (!btn) return;
  btn.addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
}
