/**
 * Payment QR fields that still need to be supplied.
 * Leave every value null until the official details are confirmed.
 * When the required fields are set, the QR cards render on "Show bank details".
 *
 * Required for the PLN ZBP 2D transfer QR: recipientName.
 *   Account digits come from payments.js (the same split parts as the reveal).
 * Required for the EUR EPC069-12 SEPA QR: recipientName, bic, eurIban (full IBAN).
 * Optional: defaultTitle (transfer title); amounts stay empty so the payer fills them.
 */
export const QR_CONFIG = {
  recipientName: null,
  bic: null,
  eurIban: null,
  plnIban: null,
  defaultTitle: null
};
