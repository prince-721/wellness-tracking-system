const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:     { type: String, required: true }, // YYYY-MM-DD
  mealType: { type: String, enum: ['breakfast','lunch','dinner','snack'], required: true },
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 100 }, // grams
  unit:     { type: String, default: 'g' },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein:  { type: Number, default: 0 },
    carbs:    { type: Number, default: 0 },
    fat:      { type: Number, default: 0 },
    fiber:    { type: Number, default: 0 },
    sugar:    { type: Number, default: 0 },
    sodium:   { type: Number, default: 0 }
  },
  barcode:  { type: String, default: null },
  imageUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meal', MealSchema);
