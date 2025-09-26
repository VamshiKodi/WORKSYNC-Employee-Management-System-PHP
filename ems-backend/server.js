console.log('Server script starting...');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./logger');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
// Basic request ID for correlation
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});
// Access logs
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ems', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
// Rate limit auth routes more strictly
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/departments', require('./routes/departments'));

// TEMPORARY: List all users for database verification
app.get('/api/test-users', async (req, res) => {
  try {
    const users = await require('./models/User').find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EMS API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { err: { message: err.message, stack: err.stack }, requestId: req.id });
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 