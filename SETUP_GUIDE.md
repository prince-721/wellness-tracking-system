# Quick Setup & Implementation Guide

## 🚀 How to Deploy These Changes

### Backend Setup

1. **Install Dependencies** (if not already done)
   ```bash
   cd backend
   npm install
   ```

2. **New Environment Variables** (add to `.env` if needed)
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

3. **Database Models** (MongoDB automatically creates collections)
   - Reminder
   - MealFavorite
   - HabitStreak
   - User (updated with new fields)

4. **Start Backend**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Install Dependencies** (if not already done)
   ```bash
   cd frontend
   npm install
   # or
   expo install
   ```

2. **New Dependencies Added**
   - All components use built-in React Native & Expo modules
   - No new npm packages required!

3. **File Structure** (new files created)
   ```
   frontend/src/
   ├── components/
   │   ├── StreamsAndQuickActions.js (NEW)
   │   ├── MetricCard.js (NEW)
   │   ├── RemindersModal.js (NEW)
   │   ├── FavoriteMealSelector.js (NEW)
   │   └── ...
   ├── screens/
   │   ├── FavoritesScreen.js (NEW)
   │   ├── ProfileScreen.js (UPDATED)
   │   └── ...
   ├── services/
   │   └── api.js (UPDATED - added new endpoints)
   ├── navigation/
   │   └── AppNavigator.js (UPDATED - added FavoritesScreen routing)
   └── utils/
       └── theme.js (UPDATED - added new colors & font weights)
   ```

4. **Update API URL**
   - Edit `frontend/src/services/api.js`
   - Change `BASE_URL` to your backend IP/domain
   ```javascript
   export const BASE_URL = 'http://YOUR_BACKEND_IP:5000/api';
   ```

5. **Start Frontend**
   ```bash
   npm start
   # or
   expo start
   ```

---

## 📱 Key Features Quick Tutorial

### 1. Setting Up Reminders
**Path:** Profile → Manage Reminders

```
✓ Create reminder
✓ Set type (water, meal, workout, weight_check)
✓ Set time (e.g., 09:00)
✓ Set frequency (daily/weekdays/weekends)
✓ Toggle on/off
```

### 2. Building Favorite Meals
**Path:** Calories → Log meals normally → Auto-added to favorites

**OR:** Profile → Favorite Meals → Quick view & log

```
✓ Log a meal once
✓ System auto-adds to "Favorite Meals"
✓ Next time, 1-tap quick logging
✓ Tracks "times used" for frequently eaten meals
```

### 3. Habit Streaks
**Path:** Home Screen (view) / Streaks API (track)

```
✓ Automatic tracking for:
  - Daily logging consistency
  - Water goal achievement
  - Calorie goal achievement  
  - Workout completion
✓ Shows current & best streaks
✓ Motivation through gamification
```

### 4. Enhanced Goals
**Path:** ProfileSetup → My Goals

```
✓ Set daily calorie goal (default: 2000 kcal)
✓ Set daily water goal (default: 2500 ml)
✓ Set daily step goal (default: 8000 steps)
✓ Set sleep goal (default: 8 hours)
```

### 5. App Settings
**Path:** Profile → Preferences

```
✓ Toggle notifications on/off
✓ Toggle dark mode
✓ Choose weight/height units
✓ Set dietary restrictions
```

---

## 🔌 API Endpoints Reference

### Reminders
```
GET    /api/reminders              - Get all user reminders
POST   /api/reminders              - Create new reminder
PUT    /api/reminders/:id          - Update reminder
DELETE /api/reminders/:id          - Delete reminder
PATCH  /api/reminders/:id/toggle   - Toggle enabled/disabled
```

### Favorites
```
GET    /api/favorites              - Get all favorite meals
POST   /api/favorites              - Add/update favorite meal
DELETE /api/favorites/:id          - Remove favorite meal
```

### Streaks
```
GET    /api/streaks                - Get all streaks for user
GET    /api/streaks/:type          - Get specific streak
POST   /api/streaks/:type/complete - Mark habit as complete today
```

---

## 🎨 Customization Tips

### Change Colors
**File:** `frontend/src/utils/theme.js`

