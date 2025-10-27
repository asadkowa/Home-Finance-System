const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// List of supported currencies with their symbols
const CURRENCIES = {
  USD: { name: 'US Dollar', symbol: '$', code: 'USD' },
  EUR: { name: 'Euro', symbol: '€', code: 'EUR' },
  GBP: { name: 'British Pound', symbol: '£', code: 'GBP' },
  SAR: { name: 'Saudi Riyal', symbol: '﷼', code: 'SAR' },
  AED: { name: 'UAE Dirham', symbol: 'د.إ', code: 'AED' },
  EGP: { name: 'Egyptian Pound', symbol: 'E£', code: 'EGP' },
  INR: { name: 'Indian Rupee', symbol: '₹', code: 'INR' },
  JPY: { name: 'Japanese Yen', symbol: '¥', code: 'JPY' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', code: 'CNY' },
  PKR: { name: 'Pakistani Rupee', symbol: '₨', code: 'PKR' },
};

// Exchange rates (base: USD) - These would ideally come from an API
// For demo purposes, we'll use approximate rates. In production, integrate with a live API
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

// Get list of supported currencies
router.get('/list', (req, res) => {
  try {
    res.json({
      currencies: Object.values(CURRENCIES),
      base: 'USD'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching currencies' });
  }
});

// Get exchange rate between two currencies
router.get('/rate/:from/:to', auth, (req, res) => {
  try {
    const { from, to } = req.params;
    
    if (!EXCHANGE_RATES[from] || !EXCHANGE_RATES[to]) {
      return res.status(400).json({ message: 'Invalid currency codes' });
    }
    
    const rate = EXCHANGE_RATES[to] / EXCHANGE_RATES[from];
    
    res.json({
      from,
      to,
      rate: rate.toFixed(4),
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exchange rate' });
  }
});

// Convert amount between currencies
router.get('/convert/:amount/:from/:to', auth, (req, res) => {
  try {
    const { amount, from, to } = req.params;
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue)) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    if (!EXCHANGE_RATES[from] || !EXCHANGE_RATES[to]) {
      return res.status(400).json({ message: 'Invalid currency codes' });
    }
    
    const rate = EXCHANGE_RATES[to] / EXCHANGE_RATES[from];
    const convertedAmount = amountValue * rate;
    
    res.json({
      originalAmount: amountValue,
      originalCurrency: from,
      convertedAmount: convertedAmount.toFixed(2),
      convertedCurrency: to,
      rate: rate.toFixed(4),
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error converting currency' });
  }
});

module.exports = router;
