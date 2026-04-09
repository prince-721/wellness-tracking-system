const mongoose = require('mongoose');

const WaterSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:   { type: String, required: true }, // YYYY-MM-DD
  amount: { type: Number, required: true }, // ml
  time:   { type: String }, // HH:MM
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Water', WaterSchema);
