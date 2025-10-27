const nodemailer = require('nodemailer');

// Create a transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send email notification
const sendEmail = async (to, subject, html, text) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Home Finance System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send bill reminder email
const sendBillReminder = async (user, bill) => {
  const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  const subject = `Bill Reminder: ${bill.name}`;
  const text = `
    Reminder: ${bill.name}
    Amount: $${bill.amount}
    Due Date: ${bill.dueDate}
    Days until due: ${daysUntilDue}
  `;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0EA5E9;">Bill Reminder</h2>
      <p>Hello ${user.name},</p>
      <p>This is a reminder that your bill is coming due:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; background-color: #f5f5f5;"><strong>Bill Name:</strong></td>
          <td style="padding: 10px;">${bill.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f5f5f5;"><strong>Amount:</strong></td>
          <td style="padding: 10px;">$${bill.amount}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f5f5f5;"><strong>Due Date:</strong></td>
          <td style="padding: 10px;">${bill.dueDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f5f5f5;"><strong>Days Until Due:</strong></td>
          <td style="padding: 10px;">${daysUntilDue}</td>
        </tr>
      </table>
      <p>Please remember to pay this bill on time!</p>
      <p style="color: #666; font-size: 12px;">This is an automated reminder from Home Finance System.</p>
    </div>
  `;

  return await sendEmail(user.email, subject, html, text);
};

// Send budget warning email
const sendBudgetWarning = async (user, budget, spent) => {
  const percentage = (spent / budget.amount * 100).toFixed(1);
  
  const subject = `Budget Alert: ${budget.category}`;
  const text = `
    Budget Alert: ${budget.category}
    Budget Amount: $${budget.amount}
    Amount Spent: $${spent}
    Percentage Used: ${percentage}%
  `;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B;">Budget Alert</h2>
      <p>Hello ${user.name},</p>
      <p>Your spending in the <strong>${budget.category}</strong> category has reached ${percentage}% of your budget.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; background-color: #f5f5f5;"><strong>Budget Amount:</strong></td>
          <td style="padding: 10px;">$${budget.amount}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f5f5f5;"><strong>Amount Spent:</strong></td>
          <td style="padding: 10px;">$${spent}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f5f5f5;"><strong>Remaining:</strong></td>
          <td style="padding: 10px;">$${(budget.amount - spent).toFixed(2)}</td>
        </tr>
      </table>
      <p style="color: #666; font-size: 12px;">This is an automated alert from Home Finance System.</p>
    </div>
  `;

  return await sendEmail(user.email, subject, html, text);
};

// Send goal achievement email
const sendGoalAchievement = async (user, goal) => {
  const subject = `🎉 Congratulations! Goal Achieved: ${goal.name}`;
  const text = `
    Congratulations! You have achieved your savings goal!
    Goal: ${goal.name}
    Target Amount: $${goal.targetAmount}
    Amount Saved: $${goal.currentAmount}
  `;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
      <h2 style="color: #10B981;">🎉 Congratulations!</h2>
      <p>Hello ${user.name},</p>
      <p style="font-size: 18px;">You have successfully achieved your savings goal!</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #0EA5E9;">${goal.name}</h3>
        <p><strong>Target:</strong> $${goal.targetAmount}</p>
        <p><strong>Achieved:</strong> $${goal.currentAmount}</p>
      </div>
      <p>Keep up the great work! 🎊</p>
      <p style="color: #666; font-size: 12px;">This is an automated notification from Home Finance System.</p>
    </div>
  `;

  return await sendEmail(user.email, subject, html, text);
};

module.exports = {
  sendEmail,
  sendBillReminder,
  sendBudgetWarning,
  sendGoalAchievement,
};
