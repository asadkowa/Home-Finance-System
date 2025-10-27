const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const auth = require('../middleware/auth');

// Get all income for user
router.get('/', auth, async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user.userId }).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching income' });
  }
});

// Get income by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user.userId });
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching income' });
  }
});

// Create income
router.post('/', auth, async (req, res) => {
  try {
    const income = new Income({
      ...req.body,
      user: req.user.userId
    });
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Error creating income' });
  }
});

// Update income
router.put('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Error updating income' });
  }
});

// Delete income
router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting income' });
  }
});

module.exports = router;
