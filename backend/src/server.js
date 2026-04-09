const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://10.238.214.211:3000', 'http://10.65.4.27:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, req.body);
  next();
});

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/profile',     require('./routes/profile'));
app.use('/api/calories',    require('./routes/calories'));
app.use('/api/water',       require('./routes/water'));
app.use('/api/bmi',         require('./routes/bmi'));
app.use('/api/screentime',  require('./routes/screentime'));
app.use('/api/analytics',   require('./routes/analytics'));
app.use('/api/food',        require('./routes/food'));
app.use('/api/reminders',   require('./routes/reminders'));
app.use('/api/favorites',   require('./routes/favorites'));
app.use('/api/streaks',     require('./routes/streaks'));
app.use('/api/suggestions', require('./routes/suggestions'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Health Tracker API running ✅', timestamp: new Date() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', mongodb: 'connected', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthtracker')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
