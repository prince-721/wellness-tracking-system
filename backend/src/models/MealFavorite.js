const mongoose = require('mongoose');

const MealFavoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodName: { type: String, required: true },
  barcode: { type: String },
  calories: { type: Number },
  protein: { type: Number },
  carbs: { type: Number },
  fat: { type: Number },
  servingSize: { type: String },
  servingUnit: { type: String },
  customNotes: { type: String },
  timesLogged: { type: Number, default: 1 },
  lastUsed: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MealFavorite', MealFavoriteSchema);
