/**
 * Payload strings for Polish ZBP 2D transfer QRs and EPC069-12 SEPA QRs.
 * These functions only build the string. They do not read the live config
 * and they do not write to the page — tests pass dummy values here.
 */

/**
 * Polish ZBP "2D" transfer QR payload.
 * Pipe-separated: NIP|country|account|amount in grosze|recipient name|title|||
 * An empty NIP produces a leading pipe.
 */
export function zbpPayload({
  nip = '',
  country = 'PL',
  account,
  amountGrosze = '',
  name,
  title = ''
} = {}) {
  if (!account || !name) return '';
  return [nip, country, account, String(amountGrosze), name, title, '', '', ''].join('|');
}

/**
 * EPC069-12 SEPA credit-transfer QR payload (BCD, version 002, UTF-8, SCT).
 * Lines, LF-separated: BCD / 002 / 1 / SCT / BIC / name / IBAN / EUR amount / (empty purpose) / title
 * Amount is "EUR" plus a dotted decimal (e.g. EUR12.00). An empty amount leaves that line empty.
 */
export function epcPayload({ bic, name, iban, amountEur = '', title = '' } = {}) {
  if (!bic || !name || !iban) return '';
  let amount = '';
  if (amountEur !== '' && amountEur != null) {
    const n = Number(amountEur);
    if (!Number.isFinite(n)) return '';
    amount = 'EUR' + n.toFixed(2);
  }
  return ['BCD', '002', '1', 'SCT', bic, name, iban, amount, '', title].join('\n');
}

export function qrReadyFor(currency, config) {
  if (!config || !config.recipientName) return false;
  if (currency === 'PLN') return true;
  if (currency === 'EUR') return Boolean(config.bic && config.eurIban);
  return false;
}
