const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

// Get dashboard summary
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    const dateFilter = {
      user: userId,
      ...(startDate && endDate && {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
    };

    // Get totals
    const incomeTotal = await Income.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const expenseTotal = await Expense.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get expense by category
    const expensesByCategory = await Expense.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    // Get recent transactions
    const recentIncomes = await Income.find(dateFilter).sort({ date: -1 }).limit(5);
    const recentExpenses = await Expense.find(dateFilter).sort({ date: -1 }).limit(5);

    res.json({
      totalIncome: incomeTotal[0]?.total || 0,
      totalExpenses: expenseTotal[0]?.total || 0,
      balance: (incomeTotal[0]?.total || 0) - (expenseTotal[0]?.total || 0),
      expensesByCategory,
      recentIncomes,
      recentExpenses
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

module.exports = router;
