/**
 * Blocking head script so the chosen theme is on <html> before paint.
 * External file, no inline script, so it stays CSP-compatible.
 */
(function () {
  var theme = 'light';
  try {
    var saved = localStorage.getItem('vira-theme');
    if (saved === 'light' || saved === 'dark') {
      theme = saved;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
  } catch (e) {
    /* private mode: fall back to light */
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
