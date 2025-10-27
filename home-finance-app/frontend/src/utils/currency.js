// Exchange rates (base: USD) - matches backend rates
const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
  EGP: 30.90,
  INR: 83.10,
  JPY: 149.50,
  CNY: 7.24,
  PKR: 278.50,
};

// Currency symbols
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SAR: '﷼',
  AED: 'د.إ',
  EGP: 'E£',
  INR: '₹',
  JPY: '¥',
  CNY: '¥',
  PKR: '₨',
};

/**
 * Get the user's selected currency from localStorage
 */
export const getUserCurrency = () => {
  return localStorage.getItem('currency') || 'USD';
};

/**
 * Get currency symbol for a given currency code
 */
export const getCurrencySymbol = (currency = null) => {
  const code = currency || getUserCurrency();
  return CURRENCY_SYMBOLS[code] || '$';
};

/**
 * Convert amount from USD to target currency
 */
export const convertFromUSD = (amount, targetCurrency) => {
  if (!targetCurrency) targetCurrency = getUserCurrency();
  if (!EXCHANGE_RATES[targetCurrency]) return amount;
  return amount * EXCHANGE_RATES[targetCurrency];
};

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!fromCurrency) fromCurrency = 'USD';
  if (!toCurrency) toCurrency = getUserCurrency();
  
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = fromCurrency === 'USD' ? amount : amount / EXCHANGE_RATES[fromCurrency];
  const convertedAmount = toCurrency === 'USD' ? usdAmount : usdAmount * EXCHANGE_RATES[toCurrency];
  
  return convertedAmount;
};

/**
 * Convert amount from user's currency to USD (for storing in database)
 * This should be called when submitting forms to convert user input to USD
 */
export const convertToUSD = (amount) => {
  const userCurrency = getUserCurrency();
  if (userCurrency === 'USD') return amount;
  if (!EXCHANGE_RATES[userCurrency]) return amount;
  return amount / EXCHANGE_RATES[userCurrency];
};

/**
 * Format amount with currency symbol
 */
export const formatCurrency = (amount, currency = null) => {
  const code = currency || getUserCurrency();
  const symbol = getCurrencySymbol(code);
  
  // Handle different currency formats
  if (code === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  return `${symbol}${amount.toFixed(2)}`;
};

/**
 * Format amount with conversion if needed
 */
export const formatAmount = (amount, originalCurrency = 'USD') => {
  const userCurrency = getUserCurrency();
  const convertedAmount = convertCurrency(amount, originalCurrency, userCurrency);
  return formatCurrency(convertedAmount, userCurrency);
};
