import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL (use your machine's IP for physical device)
export const BASE_URL = 'http://10.238.214.211:5000/api'; // Android emulator
// export const BASE_URL = 'http://localhost:5000/api'; // iOS simulator
// export const BASE_URL = 'http://10.238.214.211:5000/api'; // Physical device

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased from 10s to 30s for stability
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    console.warn('Failed to get token from storage:', e);
  }
  return config;
}, err => Promise.reject(err));

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  async err => {
    console.error('API Error:', err.message, err.response?.status, err.response?.data);
    if (err.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.warn('Failed to clear storage:', e);
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me')
};

// ── Profile ───────────────────────────────────────────
export const profileAPI = {
  update: (data) => api.put('/profile', data),
  get:    ()     => api.get('/profile')
};

// ── Calories ──────────────────────────────────────────
export const caloriesAPI = {
  getByDate: (date) => api.get(`/calories?date=${date}`),
  add:       (data) => api.post('/calories', data),
  delete:    (id)   => api.delete(`/calories/${id}`),
  getWeek:   ()     => api.get('/calories/week')
};

// ── Water ─────────────────────────────────────────────
export const waterAPI = {
  getByDate: (date)   => api.get(`/water?date=${date}`),
  add:       (data)   => api.post('/water', data),
  delete:    (id)     => api.delete(`/water/${id}`),
  getWeek:   ()       => api.get('/water/week')
};

// ── BMI ───────────────────────────────────────────────
export const bmiAPI = {
  getHistory: ()     => api.get('/bmi/history'),
  log:        (data) => api.post('/bmi', data),
  delete:     (id)   => api.delete(`/bmi/${id}`)
};

// ── Screen Time ───────────────────────────────────────
export const screenTimeAPI = {
  getByDate: (date) => api.get(`/screentime?date=${date}`),
  add:       (data) => api.post('/screentime', data),
  delete:    (id)   => api.delete(`/screentime/${id}`),
  getWeek:   ()     => api.get('/screentime/week')
};

// ── Food Search ───────────────────────────────────────
export const foodAPI = {
  search:  (q)    => api.get(`/food/search?q=${encodeURIComponent(q)}`),
  barcode: (code) => api.get(`/food/barcode/${code}`)
};

// ── Analytics ─────────────────────────────────────────
export const analyticsAPI = {
  getSummary: (date) => api.get(`/analytics/summary?date=${date}`),
  getWeekly:  ()     => api.get('/analytics/summary') // Returns weekly data from summary
};

// ── Reminders ─────────────────────────────────────────
export const remindersAPI = {
  getAll:    ()     => api.get('/reminders'),
  create:    (data) => api.post('/reminders', data),
  update:    (id, data) => api.put(`/reminders/${id}`, data),
  delete:    (id)   => api.delete(`/reminders/${id}`),
  toggle:    (id)   => api.patch(`/reminders/${id}/toggle`)
};

// ── Meal Favorites ────────────────────────────────────
export const favoritesAPI = {
  getAll:    ()     => api.get('/favorites'),
  add:       (data) => api.post('/favorites', data),
  delete:    (id)   => api.delete(`/favorites/${id}`)
};

// ── Habit Streaks ─────────────────────────────────────
export const streaksAPI = {
  getAll:    ()                 => api.get('/streaks'),
  getByType: (type)             => api.get(`/streaks/${type}`),
  complete:  (type)             => api.post(`/streaks/${type}/complete`)
};
// ── Meal Suggestions ──────────────────────────────
export const suggestionsAPI = {
  getDaily:        (date)       => api.get(`/suggestions/daily${date ? `?date=${date}` : ''}`),
  getByMealType:   (type, date) => api.get(`/suggestions/${type}${date ? `?date=${date}` : ''}`)
};