```javascript
export const COLORS = {
  primary: '#3B82F6',        // Main color
  success: '#4CAF82',        // Success states
  error: '#EF4444',          // Error states
  // ... change others as needed
};
```

### Adjust Default Goals
**File:** `backend/src/models/User.js`

```javascript
dailyCalorieGoal: { type: Number, default: 2000 },
dailyWaterGoal:   { type: Number, default: 2500 },
dailyStepGoal:    { type: Number, default: 8000 },
sleepGoal:        { type: Number, default: 8 },
```

### Customize Reminder Types
**File:** `backend/src/models/Reminder.js`

```javascript
type: { type: String, enum: ['water', 'meal', 'workout', 'weight_check'], required: true }
// Add more types as needed
```

---

## 🧪 Testing the Features

### 1. Test Reminders
```bash
# Backend
1. Login with test user
2. POST to /api/reminders with test data
3. Check GET /api/reminders returns reminder
4. Test toggle endpoint
```

### 2. Test Favorites
```bash
# Frontend
1. Log in app
2. Log some meals in Calories screen
3. Go to Profile → Favorites
4. Should see logged meals there
5. Click "Log Meal" to test quick logging
```

### 3. Test Streaks
```bash
# Backend
1. POST to /api/streaks/daily_logging/complete
2. Should increment current streak
3. Test same endpoint again same day (shouldn't change)
4. Next day, should increment again
```

---

## 📊 Database Schema Reference

### Reminder Document
```javascript
{
  userId: ObjectId,
  type: String,           // 'water', 'meal', 'workout', 'weight_check'
  title: String,          // 'Drink Water'
  message: String,        // Optional description
  time: String,           // 'HH:MM' format
  enabled: Boolean,
  frequency: String,      // 'daily', 'weekdays', 'weekends', 'custom'
  daysOfWeek: [Number],   // 0=Sunday, 6=Saturday
  createdAt: Date,
  updatedAt: Date
}
```

### MealFavorite Document
```javascript
{
  userId: ObjectId,
  foodName: String,
  barcode: String,        // Optional from OpenFoodFacts
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  servingSize: String,    // '100g', '1 cup', etc
  servingUnit: String,
  timesLogged: Number,    // Auto-increments
  lastUsed: Date,
  createdAt: Date
}
```

### HabitStreak Document
```javascript
{
  userId: ObjectId,
  type: String,                       // 'daily_logging', 'water_goal', etc
  currentStreak: Number,
  longestStreak: Number,
  lastCompletedDate: Date,
  totalDaysCompleted: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### Issue: Reminders not appearing
**Solution:**
- Check OS-level notification settings (iOS/Android)
- Ensure `notificationsEnabled` is true in user settings
- Backend must be running

### Issue: Favorites not building up
**Solution:**
- Meals auto-add only after being logged
- Check database that MealFavorite documents are created
- Verify user ID is correctly passed with requests

### Issue: Streaks always at 0
**Solution:**
- Streaks need explicit API call to complete
- Call `/api/streaks/:type/complete` to mark as done
- Check lastCompletedDate logic in streaks route

### Issue: Navigation to Favorites not working
**Solution:**
- Ensure FavoritesScreen import in AppNavigator
- Check MainStack is properly configured
- Verify ProfileScreen navigation.navigate('Favorites') is called

---

## 📈 Performance Optimization

Already optimized for daily use:
- ✅ Minimal API calls
- ✅ Efficient database queries
- ✅ Local state management
- ✅ No unnecessary re-renders
- ✅ Responsive UI with quick feedback

For production, consider:
- Add caching/Redux for offline support
- Implement pagination for large lists
- Add image compression for meal photos
- Use database indexes on userId fields

---

## 🔐 Security Notes

All authenticated endpoints check JWT token via auth middleware:
- Verify tokens in `.env` JWT_SECRET
- User ID extracted from token payload
- All queries filtered by userId to prevent data leakage

---

## 📚 Additional Resources

- React Native Docs: https://reactnative.dev
- Expo Docs: https://docs.expo.dev
- Express.js: https://expressjs.com
- MongoDB: https://docs.mongodb.com

---

**You're all set! The app is now much better for daily life use. 🎉**
