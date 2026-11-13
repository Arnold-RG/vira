import { FX_RATES, PLANS } from './config.js';

export function initPricing() {
  const root = document.getElementById('request-assist');
  if (!root) return;

  const state = {
    currency: 'PLN',
    rates: { EUR: FX_RATES.EUR, USD: FX_RATES.USD, RWF: FX_RATES.RWF },
    source: 'fallback'
  };

  const formatNum = (n) => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(n);

  const convert = (pln, currency) => {
    if (currency === 'PLN') return Math.round(pln);
    const raw = pln * (state.rates[currency] || 0);
    if (currency === 'RWF') return Math.round(raw / 1000) * 1000;
    return Math.round(raw);
  };

  const priceLine = (planName) => {
    const p = PLANS[planName];
    if (!p) return '';
    const c = state.currency;
    return formatNum(convert(p.pln, c)) + ' ' + c;
  };

  state.priceLine = priceLine;
  window.ViraPricing = state;

  const render = () => {
    Object.entries(PLANS).forEach(([name, p]) => {
      const el = root.querySelector('[data-price="' + p.key + '"]');
      if (el) el.textContent = priceLine(name);
    });
    const hidden = document.getElementById('c-currency');
    if (hidden) hidden.value = state.currency;
    root.querySelectorAll('.currency-btn').forEach((btn) => {
      const on = btn.dataset.currency === state.currency;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const note = root.querySelector('[data-rates-as-of]');
    if (note) {
      note.textContent = 'Prices are fixed in PLN; other currencies are approximate, using rates as of ' + FX_RATES.asOf + '.';
    }
  };
  state.render = render;

  root.querySelectorAll('.currency-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.currency = btn.dataset.currency;
      render();
    });
  });

  const choose = (plan) => {
    const sel = document.getElementById('c-plan');
    if (sel) {
      sel.value = plan;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    document.querySelectorAll('.plan').forEach((card) => {
      card.classList.toggle('is-chosen', card.dataset.plan === plan);
    });
    const form = document.getElementById('request-form') || document.getElementById('contact-form');
    if (form) {
      const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
      form.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    }
    if (sel) setTimeout(() => sel.focus(), 400);
  };
  state.choose = choose;
  root.querySelectorAll('[data-choose]').forEach((btn) => {
    btn.addEventListener('click', () => choose(btn.dataset.choose));
  });

  render();

  const applyLive = (rates) => {
    if (!rates) return;
    if (typeof rates.EUR === 'number') state.rates.EUR = rates.EUR;
    if (typeof rates.USD === 'number') state.rates.USD = rates.USD;
    if (typeof rates.RWF === 'number') state.rates.RWF = rates.RWF;
    state.source = 'live';
    render();
  };

  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, 6000);
  fetch(FX_RATES.source, ctrl ? { signal: ctrl.signal } : {})
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((data) => {
      clearTimeout(timer);
      if (data && data.result === 'success' && data.rates) applyLive(data.rates);
    })
    .catch(() => { clearTimeout(timer); });
}
