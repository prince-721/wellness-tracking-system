const mongoose = require('mongoose');

const WeightSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:   { type: String, required: true }, // YYYY-MM-DD
  weight: { type: Number, required: true }, // kg
  bmi:    { type: Number },
  bmiCategory: { type: String },
  note:   { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Calculate BMI category
WeightSchema.methods.getBMICategory = function() {
  const bmi = this.bmi;
  if (!bmi) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Normal';
  if (bmi < 30)   return 'Overweight';
  return 'Obese';
};

module.exports = mongoose.model('Weight', WeightSchema);
