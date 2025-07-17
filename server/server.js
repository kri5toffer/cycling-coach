// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const mongoose = require('mongoose');

// Create Express app instance
const app = express();

// Connect to MongoDB
connectDB();

// Set server port
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic test endpoints
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the backend, cyclists!' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.name
  });
});

// API Routes
const userProfileRoutes = require('./routes/userProfile');
const sessionRoutes = require('./routes/session');
// const testRoutes = require('./routes/test'); // This file doesn't exist yet

app.use('/api/profile', userProfileRoutes);
app.use('/api/session', sessionRoutes);
// app.use('/api/test', testRoutes); // Commented out until test routes are implemented

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Cycling Coach API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      session: {
        create: 'POST /api/session',
        get: 'GET /api/session/:sessionId',
        updateStatus: 'PUT /api/session/:sessionId/status',
        trackExport: 'POST /api/session/:sessionId/export',
        getComplete: 'GET /api/session/:sessionId/complete'
      },
      profile: {
        create: 'POST /api/profile',
        get: 'GET /api/profile/:sessionId',
        update: 'PUT /api/profile/:sessionId',
        delete: 'DELETE /api/profile/:sessionId'
      }
      /* Test routes not implemented yet
      test: {
        createDummy: 'POST /api/test/dummy-data',
        getSessions: 'GET /api/test/sessions',
        cleanup: 'DELETE /api/test/cleanup'
      }
      */
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'API endpoint not found',
//     availableEndpoints: '/api'
//   });
// });

// Start server
app.listen(PORT, () => {
  console.log(`🚴 Cycling Coach API running on http://localhost:${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}/api`);
});