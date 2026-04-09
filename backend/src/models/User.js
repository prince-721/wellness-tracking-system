const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  profile: {
    age:        { type: Number },
    gender:     { type: String, enum: ['male', 'female', 'other'] },
    height:     { type: Number }, // cm
    weight:     { type: Number }, // kg
    activityLevel: { type: String, enum: ['sedentary','light','moderate','active','very_active'], default: 'moderate' },
    goal:       { type: String, enum: ['lose_weight','maintain','gain_weight'], default: 'maintain' },
    dailyCalorieGoal: { type: Number, default: 2000 },
    dailyWaterGoal:   { type: Number, default: 2500 }, // ml
    dailyStepGoal:    { type: Number, default: 8000 },
    sleepGoal:        { type: Number, default: 8 }, // hours
    profileComplete: { type: Boolean, default: false },
    dietaryRestrictions: [{ type: String }], // vegan, gluten-free, etc
    preferredMeals: [{ type: String }] // user's favorite meal types
  },
  settings: {
    notificationsEnabled: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    weightUnit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
    heightUnit: { type: String, enum: ['cm', 'ft'], default: 'cm' }
  },
  avatar: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
