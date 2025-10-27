const Notification = require('../models/Notification');
const emailService = require('./emailService');
const smsService = require('./smsService');

class NotificationService {
  // Send bill reminder notification
  static async sendBillReminder(user, bill) {
    const notifications = [];

    // Email notification
    if (user.notifications.email.enabled && user.notifications.email.billReminders) {
      const emailResult = await emailService.sendBillReminder(user, bill);
      const notification = await Notification.create({
        user: user._id,
        type: 'bill_reminder',
        channel: 'email',
        title: `Bill Reminder: ${bill.name}`,
        message: `Your bill ${bill.name} is due on ${bill.dueDate}`,
        data: { billId: bill._id },
        status: emailResult.success ? 'sent' : 'failed',
        sentAt: emailResult.success ? new Date() : null,
        error: emailResult.error || null,
      });
      notifications.push(notification);
    }

    // SMS notification
    if (user.notifications.sms.enabled && user.notifications.sms.billReminders && user.phoneNumber) {
      const smsResult = await smsService.sendBillReminderSMS(user.phoneNumber, bill);
      const notification = await Notification.create({
        user: user._id,
        type: 'bill_reminder',
        channel: 'sms',
        title: `Bill Reminder: ${bill.name}`,
        message: `Your bill ${bill.name} is due on ${bill.dueDate}`,
        data: { billId: bill._id },
        status: smsResult.success ? 'sent' : 'failed',
        sentAt: smsResult.success ? new Date() : null,
        error: smsResult.error || null,
      });
      notifications.push(notification);
    }

    // Push notification (would be handled by a push notification service)
    if (user.notifications.push.enabled && user.notifications.push.billReminders) {
      const notification = await Notification.create({
        user: user._id,
        type: 'bill_reminder',
        channel: 'push',
        title: `Bill Reminder: ${bill.name}`,
        message: `Your bill ${bill.name} is due on ${bill.dueDate}`,
        data: { billId: bill._id },
        status: 'pending',
      });
      notifications.push(notification);
    }

    return notifications;
  }

  // Send budget warning notification
  static async sendBudgetWarning(user, budget, spent) {
    const notifications = [];

    // Email notification
    if (user.notifications.email.enabled && user.notifications.email.budgetAlerts) {
      const emailResult = await emailService.sendBudgetWarning(user, budget, spent);
      const notification = await Notification.create({
        user: user._id,
        type: 'budget_alert',
        channel: 'email',
        title: `Budget Alert: ${budget.category}`,
        message: `You've used ${(spent / budget.amount * 100).toFixed(1)}% of your ${budget.category} budget`,
        data: { budgetId: budget._id, spent, amount: budget.amount },
        status: emailResult.success ? 'sent' : 'failed',
        sentAt: emailResult.success ? new Date() : null,
        error: emailResult.error || null,
      });
      notifications.push(notification);
    }

    // SMS notification
    if (user.notifications.sms.enabled && user.notifications.sms.budgetAlerts && user.phoneNumber) {
      const smsResult = await smsService.sendBudgetWarningSMS(user.phoneNumber, budget, spent);
      const notification = await Notification.create({
        user: user._id,
        type: 'budget_alert',
        channel: 'sms',
        title: `Budget Alert: ${budget.category}`,
        message: `You've used ${(spent / budget.amount * 100).toFixed(1)}% of your ${budget.category} budget`,
        data: { budgetId: budget._id, spent, amount: budget.amount },
        status: smsResult.success ? 'sent' : 'failed',
        sentAt: smsResult.success ? new Date() : null,
        error: smsResult.error || null,
      });
      notifications.push(notification);
    }

    // Push notification
    if (user.notifications.push.enabled && user.notifications.push.budgetAlerts) {
      const notification = await Notification.create({
        user: user._id,
        type: 'budget_alert',
        channel: 'push',
        title: `Budget Alert: ${budget.category}`,
        message: `You've used ${(spent / budget.amount * 100).toFixed(1)}% of your ${budget.category} budget`,
        data: { budgetId: budget._id, spent, amount: budget.amount },
        status: 'pending',
      });
      notifications.push(notification);
    }

    return notifications;
  }

