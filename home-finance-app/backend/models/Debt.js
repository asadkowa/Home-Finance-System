const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Credit Card', 'Student Loan', 'Personal Loan', 'Mortgage', 'Car Loan', 'Other'],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currentBalance: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  minimumPayment: {
    type: Number,
    required: true
  },
  dueDate: {
    type: String
  },
  payoffDate: {
    type: Date
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Debt', debtSchema);
