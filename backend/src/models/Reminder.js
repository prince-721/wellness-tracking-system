const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['water', 'meal', 'workout', 'weight_check'], required: true },
  title: { type: String, required: true },
  message: { type: String },
  time: { type: String }, // HH:MM format
  enabled: { type: Boolean, default: true },
  frequency: { type: String, enum: ['daily', 'weekdays', 'weekends', 'custom'], default: 'daily' },
  daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sunday, for custom frequency
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminder', ReminderSchema);
