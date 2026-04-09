const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');

// Get all reminders for user
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).sort({ time: 1 });
    res.json({ success: true, reminders });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Create reminder
router.post('/', auth, async (req, res) => {
  try {
    const { type, title, message, time, frequency, daysOfWeek } = req.body;
    
    const reminder = new Reminder({
      userId: req.user._id,
      type,
      title,
      message,
      time,
      frequency,
      daysOfWeek: daysOfWeek || []
    });

    await reminder.save();
    res.json({ success: true, reminder });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Update reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found' });
    res.json({ success: true, reminder });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found' });
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Toggle reminder on/off
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found' });
    
    reminder.enabled = !reminder.enabled;
    await reminder.save();
    res.json({ success: true, reminder });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
