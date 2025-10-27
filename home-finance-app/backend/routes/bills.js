const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');

// Get all bills for user
router.get('/', auth, async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user.userId }).sort({ dueDate: 1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bills' });
  }
});

// Get bill by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user.userId });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bill' });
  }
});

// Create bill
router.post('/', auth, async (req, res) => {
  try {
    const bill = new Bill({
      ...req.body,
      user: req.user.userId
    });
    await bill.save();
    
    // If recurring, generate future bills
    if (bill.isRecurring) {
      await generateRecurringBills(bill);
    }
    
    res.status(201).json(bill);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ message: 'Error creating bill' });
  }
});

// Update bill
router.put('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    
    // If recurring, generate future bills (if not already generated)
    if (bill.isRecurring) {
      await generateRecurringBills(bill);
    }
    
    res.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ message: 'Error updating bill' });
  }
});

// Delete bill
router.delete('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bill' });
  }
});

// Helper function to generate recurring bills
async function generateRecurringBills(originalBill) {
  try {
    const now = new Date();
    const originalDueDate = new Date(originalBill.dueDate);
    const futureYears = originalBill.recurrenceType === 'yearly' ? 5 : 1;
    const monthsToGenerate = originalBill.recurrenceType === 'monthly' ? 12 : 0;
    
    const billsToCreate = [];
    
    if (originalBill.recurrenceType === 'yearly') {
      // Generate bills for the next N years
      for (let year = 0; year < futureYears; year++) {
        if (year === 0) continue; // Skip the first year (already exists)
        
        const newDueDate = new Date(originalDueDate);
        newDueDate.setFullYear(originalDueDate.getFullYear() + year);
        
        // Only create bills in the future
        if (newDueDate > now) {
          // Check if bill for this date already exists
          const existingBill = await Bill.findOne({
            user: originalBill.user,
            name: originalBill.name,
            dueDate: newDueDate.toISOString(),
            isRecurring: true
          });
          
          if (!existingBill) {
            billsToCreate.push({
              name: originalBill.name,
              category: originalBill.category,
              amount: originalBill.amount,
              dueDate: newDueDate.toISOString(),
              isAutoPaid: originalBill.isAutoPaid,
              isPaid: false,
              notes: originalBill.notes,
              reminderDays: originalBill.reminderDays,
              isRecurring: true,
              recurrenceType: 'yearly',
              user: originalBill.user
            });
          }
        }
      }
    } else if (originalBill.recurrenceType === 'monthly') {
      // Generate bills for the next N months
      for (let month = 1; month <= monthsToGenerate; month++) {
        const newDueDate = new Date(originalDueDate);
        newDueDate.setMonth(originalDueDate.getMonth() + month);
        
        // Only create bills in the future
        if (newDueDate > now) {
          // Check if bill for this date already exists
          const existingBill = await Bill.findOne({
            user: originalBill.user,
            name: originalBill.name,
            dueDate: newDueDate.toISOString(),
            isRecurring: true
          });
          
          if (!existingBill) {
            billsToCreate.push({
              name: originalBill.name,
              category: originalBill.category,
              amount: originalBill.amount,
              dueDate: newDueDate.toISOString(),
              isAutoPaid: originalBill.isAutoPaid,
              isPaid: false,
              notes: originalBill.notes,
              reminderDays: originalBill.reminderDays,
              isRecurring: true,
              recurrenceType: 'monthly',
              user: originalBill.user
            });
          }
        }
      }
    }
    
    // Create all bills in bulk
    if (billsToCreate.length > 0) {
      await Bill.insertMany(billsToCreate);
      console.log(`Generated ${billsToCreate.length} recurring bills for ${originalBill.name}`);
    }
  } catch (error) {
    console.error('Error generating recurring bills:', error);
  }
}

module.exports = router;
