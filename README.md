# 🏥 Health Tracker App — Full Stack

**React Native (Expo) + Node.js + Express + MongoDB + OpenFoodFacts API**

---

## 📦 Project Structure

```
healthtracker/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── server.js         # Entry point
│   │   ├── models/           # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Meal.js
│   │   │   ├── Water.js
│   │   │   ├── Weight.js
│   │   │   └── ScreenTime.js
│   │   ├── routes/           # Express routes
│   │   │   ├── auth.js
│   │   │   ├── profile.js
│   │   │   ├── calories.js
│   │   │   ├── water.js
│   │   │   ├── bmi.js
│   │   │   ├── screentime.js
│   │   │   ├── food.js       # OpenFoodFacts search
│   │   │   └── analytics.js
│   │   └── middleware/
│   │       └── auth.js       # JWT middleware
│   └── .env.example
│
└── frontend/                 # React Native (Expo)
    ├── App.js
    └── src/
        ├── screens/
        │   ├── LoginScreen.js
        │   ├── RegisterScreen.js
        │   ├── ProfileSetupScreen.js
        │   ├── HomeScreen.js         # Dashboard
        │   ├── CaloriesScreen.js     # Meal logging + food search
        │   ├── WaterScreen.js        # Water tracker
        │   ├── BMIScreen.js          # BMI + weight history
        │   ├── ScreenTimeScreen.js   # Screen time manager
        │   ├── AnalyticsScreen.js    # Charts + weekly stats
        │   └── ProfileScreen.js      # Settings + logout
        ├── context/
        │   └── AuthContext.js        # Global auth state
        ├── services/
        │   └── api.js                # All API calls
        ├── navigation/
        │   └── AppNavigator.js       # Stack + Tab navigation
        └── utils/
            ├── theme.js              # Colors, fonts, spacing
            └── helpers.js            # Utility functions
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (or Expo Go app on phone)

---

### 1. Backend Setup

```bash
cd healthtracker/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET

# Start dev server
npm run dev
```

**Backend .env:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthtracker
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

Backend will run at: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd healthtracker/frontend

# Install dependencies
npm install

# Start Expo
npx expo start
```

**⚠️ Important — Update API URL in `src/services/api.js`:**

| Scenario             | URL                            |
|----------------------|--------------------------------|
| Android Emulator     | `http://10.0.2.2:5000/api`     |
| iOS Simulator        | `http://localhost:5000/api`    |
| Physical Device      | `http://YOUR_IP:5000/api`      |

To find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

---

### 3. Run on Device

**Android emulator:**
```bash
npx expo start --android
```

**iOS simulator:**
```bash
npx expo start --ios
```

**Physical device:**  
Install **Expo Go** from App Store / Play Store, then scan the QR code from terminal.

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | `/api/auth/register`  | Register new user    |
| POST   | `/api/auth/login`     | Login + get token    |
| GET    | `/api/auth/me`        | Get current user     |

### Profile
| Method | Endpoint       | Description          |
|--------|----------------|----------------------|
| GET    | `/api/profile` | Get profile          |
| PUT    | `/api/profile` | Update profile       |

### Calories
| Method | Endpoint                 | Description            |
|--------|--------------------------|------------------------|
| GET    | `/api/calories?date=...` | Get meals for date     |
| POST   | `/api/calories`          | Log a meal             |
| DELETE | `/api/calories/:id`      | Delete a meal          |
| GET    | `/api/calories/week`     | Last 7 days totals     |

### Water
| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| GET    | `/api/water?date=...` | Get water for date     |
| POST   | `/api/water`          | Log water intake       |
| DELETE | `/api/water/:id`      | Delete entry           |
| GET    | `/api/water/week`     | Last 7 days totals     |

### BMI
| Method | Endpoint          | Description            |
|--------|-------------------|------------------------|
| GET    | `/api/bmi/history`| Get weight history     |
| POST   | `/api/bmi`        | Log weight + auto BMI  |
| DELETE | `/api/bmi/:id`    | Delete entry           |

### Screen Time
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| GET    | `/api/screentime?date=...`  | Get screen time        |
| POST   | `/api/screentime`           | Log screen time        |
| DELETE | `/api/screentime/:id`       | Delete entry           |
| GET    | `/api/screentime/week`      | Last 7 days totals     |

### Food Search (OpenFoodFacts)
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/food/search?q=...`  | Search food by name      |
| GET    | `/api/food/barcode/:code` | Look up by barcode       |

### Analytics
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/api/analytics/summary`    | Today's health score     |
| GET    | `/api/analytics/weekly`     | Last 7 days data         |

---

## ✨ Features

| Feature                    | Description                                      |
|----------------------------|--------------------------------------------------|
| 🔐 Auth                    | Register/Login with JWT, secure sessions         |
| 👤 Profile Setup           | Age, height, weight, goal, activity level        |
| 🍽️ Calorie Tracker         | Log meals with OpenFoodFacts food search         |
| 💧 Water Monitor           | Quick-add buttons, progress ring, daily goal     |
| ⚖️ BMI Tracker             | Auto BMI calc, weight history, visual gauge      |
| 📱 Screen Time Manager     | Log by category, daily limit alerts, tips        |
| 📊 Analytics Dashboard     | 7-day bar charts, health score, weekly averages  |
| 📡 OpenFoodFacts API       | Search 3M+ foods, auto nutrition data            |

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React Native, Expo                  |
| Navigation | React Navigation (Stack + Tabs)     |
| State      | React Context + useState            |
| Storage    | AsyncStorage (token persistence)    |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT + bcryptjs                      |
| Food API   | OpenFoodFacts (free, open source)   |
| HTTP       | Axios                               |

---

