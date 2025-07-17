// server/routes/session.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const UserProfile = require('../models/UserProfile');
const TrainingPlan = require('../models/TrainingPlan');

// POST /api/session - Create a new session
router.post('/', async (req, res) => {
  try {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const session = new Session({
      sessionId,
      status: 'profile_creation',
      pageViews: 1
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: {
        sessionId: sessionId,
        status: 'profile_creation',
        nextStep: 'Create user profile'
      }
    });

  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session',
      error: error.message
    });
  }
});

// GET /api/session/:sessionId - Get session details
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId })
      .populate('userProfileId')
      .populate('trainingPlanId');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
        sessionId
      });
    }

    // Update last accessed time and page views
    session.lastAccessedAt = new Date();
    session.pageViews += 1;
    await session.save();

    res.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: error.message
    });
  }
});

// PUT /api/session/:sessionId/status - Update session status
router.put('/:sessionId/status', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    const validStatuses = ['profile_creation', 'plan_generation', 'plan_ready', 'exported'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        validStatuses
      });
    }

    const session = await Session.findOneAndUpdate(
      { sessionId },
      { 
        status,
        lastAccessedAt: new Date()
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
        sessionId
      });
    }

    res.json({
      success: true,
      message: 'Session status updated successfully',
      data: {
        sessionId,
        status: session.status,
        nextStep: getNextStep(status)
      }
    });

  } catch (error) {
    console.error('Error updating session status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session status',
      error: error.message
    });
  }
});

// POST /api/session/:sessionId/export - Track export activity
router.post('/:sessionId/export', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { exportType } = req.body; // 'pdf' or 'ical'

    if (!['pdf', 'ical'].includes(exportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export type',
        validTypes: ['pdf', 'ical']
      });
    }

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
        sessionId
      });
    }

    // Increment export counter
    session.exports[exportType] += 1;
    session.lastAccessedAt = new Date();
    await session.save();

    res.json({
      success: true,
      message: `${exportType.toUpperCase()} export tracked successfully`,
      data: {
        sessionId,
        exports: session.exports
      }
    });

  } catch (error) {
    console.error('Error tracking export:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track export',
      error: error.message
    });
  }
});

// GET /api/session/:sessionId/complete - Get complete session data
router.get('/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get all related data for this session
    const session = await Session.findOne({ sessionId });
    const userProfile = await UserProfile.findOne({ sessionId });
    const trainingPlan = await TrainingPlan.findOne({ sessionId }).populate('weeks.workouts');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
        sessionId
      });
    }

    // Update session access tracking
    session.lastAccessedAt = new Date();
    session.pageViews += 1;
    await session.save();

    res.json({
      success: true,
      data: {
        session,
        userProfile,
        trainingPlan,
        completionStatus: {
          hasProfile: !!userProfile,
          hasPlan: !!trainingPlan,
          isComplete: !!(userProfile && trainingPlan)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching complete session data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session data',
      error: error.message
    });
  }
});

// Helper function to determine next step
function getNextStep(status) {
  const steps = {
    'profile_creation': 'Complete your cycling profile',
    'plan_generation': 'Generating your personalized training plan',
    'plan_ready': 'Review and customize your training plan',
    'exported': 'Training plan ready to use'
  };
  
  return steps[status] || 'Unknown step';
}

module.exports = router;