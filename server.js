require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets (points to frontend folder, fallback to public)
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      errors: messages
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      error: `Resource not found with id of ${err.value}`
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Fallback handler for single-page routing
app.use((req, res) => {
  const frontendIndex = path.join(frontendPath, 'index.html');
  res.sendFile(frontendIndex, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🚀 StaffFlow Pro Employee Server Started!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📊 API Base: http://localhost:${PORT}/api/employees`);
  console.log(`================================================`);
});

module.exports = app;
