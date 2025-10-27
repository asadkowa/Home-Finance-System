const mongoose = require('mongoose');

const debtPaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  debt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Debt',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model('DebtPayment', debtPaymentSchema);
