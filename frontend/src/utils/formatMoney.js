const CURRENCY_SYMBOLS = { USD: '$', NGN: '₦' };

export function formatMoney(amount, currency = 'USD') {
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  return `${symbol}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}