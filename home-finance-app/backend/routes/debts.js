const express = require('express');
const router = express.Router();
const Debt = require('../models/Debt');
const auth = require('../middleware/auth');

// Get all debts for user
router.get('/', auth, async (req, res) => {
  try {
    const debts = await Debt.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(debts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching debts' });
  }
});

// Get debt by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const debt = await Debt.findOne({ _id: req.params.id, user: req.user.userId });
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    res.json(debt);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching debt' });
  }
});

// Create debt
router.post('/', auth, async (req, res) => {
  try {
    const debt = new Debt({
      ...req.body,
      user: req.user.userId
    });
    await debt.save();
    res.status(201).json(debt);
  } catch (error) {
    res.status(500).json({ message: 'Error creating debt' });
  }
});

// Update debt
router.put('/:id', auth, async (req, res) => {
  try {
    const debt = await Debt.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    res.json(debt);
  } catch (error) {
    res.status(500).json({ message: 'Error updating debt' });
  }
});

// Delete debt
router.delete('/:id', auth, async (req, res) => {
  try {
    const debt = await Debt.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    res.json({ message: 'Debt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting debt' });
  }
});

module.exports = router;
