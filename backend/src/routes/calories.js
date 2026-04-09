const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Meal = require('../models/Meal');

// @GET /api/calories/week - last 7 days totals (MUST BE BEFORE /:id route)
router.get('/week', auth, async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    const results = await Promise.all(days.map(async (date) => {
      const meals = await Meal.find({ user: req.user._id, date });
      const calories = meals.reduce((s, m) => s + (m.nutrition.calories || 0), 0);
      return { date, calories };
    }));
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/calories?date=YYYY-MM-DD
router.get('/', auth, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const meals = await Meal.find({ user: req.user._id, date }).sort({ createdAt: 1 });
    const totals = meals.reduce((acc, m) => {
      acc.calories += m.nutrition.calories || 0;
      acc.protein  += m.nutrition.protein  || 0;
      acc.carbs    += m.nutrition.carbs    || 0;
      acc.fat      += m.nutrition.fat      || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    res.json({ success: true, meals, totals, date });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/calories
router.post('/', auth, async (req, res) => {
  try {
    const meal = await Meal.create({ user: req.user._id, ...req.body });
    res.status(201).json({ success: true, meal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/calories/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!meal) return res.status(404).json({ success: false, message: 'Meal not found' });
    res.json({ success: true, message: 'Meal deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
