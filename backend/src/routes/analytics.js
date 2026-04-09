const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Meal = require('../models/Meal');
const Water = require('../models/Water');
const Weight = require('../models/Weight');
const ScreenTime = require('../models/ScreenTime');

// @GET /api/analytics/summary?date=YYYY-MM-DD
router.get('/summary', auth, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const user = req.user;
  try {
    const [meals, water, weights, screenTimes] = await Promise.all([
      Meal.find({ user: user._id, date }),
      Water.find({ user: user._id, date }),
      Weight.find({ user: user._id }).sort({ date: -1 }).limit(1),
      ScreenTime.find({ user: user._id, date })
    ]);

    const calorieGoal = user.profile?.dailyCalorieGoal || 2000;
    const waterGoal   = user.profile?.dailyWaterGoal   || 2500;
    const screenGoal  = 120; // 2 hours

    const totalCalories = meals.reduce((s, m) => s + (m.nutrition.calories || 0), 0);
    const totalWater    = water.reduce((s, w) => s + w.amount, 0);
    const totalScreen   = screenTimes.reduce((s, e) => s + e.duration, 0);
    const latestWeight  = weights[0] || null;

    // Health score calculation (0-100)
    const calorieScore = Math.min(100, Math.max(0, 100 - Math.abs(totalCalories - calorieGoal) / calorieGoal * 100));
    const waterScore   = Math.min(100, (totalWater / waterGoal) * 100);
    const screenScore  = totalScreen === 0 ? 100 : Math.max(0, 100 - ((totalScreen - screenGoal) / screenGoal * 50));
    const weightScore  = latestWeight ? (latestWeight.bmiCategory === 'Normal' ? 100 : latestWeight.bmiCategory === 'Underweight' ? 60 : latestWeight.bmiCategory === 'Overweight' ? 70 : 50) : 75;
    const healthScore  = Math.round((calorieScore * 0.35) + (waterScore * 0.3) + (screenScore * 0.2) + (weightScore * 0.15));

    res.json({
      success: true, date,
      summary: {
        calories:    { consumed: Math.round(totalCalories), goal: calorieGoal, percentage: Math.round((totalCalories / calorieGoal) * 100) },
        water:       { consumed: totalWater, goal: waterGoal, percentage: Math.round((totalWater / waterGoal) * 100) },
        screenTime:  { used: totalScreen, limit: screenGoal, percentage: Math.round((totalScreen / screenGoal) * 100) },
        weight:      latestWeight ? { value: latestWeight.weight, bmi: latestWeight.bmi, category: latestWeight.bmiCategory } : null,
        healthScore,
        macros: {
          protein: parseFloat(meals.reduce((s, m) => s + (m.nutrition.protein || 0), 0).toFixed(1)),
          carbs:   parseFloat(meals.reduce((s, m) => s + (m.nutrition.carbs   || 0), 0).toFixed(1)),
          fat:     parseFloat(meals.reduce((s, m) => s + (m.nutrition.fat     || 0), 0).toFixed(1))
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/analytics/weekly
router.get('/weekly', auth, async (req, res) => {
  const user = req.user;
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    const data = await Promise.all(days.map(async (date) => {
      const [meals, water, screen] = await Promise.all([
        Meal.find({ user: user._id, date }),
        Water.find({ user: user._id, date }),
        ScreenTime.find({ user: user._id, date })
      ]);
      return {
        date,
        calories: Math.round(meals.reduce((s, m) => s + (m.nutrition.calories || 0), 0)),
        water: water.reduce((s, w) => s + w.amount, 0),
        screenTime: screen.reduce((s, e) => s + e.duration, 0)
      };
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
