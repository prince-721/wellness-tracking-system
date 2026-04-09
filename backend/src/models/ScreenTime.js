const mongoose = require('mongoose');

const ScreenTimeSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:     { type: String, required: true }, // YYYY-MM-DD
  duration: { type: Number, required: true }, // minutes
  category: { type: String, enum: ['work','social','entertainment','education','other'], default: 'other' },
  appName:  { type: String, default: '' },
  note:     { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScreenTime', ScreenTimeSchema);
