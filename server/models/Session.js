const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Track user's progress through the app
  status: {
    type: String,
    enum: ['profile_creation', 'plan_generation', 'plan_ready', 'exported'],
    default: 'profile_creation'
  },
  
  // References to related documents - foreign keys in NoSQL
  userProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  },
  trainingPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingPlan'
  },
  
  // Share functionality - allows users to share plans
  shareableLink: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Analytics - understand how users interact with plans
  pageViews: {
    type: Number,
    default: 0
  },
  exports: {
    pdf: { type: Number, default: 0 },
    ical: { type: Number, default: 0 }
  },
  
  // Timestamps with TTL
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 172800 // 48 hours
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

// Instance method - functions available on session documents
sessionSchema.methods.updateLastAccessed = function() {
  this.lastAccessedAt = Date.now();
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);