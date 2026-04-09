const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Water = require('../models/Water');

// @GET /api/water/week - get last 7 days (MUST BE BEFORE /:id route)
router.get('/week', auth, async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    const results = await Promise.all(days.map(async (date) => {
      const entries = await Water.find({ user: req.user._id, date });
      const amount = entries.reduce((s, e) => s + e.amount, 0);
      return { date, amount };
    }));
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/water?date=YYYY-MM-DD
router.get('/', auth, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const entries = await Water.find({ user: req.user._id, date }).sort({ createdAt: 1 });
    const total = entries.reduce((s, e) => s + e.amount, 0);
    res.json({ success: true, entries, total, date });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/water
router.post('/', auth, async (req, res) => {
  const { amount, date, time } = req.body;
  try {
    const entry = await Water.create({
      user: req.user._id,
      amount,
      date: date || new Date().toISOString().split('T')[0],
      time: time || new Date().toTimeString().slice(0, 5)
    });
    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/water/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Water.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