  // Send goal achievement notification
  static async sendGoalAchievement(user, goal) {
    const notifications = [];

    // Email notification
    if (user.notifications.email.enabled && user.notifications.email.goalAchievements) {
      const emailResult = await emailService.sendGoalAchievement(user, goal);
      const notification = await Notification.create({
        user: user._id,
        type: 'goal_achievement',
        channel: 'email',
        title: `Goal Achieved: ${goal.name}`,
        message: `Congratulations! You've achieved your savings goal: ${goal.name}`,
        data: { goalId: goal._id },
        status: emailResult.success ? 'sent' : 'failed',
        sentAt: emailResult.success ? new Date() : null,
        error: emailResult.error || null,
      });
      notifications.push(notification);
    }

    // SMS notification
    if (user.notifications.sms.enabled && user.notifications.sms.goalAchievements && user.phoneNumber) {
      const smsResult = await smsService.sendGoalAchievementSMS(user.phoneNumber, goal);
      const notification = await Notification.create({
        user: user._id,
        type: 'goal_achievement',
        channel: 'sms',
        title: `Goal Achieved: ${goal.name}`,
        message: `Congratulations! You've achieved your savings goal: ${goal.name}`,
        data: { goalId: goal._id },
        status: smsResult.success ? 'sent' : 'failed',
        sentAt: smsResult.success ? new Date() : null,
        error: smsResult.error || null,
      });
      notifications.push(notification);
    }

    // Push notification
    if (user.notifications.push.enabled && user.notifications.push.goalAchievements) {
      const notification = await Notification.create({
        user: user._id,
        type: 'goal_achievement',
        channel: 'push',
        title: `Goal Achieved: ${goal.name}`,
        message: `Congratulations! You've achieved your savings goal: ${goal.name}`,
        data: { goalId: goal._id },
        status: 'pending',
      });
      notifications.push(notification);
    }

    return notifications;
  }

  // Send payment confirmation notification
  static async sendPaymentConfirmation(user, type, amount, description) {
    const notifications = [];

    // Email notification
    if (user.notifications.email.enabled && user.notifications.email.paymentConfirmations) {
      const emailResult = await emailService.sendEmail(
        user.email,
        'Payment Confirmation',
        `<h2>Payment Confirmed</h2><p>${type} - $${amount}</p><p>${description || ''}</p>`,
        `${type} - $${amount} - ${description || ''}`
      );
      const notification = await Notification.create({
        user: user._id,
        type: 'payment_confirmation',
        channel: 'email',
        title: 'Payment Confirmation',
        message: `${type} - $${amount}`,
        data: { type, amount, description },
        status: emailResult.success ? 'sent' : 'failed',
        sentAt: emailResult.success ? new Date() : null,
        error: emailResult.error || null,
      });
      notifications.push(notification);
    }

    // SMS notification
    if (user.notifications.sms.enabled && user.notifications.sms.paymentConfirmations && user.phoneNumber) {
      const smsResult = await smsService.sendPaymentConfirmationSMS(user.phoneNumber, type, amount, description);
      const notification = await Notification.create({
        user: user._id,
        type: 'payment_confirmation',
        channel: 'sms',
        title: 'Payment Confirmation',
        message: `${type} - $${amount}`,
        data: { type, amount, description },
        status: smsResult.success ? 'sent' : 'failed',
        sentAt: smsResult.success ? new Date() : null,
        error: smsResult.error || null,
      });
      notifications.push(notification);
    }

    // Push notification
    if (user.notifications.push.enabled && user.notifications.push.paymentConfirmations) {
      const notification = await Notification.create({
        user: user._id,
        type: 'payment_confirmation',
        channel: 'push',
        title: 'Payment Confirmation',
        message: `${type} - $${amount}`,
        data: { type, amount, description },
        status: 'pending',
      });
      notifications.push(notification);
    }

    return notifications;
  }

  // Get user notifications
  static async getUserNotifications(userId, limit = 50) {
    return await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    return await Notification.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() }
    );
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    return await Notification.findOneAndDelete({ _id: notificationId, user: userId });
  }
}

module.exports = NotificationService;
