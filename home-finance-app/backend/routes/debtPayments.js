const express = require('express');
const router = express.Router();
const DebtPayment = require('../models/DebtPayment');
const Debt = require('../models/Debt');
const auth = require('../middleware/auth');

// Get all debt payments for user
router.get('/', auth, async (req, res) => {
  try {
    const payments = await DebtPayment.find({ user: req.user.userId })
      .populate('debt', 'name type')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching debt payments' });
  }
});

// Get debt payments for a specific debt
router.get('/debt/:debtId', auth, async (req, res) => {
  try {
    const payments = await DebtPayment.find({
      user: req.user.userId,
      debt: req.params.debtId
    })
      .populate('debt', 'name type')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching debt payments' });
  }
});

// Create debt payment
router.post('/', auth, async (req, res) => {
  try {
    const { debt, amount, paymentDate, description } = req.body;
    
    // Verify the debt belongs to the user
    const debtRecord = await Debt.findOne({ _id: debt, user: req.user.userId });
    if (!debtRecord) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    
    // Create payment record
    const payment = new DebtPayment({
      user: req.user.userId,
      debt,
      amount,
      paymentDate: paymentDate || new Date(),
      description
    });
    
    await payment.save();
    
    // Update debt balance
    const newBalance = debtRecord.currentBalance - amount;
    await Debt.findByIdAndUpdate(debt, { currentBalance: newBalance });
    
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating debt payment:', error);
    res.status(500).json({ message: 'Error creating debt payment' });
  }
});

// Delete debt payment
router.delete('/:id', auth, async (req, res) => {
  try {
    const payment = await DebtPayment.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('debt');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Restore debt balance
    const debt = await Debt.findById(payment.debt._id);
    debt.currentBalance += payment.amount;
    await debt.save();
    
    // Delete payment
    await DebtPayment.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting debt payment' });
  }
});

module.exports = router;
