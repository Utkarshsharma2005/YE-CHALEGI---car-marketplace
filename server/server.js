const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./db');
const carRoutes = require('./routes/cars');
const authRoutes = require('./routes/auth');

const app = express();
connectDB();

// CORS Configuration - Supports comma-separated CLIENT_URL values
const allowedOrigins = new Set(
  (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or allowed origins
    if (!origin || allowedOrigins.has(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));

// Request Payload Limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Rate Limiter for Authentication Endpoints (20 requests per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/cars', carRoutes);

app.get('/', (req, res) => res.json({ message: 'Ye Chalegi Used Cars API', status: 'online' }));

// 404 Handler
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

