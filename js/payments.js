/**
 * Bank details are assembled at runtime from split, XOR-obfuscated groups.
 * They are written into the DOM only after "Show bank details" is clicked.
 * Without JavaScript, the noscript fallback asks the visitor to use WhatsApp.
 * This is a casual-grep deterrent, not encryption.
 */

const KEY = 91;
const WIDTHS = [2, 4, 4, 4, 4, 4, 4];

const STORE = {
  PLN: [9, 1049, 2309, 91, 90, 5064, 5979],
  EUR: [86, 1049, 2309, 91, 90, 5854, 8939]
};

export function partsFor(currency) {
  const raw = STORE[currency];
  if (!raw) return null;
  return raw.map((n) => n ^ KEY);
}

export function formatAccount(parts) {
  return parts.map((n, i) => String(n).padStart(WIDTHS[i], '0')).join(' ');
}

export function accountDigits(parts) {
  return formatAccount(parts).replace(/\s+/g, '');
}

export function listAccounts() {
  return ['PLN', 'EUR'].map((currency) => {
    const parts = partsFor(currency);
    return {
      currency,
      display: formatAccount(parts),
      digits: accountDigits(parts)
    };
  });
}

function fallbackCopy(digits, done) {
  const ta = document.createElement('textarea');
  ta.value = digits;
  ta.setAttribute('readonly', '');
  ta.setAttribute('aria-hidden', 'true');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    if (document.execCommand('copy')) done();
  } catch (e) { /* visitor can copy by hand */ }
  ta.remove();
}

function copyDigits(digits, btn) {
  const done = () => {
    btn.textContent = 'Copied';
    window.setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(digits).then(done).catch(() => fallbackCopy(digits, done));
  } else {
    fallbackCopy(digits, done);
  }
}

function renderPanel(panel) {
  const list = document.createElement('ul');
  list.className = 'bank-accounts';
  for (const acc of listAccounts()) {
    const li = document.createElement('li');
    li.className = 'bank-row';

    const ccy = document.createElement('span');
    ccy.className = 'bank-ccy';
    ccy.textContent = acc.currency;

    const num = document.createElement('span');
    num.className = 'bank-num';
    num.textContent = acc.display;

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'btn-copy';
    copy.setAttribute('aria-label', 'Copy ' + acc.currency + ' account number');
    copy.textContent = 'Copy';
    copy.addEventListener('click', () => copyDigits(acc.digits, copy));

    li.append(ccy, num, copy);
    list.append(li);
  }
  panel.replaceChildren(list);
}

export function initPayments() {
  const toggle = document.getElementById('bank-toggle');
  const panel = document.getElementById('bank-panel');
  if (!toggle || !panel) return;
  toggle.hidden = false;
  let rendered = false;

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    if (open) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Show bank details';
      panel.hidden = true;
    } else {
      if (!rendered) {
        renderPanel(panel);
        rendered = true;
      }
      toggle.setAttribute('aria-expanded', 'true');
      toggle.textContent = 'Hide bank details';
      panel.hidden = false;
    }
  });
}
