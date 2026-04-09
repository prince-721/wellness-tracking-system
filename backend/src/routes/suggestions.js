const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const MealFavorite = require('../models/MealFavorite');
const { analyticsAPI } = require('../models/Meal');
const auth = require('../middleware/auth');

// Mock meal database - can be expanded or connected to OpenFoodFacts
const suggestedMeals = [
  // Breakfast options
  { name: 'Oatmeal with Berries', type: 'breakfast', calories: 350, protein: 12, carbs: 58, fat: 8 },
  { name: 'Scrambled Eggs & Toast', type: 'breakfast', calories: 380, protein: 18, carbs: 35, fat: 16 },
  { name: 'Greek Yogurt Parfait', type: 'breakfast', calories: 320, protein: 20, carbs: 42, fat: 6 },
  { name: 'Protein Pancakes', type: 'breakfast', calories: 400, protein: 30, carbs: 45, fat: 10 },
  
  // Lunch options
  { name: 'Grilled Chicken Salad', type: 'lunch', calories: 450, protein: 45, carbs: 25, fat: 12 },
  { name: 'Tuna Sandwich', type: 'lunch', calories: 480, protein: 35, carbs: 48, fat: 14 },
  { name: 'Quinoa Bowl', type: 'lunch', calories: 520, protein: 20, carbs: 65, fat: 15 },
  { name: 'Turkey & Veggies', type: 'lunch', calories: 420, protein: 40, carbs: 28, fat: 10 },
  { name: 'Salmon & Rice', type: 'lunch', calories: 550, protein: 50, carbs: 50, fat: 12 },
  
  // Dinner options
  { name: 'Beef Stir Fry', type: 'dinner', calories: 650, protein: 48, carbs: 58, fat: 18 },
  { name: 'Grilled Fish & Vegetables', type: 'dinner', calories: 480, protein: 52, carbs: 30, fat: 12 },
  { name: 'Pasta with Meat Sauce', type: 'dinner', calories: 720, protein: 38, carbs: 75, fat: 22 },
  { name: 'Chicken Breast & Sweet Potato', type: 'dinner', calories: 580, protein: 55, carbs: 52, fat: 8 },
  
  // Snack options
  { name: 'Protein Bar', type: 'snack', calories: 200, protein: 20, carbs: 18, fat: 6 },
  { name: 'Apple & Peanut Butter', type: 'snack', calories: 250, protein: 8, carbs: 32, fat: 11 },
  { name: 'Greek Yogurt', type: 'snack', calories: 150, protein: 18, carbs: 12, fat: 3 },
  { name: 'Almonds', type: 'snack', calories: 160, protein: 6, carbs: 6, fat: 14 },
  { name: 'Protein Shake', type: 'snack', calories: 180, protein: 25, carbs: 8, fat: 2 },
  { name: 'Banana', type: 'snack', calories: 105, protein: 1, carbs: 27, fat: 0 },
];

