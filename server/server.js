const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./db');
const carRoutes = require('./routes/cars');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/cars', carRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to The Motor Gazette API' });
});

// Handling 404 in Broad Sheet Newspaper style voice
app.use((req, res) => {
  res.status(404).json({ error: "This edition of The Motor Gazette has no such page." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
