const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  // Basic information
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  
  // Categorization helps users understand workout purpose
  workoutType: {
    type: String,
    enum: ['endurance', 'recovery', 'intervals', 'tempo', 'threshold', 'vo2max', 'sprint', 'strength', 'rest'],
    required: true
  },
  duration: {
    type: Number, // minutes
    required: true
  },
  distance: Number, // kilometers (optional - some workouts are time-based)
  
  // Detailed workout structure - this is what users will follow
  structure: {
    warmup: {
      duration: Number,
      description: String,
      intensity: String
    },
    mainSet: [{
      duration: Number,
      intensity: String,    // e.g., "80% FTP" or "Zone 3"
      zone: String,         // Training zone reference
      description: String,  // e.g., "Maintain steady pace on flat terrain"
      repetitions: Number,  // For interval workouts
      recoveryDuration: Number,
      recoveryIntensity: String
    }],
    cooldown: {
      duration: Number,
      description: String,
      intensity: String
    }
  },
  
  // Training metrics - helps track workout intensity
  intensity: {
    average: Number,  // 1-10 scale for RPE
    tss: Number,      // Training Stress Score (if using power)
    if: Number        // Intensity Factor (if using power)
  },
  
  // Practical considerations
  equipment: {
    required: [{
      type: String,
      enum: ['bike', 'trainer', 'power_meter', 'heart_rate_monitor', 'none']
    }],
    optional: [String]
  },
  
  // Flexibility for different conditions
  environment: {
    type: String,
    enum: ['indoor', 'outdoor', 'either'],
    default: 'either'
  },
  indoorAlternative: String,  // Alternative if weather is bad
  outdoorAlternative: String, // Alternative if no trainer available
  
  // Additional guidance
  coachNotes: String,         // Tips from the AI coach
  nutritionGuidance: String,  // What to eat before/during/after
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Workout', workoutSchema);