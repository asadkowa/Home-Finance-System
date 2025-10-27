const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/SavingsGoal');
const auth = require('../middleware/auth');

// Get all goals for user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals' });
  }
});

// Get goal by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goal' });
  }
});

// Create goal
router.post('/', auth, async (req, res) => {
  try {
    const goal = new SavingsGoal({
      ...req.body,
      user: req.user.userId
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal' });
  }
});

// Update goal
router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal' });
  }
});

// Delete goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal' });
  }
});

module.exports = router;
