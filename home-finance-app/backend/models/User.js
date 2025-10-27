const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  currency: {
    type: String,
    default: 'USD'
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      billReminders: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      goalAchievements: { type: Boolean, default: true },
      paymentConfirmations: { type: Boolean, default: false }
    },
    sms: {
      enabled: { type: Boolean, default: false },
      billReminders: { type: Boolean, default: false },
      budgetAlerts: { type: Boolean, default: false },
      goalAchievements: { type: Boolean, default: false },
      paymentConfirmations: { type: Boolean, default: false }
    },
    push: {
      enabled: { type: Boolean, default: true },
      billReminders: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      goalAchievements: { type: Boolean, default: true },
      paymentConfirmations: { type: Boolean, default: false }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
