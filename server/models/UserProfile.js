const mongoose = require('mongoose');

// Schema defines the structure and validation rules for user profiles
const userProfileSchema = new mongoose.Schema({
  // Session tracking - links this profile to a browser session
  sessionId: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate sessions
    index: true   // Creates a database index for fast lookups
  },
  
  // Basic Information - fundamental data needed for training calculations
  basicInfo: {
    age: {
      type: Number,
      required: true,
      min: 13,      // Age restrictions for safety
      max: 100      // Reasonable upper limit
    },
    weight: {
      type: Number,
      required: true,
      min: 30,      // kg - minimum healthy weight
      max: 300      // kg - maximum reasonable weight
    },
    height: {
      type: Number,
      required: true,
      min: 120,     // cm - minimum height
      max: 250      // cm - maximum height
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'] // Inclusive options
    }
  },
  
  // Cycling Experience - helps AI understand current fitness level
  experience: {
    level: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    yearsOfCycling: {
      type: Number,
      default: 0    // Defaults allow optional fields
    },
    currentWeeklyHours: {
      type: Number,
      default: 0
    },
    currentWeeklyDistance: {
      type: Number,
      default: 0    // in kilometers
    }
  },
  
  // Goals - critical for AI to generate appropriate training plans
  goals: {
    primaryGoal: {
      type: String,
      required: true,
      enum: ['weight_loss', 'endurance', 'speed', 'event_training', 'general_fitness', 'power']
    },
    targetEvent: {
      eventType: {
        type: String,
        enum: ['century', 'gran_fondo', 'criterium', 'time_trial', 'stage_race', 'none']
      },
      eventDate: Date,
      eventName: String
    },
    specificGoals: [String] // Array for multiple secondary goals
  },
  
  // Equipment - determines what workouts are possible
  equipment: {
    bikes: [{
      type: {
        type: String, // 'type' is reserved in Mongoose, so we nest it
        enum: ['road', 'mountain', 'gravel', 'hybrid', 'tt', 'track']
      },
      hasPowerMeter: Boolean,
      hasSmartTrainer: Boolean
    }],
    hasHeartRateMonitor: Boolean,
    hasCyclingComputer: Boolean,
    hasIndoorTrainer: Boolean
  },
  
  // Schedule and Availability - ensures realistic training plans
  schedule: {
    daysPerWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 7
    },
    preferredDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    sessionDuration: {
      min: {
        type: Number,
        default: 30   // minutes
      },
      max: {
        type: Number,
        default: 120  // minutes
      }
    },
    preferredTime: {
      type: String,
      enum: ['early_morning', 'morning', 'afternoon', 'evening', 'flexible']
    }
  },
  
  // Timestamps with automatic expiration
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 172800 // TTL in seconds (48 hours) - MongoDB automatically deletes expired documents
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware - runs before saving to update timestamps
userProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export the model - this is what we'll use in our application
module.exports = mongoose.model('UserProfile', userProfileSchema);