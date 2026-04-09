const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Weight = require('../models/Weight');

// @GET /api/bmi/history
router.get('/history', auth, async (req, res) => {
  try {
    const entries = await Weight.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
    res.json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/bmi
router.post('/', auth, async (req, res) => {
  const { weight, date, note } = req.body;
  const height = req.user.profile?.height;
  try {
    let bmi = null;
    let bmiCategory = null;
    if (height && weight) {
      const hm = height / 100;
      bmi = parseFloat((weight / (hm * hm)).toFixed(1));
      if (bmi < 18.5)      bmiCategory = 'Underweight';
      else if (bmi < 25)   bmiCategory = 'Normal';
      else if (bmi < 30)   bmiCategory = 'Overweight';
      else                 bmiCategory = 'Obese';
    }
    const entry = await Weight.create({
      user: req.user._id,
      weight, bmi, bmiCategory,
      date: date || new Date().toISOString().split('T')[0],
      note: note || ''
    });
    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/bmi/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Weight.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