// Get meal suggestions based on current daily intake
router.get('/daily', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const today = date || new Date().toISOString().split('T')[0];

    // Get today's meals
    const mealsResponse = await Meal.find({
      user: req.user._id,
      date: today
    });

    const meals = mealsResponse || [];

    // Calculate current intake
    const currentIntake = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.nutrition?.calories || 0),
        protein: acc.protein + (meal.nutrition?.protein || 0),
        carbs: acc.carbs + (meal.nutrition?.carbs || 0),
        fat: acc.fat + (meal.nutrition?.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Get user's daily goals
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const goals = {
      calories: user?.profile?.dailyCalorieGoal || 2000,
      protein: Math.round((user?.profile?.dailyCalorieGoal || 2000) * 0.3 / 4), // 30% protein
      carbs: Math.round((user?.profile?.dailyCalorieGoal || 2000) * 0.45 / 4),   // 45% carbs
      fat: Math.round((user?.profile?.dailyCalorieGoal || 2000) * 0.25 / 9)      // 25% fat
    };

    // Calculate remaining calories
    const remaining = {
      calories: Math.max(0, goals.calories - currentIntake.calories),
      protein: Math.max(0, goals.protein - currentIntake.protein),
      carbs: Math.max(0, goals.carbs - currentIntake.carbs),
      fat: Math.max(0, goals.fat - currentIntake.fat)
    };

    // Get user's favorite meals
    const favorites = await MealFavorite.find({ userId: req.user._id })
      .sort({ lastUsed: -1 })
      .limit(10);

    // Determine meal type to suggest (breakfast, lunch, dinner, snack)
    const hour = new Date().getHours();
    let mealType = 'snack';
    if (hour < 11) mealType = 'breakfast';
    else if (hour < 15) mealType = 'lunch';
    else if (hour < 20) mealType = 'dinner';

    // Score meals based on how well they fit remaining goals
    const scoredMeals = suggestedMeals.map(meal => {
      // Calculate fit score (0-100)
      const calFit = Math.min(100, (meal.calories / remaining.calories) * 100) || 0;
      const proteinFit = meal.protein > 0 ? Math.min(100, (meal.protein / remaining.protein) * 100) : 100;
      const carbsFit = meal.carbs > 0 ? Math.min(100, (meal.carbs / remaining.carbs) * 100) : 100;
      const fatFit = meal.fat > 0 ? Math.min(100, (meal.fat / remaining.fat) * 100) : 100;

      // Average fit (prioritize calorie fit)
      const fitScore = (calFit * 0.5 + proteinFit * 0.2 + carbsFit * 0.2 + fatFit * 0.1);
      
      // Preference for meal type (exact type match = boost)
      const typeBoost = meal.type === mealType ? 20 : meal.type !== 'snack' ? 5 : 0;
      
      // Check if in favorites
      const isFavorite = favorites.some(f => 
        f.foodName.toLowerCase() === meal.name.toLowerCase()
      );
      const favoriteBoost = isFavorite ? 10 : 0;

      const score = fitScore + typeBoost + favoriteBoost;

      return {
        ...meal,
        fitScore: Math.round(score),
        isFavorite,
        macroMatch: {
          calories: Math.round((meal.calories / remaining.calories) * 100),
          protein: meal.protein > 0 ? Math.round((meal.protein / remaining.protein) * 100) : 0,
          carbs: meal.carbs > 0 ? Math.round((meal.carbs / remaining.carbs) * 100) : 0,
          fat: meal.fat > 0 ? Math.round((meal.fat / remaining.fat) * 100) : 0
        }
      };
    });

    // Sort by fit score and get top suggestions
    const topSuggestions = scoredMeals
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, 5);

    // Filter by meal type preference (but include alternatives)
    const typePriority = topSuggestions
      .filter(m => m.type === mealType)
      .slice(0, 3);
    
    const alternatives = topSuggestions
      .filter(m => m.type !== mealType)
      .slice(0, 2);

    const suggestions = [...typePriority, ...alternatives].slice(0, 5);

    res.json({
      success: true,
      suggestions,
      mealType,
      remainingGoals: remaining,
      currentIntake,
      goals
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get suggestions for specific meal type
router.get('/:mealType', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const today = date || new Date().toISOString().split('T')[0];
    const { mealType } = req.params;

    // Get today's meals
    const mealsResponse = await Meal.find({
      user: req.user._id,
      date: today
    });

    const meals = mealsResponse || [];

    // Calculate current intake
    const currentIntake = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.nutrition?.calories || 0),
        protein: acc.protein + (meal.nutrition?.protein || 0),
        carbs: acc.carbs + (meal.nutrition?.carbs || 0),
        fat: acc.fat + (meal.nutrition?.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Get user's daily goals
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const goals = {
      calories: user?.profile?.dailyCalorieGoal || 2000,
      protein: Math.round((user?.profile?.dailyCalorieGoal || 2000) * 0.3 / 4),
      carbs: Math.round((user?.profile?.dailyCalorieGoal || 2000) * 0.45 / 4),
      fat: Math.round((user?.profile?.dailyCalorieGoal || 2000) * 0.25 / 9)
    };

    const remaining = {
      calories: Math.max(0, goals.calories - currentIntake.calories),
      protein: Math.max(0, goals.protein - currentIntake.protein),
      carbs: Math.max(0, goals.carbs - currentIntake.carbs),
      fat: Math.max(0, goals.fat - currentIntake.fat)
    };

    // Filter for specific meal type
    const mealsForType = suggestedMeals.filter(m => m.type === mealType.toLowerCase());

    // Score meals
    const scoredMeals = mealsForType.map(meal => {
      const calFit = meal.calories > 0 ? Math.min(100, (meal.calories / remaining.calories) * 100) : 0;
      const fit = (calFit * 0.5 + 
                   Math.min(100, (meal.protein / remaining.protein) * 100) * 0.2 +
                   Math.min(100, (meal.carbs / remaining.carbs) * 100) * 0.2 +
                   Math.min(100, (meal.fat / remaining.fat) * 100) * 0.1);

      return {
        ...meal,
        fitScore: Math.round(fit),
        macroMatch: {
          calories: Math.round((meal.calories / remaining.calories) * 100),
          protein: Math.round((meal.protein / remaining.protein) * 100),
          carbs: Math.round((meal.carbs / remaining.carbs) * 100),
          fat: Math.round((meal.fat / remaining.fat) * 100)
        }
      };
    });

    const suggestions = scoredMeals
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, 8);

    res.json({
      success: true,
      suggestions,
      mealType,
      remainingGoals: remaining,
      count: suggestions.length
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
