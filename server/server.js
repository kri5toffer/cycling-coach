// Load environment variables from .env file (optional)
require('dotenv').config();

// Import Express.js web framework
const express = require('express');

// Import CORS middleware for cross-origin requests
const cors = require('cors');

// Create Express app instance
const app = express();

// Set server port (from env or default to 3001)
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Define GET endpoint at /api/message
app.get('/api/message', (req, res) => {
  // Send JSON response
  res.json({ message: 'Hello from the backend, cyclists!' });
});

// Start server and listen on specified port 
app.listen(PORT, () => {
  // Log server start confirmation
  console.log(`Server is running on http://localhost:${PORT}`);
});
