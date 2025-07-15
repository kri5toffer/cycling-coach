require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Simple cycling data schema
const CyclingData = mongoose.model('CyclingData', {
  rider: String,
  distance: Number,
  time: Number,
  date: { type: Date, default: Date.now }
});

// Routes
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the backend, cyclists!' });
});

app.get('/api/rides', async (req, res) => {
  try {
    const rides = await CyclingData.find();
    res.json(rides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rides', async (req, res) => {
  try {
    const newRide = new CyclingData(req.body);
    const savedRide = await newRide.save();
    res.status(201).json(savedRide);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});