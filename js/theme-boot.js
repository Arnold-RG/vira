/* Blocking boot script: apply the saved or system theme before first paint. No modules. */
(function () {
  var KEY = 'vira-theme';
  var t = null;
  try { t = localStorage.getItem(KEY); } catch (e) {}
  if (t !== 'light' && t !== 'dark') {
    t = (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  var r = document.documentElement;
  r.setAttribute('data-theme', t);
  r.style.colorScheme = t;
})();
