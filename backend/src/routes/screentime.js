const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ScreenTime = require('../models/ScreenTime');

// @GET /api/screentime/week - get last 7 days (MUST BE BEFORE /:id route)
router.get('/week', auth, async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    const results = await Promise.all(days.map(async (date) => {
      const entries = await ScreenTime.find({ user: req.user._id, date });
      const minutes = entries.reduce((s, e) => s + e.duration, 0);
      return { date, minutes };
    }));
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/screentime?date=YYYY-MM-DD
router.get('/', auth, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const entries = await ScreenTime.find({ user: req.user._id, date });
    const total = entries.reduce((s, e) => s + e.duration, 0);
    res.json({ success: true, entries, total, date });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/screentime
router.post('/', auth, async (req, res) => {
  try {
    const entry = await ScreenTime.create({
      user: req.user._id,
      date: req.body.date || new Date().toISOString().split('T')[0],
      ...req.body
    });
    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/screentime/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await ScreenTime.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
