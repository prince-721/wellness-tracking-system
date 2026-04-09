const express = require('express');
const router = express.Router();
const HabitStreak = require('../models/HabitStreak');
const auth = require('../middleware/auth');

// Calculate streak based on last completed date
function updateStreak(streak) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!streak.lastCompletedDate) {
    // First time completing
    streak.currentStreak = 1;
    streak.longestStreak = 1;
    streak.totalDaysCompleted = 1;
  } else {
    const lastComplete = new Date(streak.lastCompletedDate);
    lastComplete.setHours(0, 0, 0, 0);
    
    const diffTime = today - lastComplete;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      // Consecutive day
      streak.currentStreak += 1;
      streak.totalDaysCompleted += 1;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else if (diffDays > 1) {
      // Streak broken, reset
      streak.currentStreak = 1;
      streak.totalDaysCompleted += 1;
    }
    // if diffDays === 0, same day, don't change streak
  }
  
  streak.lastCompletedDate = new Date();
  return streak;
}

// Get all streaks for user
router.get('/', auth, async (req, res) => {
  try {
    const streaks = await HabitStreak.find({ userId: req.user._id });
    res.json({ success: true, streaks });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Mark habit as completed today
router.post('/:type/complete', auth, async (req, res) => {
  try {
    const { type } = req.params;
    
    let streak = await HabitStreak.findOne({ userId: req.user._id, type });
    
    if (!streak) {
      // Create new streak
      streak = new HabitStreak({
        userId: req.user.id,
        type,
        currentStreak: 1,
        longestStreak: 1,
        totalDaysCompleted: 1,
        lastCompletedDate: new Date()
      });
    } else {
      // Update existing streak
      updateStreak(streak);
    }
    
    await streak.save();
    res.json({ success: true, streak });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get streak for specific type
router.get('/:type', auth, async (req, res) => {
  try {
    let streak = await HabitStreak.findOne({ userId: req.user._id, type: req.params.type });
    
    if (!streak) {
      // Create if doesn't exist
      streak = new HabitStreak({ userId: req.user.id, type: req.params.type });
      await streak.save();
    }
    
    res.json({ success: true, streak });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
