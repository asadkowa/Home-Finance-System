const twilio = require('twilio');

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.warn('Twilio credentials not configured. SMS notifications will be disabled.');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

// Send SMS notification
const sendSMS = async (to, message) => {
  try {
    const client = getTwilioClient();
    
    if (!client) {
      console.warn('SMS not configured. Message would have been:', message);
      return { success: false, error: 'SMS service not configured' };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log('SMS sent:', result.sid);
    return { success: true, messageSid: result.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

// Send bill reminder SMS
const sendBillReminderSMS = async (phoneNumber, bill) => {
  const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  const message = `Home Finance Alert: Bill reminder - ${bill.name} for $${bill.amount} is due in ${daysUntilDue} days. Due date: ${bill.dueDate}. Pay on time!`;
  
  return await sendSMS(phoneNumber, message);
};

// Send budget warning SMS
const sendBudgetWarningSMS = async (phoneNumber, budget, spent) => {
  const percentage = (spent / budget.amount * 100).toFixed(1);
  const remaining = budget.amount - spent;
  
  const message = `Budget Alert: You've used ${percentage}% of your ${budget.category} budget ($${spent}/$${budget.amount}). Remaining: $${remaining.toFixed(2)}`;
  
  return await sendSMS(phoneNumber, message);
};

// Send goal achievement SMS
const sendGoalAchievementSMS = async (phoneNumber, goal) => {
  const message = `🎉 Congratulations! You've achieved your goal: ${goal.name}! Target: $${goal.targetAmount}, Achieved: $${goal.currentAmount}. Keep it up! 🎊`;
  
  return await sendSMS(phoneNumber, message);
};

// Send payment confirmation SMS
const sendPaymentConfirmationSMS = async (phoneNumber, type, amount, description) => {
  const message = `Payment Confirmed: ${type} - $${amount}${description ? ' - ' + description : ''}. Thank you for using Home Finance System!`;
  
  return await sendSMS(phoneNumber, message);
};

module.exports = {
  sendSMS,
  sendBillReminderSMS,
  sendBudgetWarningSMS,
  sendGoalAchievementSMS,
  sendPaymentConfirmationSMS,
};
