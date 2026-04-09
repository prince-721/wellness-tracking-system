const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @PUT /api/profile
router.put('/', auth, async (req, res) => {
  const { age, gender, height, weight, activityLevel, goal, dailyCalorieGoal, dailyWaterGoal } = req.body;
  try {
    const profile = {
      age, gender, height, weight, activityLevel, goal,
      dailyCalorieGoal: dailyCalorieGoal || calculateCalorieGoal(age, gender, height, weight, activityLevel, goal),
      dailyWaterGoal: dailyWaterGoal || Math.round((weight || 70) * 35),
      profileComplete: true
    };
    const user = await User.findByIdAndUpdate(req.user._id, { profile }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/profile
router.get('/', auth, async (req, res) => {
  res.json({ success: true, profile: req.user.profile });
});

function calculateCalorieGoal(age, gender, height, weight, activityLevel, goal) {
  if (!age || !height || !weight) return 2000;
  // Mifflin-St Jeor Equation
  let bmr = gender === 'female'
    ? (10 * weight) + (6.25 * height) - (5 * age) - 161
    : (10 * weight) + (6.25 * height) - (5 * age) + 5;
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  let tdee = bmr * (multipliers[activityLevel] || 1.55);
  if (goal === 'lose_weight') tdee -= 500;
  if (goal === 'gain_weight') tdee += 500;
  return Math.round(tdee);
}

module.exports = router;
