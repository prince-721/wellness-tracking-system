const express = require('express');
const router = express.Router();
const MealFavorite = require('../models/MealFavorite');
const auth = require('../middleware/auth');

// Get all favorite meals for user
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await MealFavorite.find({ userId: req.user._id })
      .sort({ lastUsed: -1 });
    res.json({ success: true, favorites });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Add meal to favorites
router.post('/', auth, async (req, res) => {
  try {
    const { foodName, barcode, calories, protein, carbs, fat, servingSize, servingUnit } = req.body;
    
    // Check if already favorited
    let favorite = await MealFavorite.findOne({ 
      userId: req.user._id, 
      foodName: foodName.toLowerCase() 
    });

    if (favorite) {
      // Increment times logged
      favorite.timesLogged += 1;
      favorite.lastUsed = new Date();
      await favorite.save();
    } else {
      favorite = new MealFavorite({
        userId: req.user._id,
        foodName,
        barcode,
        calories,
        protein,
        carbs,
        fat,
        servingSize,
        servingUnit,
        timesLogged: 1
      });
      await favorite.save();
    }

    res.json({ success: true, favorite });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Delete favorite meal
router.delete('/:id', auth, async (req, res) => {
  try {
    const favorite = await MealFavorite.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    if (!favorite) return res.status(404).json({ success: false, message: 'Favorite not found' });
    res.json({ success: true, message: 'Favorite removed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
