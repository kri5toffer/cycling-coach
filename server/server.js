// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const mongoose = require('mongoose'); // Added for health check

// Create Express app instance
const app = express();

// Connect to MongoDB - this runs when server starts
connectDB();

// Set server port
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());                           // Enable cross-origin requests
app.use(express.json());                   // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Test endpoint - existing
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the backend, cyclists!' });
});

// Health check endpoint - new
// This helps monitor if database is connected in production
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});