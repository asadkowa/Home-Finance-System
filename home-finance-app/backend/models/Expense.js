const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Housing',
      'Utilities',
      'Food',
      'Transportation',
      'Healthcare',
      'Entertainment',
      'Education',
      'Shopping',
      'Savings & Investments',
      'Debt Payments',
      'Insurance',
      'Personal Care',
      'Gifts & Donations',
      'Miscellaneous'
    ]
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  receipt: {
    type: String
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
