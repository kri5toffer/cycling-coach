const mongoose = require('mongoose');

const trainingPlanSchema = new mongoose.Schema({
  // Link to user profile via session
  sessionId: {
    type: String,
    required: true,
    index: true   // Fast lookups by session
  },
  
  // Plan metadata - high-level information about the plan
  planName: {
    type: String,
    required: true
  },
  duration: {
    weeks: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  
  // Weekly overview - helps users understand training load
  weeklyStructure: {
    totalHours: Number,
    totalDistance: Number,
    numberOfWorkouts: Number
  },
  
  // Training zones - critical for structured training
  // Can be based on heart rate, power, or perceived exertion
  zones: {
    type: {
      type: String,
      enum: ['heart_rate', 'power', 'rpe'], // Rate of Perceived Exertion
      default: 'rpe'
    },
    values: {
      recovery: { min: Number, max: Number },
      endurance: { min: Number, max: Number },
      tempo: { min: Number, max: Number },
      threshold: { min: Number, max: Number },
      vo2max: { min: Number, max: Number },
      neuromuscular: { min: Number, max: Number }
    }
  },
  
  // Weekly progression - the actual training plan structure
  weeks: [{
    weekNumber: Number,
    weekType: {
      type: String,
      enum: ['base', 'build', 'peak', 'recovery', 'taper'] // Periodization phases
    },
    totalLoad: Number,    // Training stress for the week
    workouts: [{
      type: mongoose.Schema.Types.ObjectId,  // Reference to Workout model
      ref: 'Workout'      // Tells Mongoose which model to populate
    }]
  }],
  
  // AI-generated insights - added value from AI analysis
  aiInsights: {
    focusAreas: [String],
    progressionStrategy: String,
    keyWorkouts: [String],
    nutritionTips: [String],
    recoveryGuidelines: [String]
  },
  
  // Timestamps with TTL
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 172800 // 48 hours
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TrainingPlan', trainingPlanSchema);