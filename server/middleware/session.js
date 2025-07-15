const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');

/**
 * Session middleware handles sessionless user tracking
 * Creates new sessions or validates existing ones
 */
const sessionMiddleware = async (req, res, next) => {
  try {
    // Extract session ID from headers or create new one
    let sessionId = req.headers['x-session-id'] || req.query.sessionId;
    
    if (!sessionId) {
      // Create new session for first-time users
      sessionId = uuidv4();
      const newSession = new Session({ sessionId });
      await newSession.save();
      
      // Send session ID back in response headers
      res.setHeader('X-Session-Id', sessionId);
      req.isNewSession = true;
    } else {
      // Validate existing session
      const session = await Session.findOne({ sessionId });
      
      if (!session) {
        return res.status(401).json({ 
          error: 'Invalid or expired session. Please start over.' 
        });
      }
      
      // Update last accessed time
      await session.updateLastAccessed();
      req.session = session;
      req.isNewSession = false;
    }
    
    // Attach session ID to request for use in controllers
    req.sessionId = sessionId;
    next();
  } catch (error) {
    console.error('Session middleware error:', error);
    res.status(500).json({ error: 'Session management failed' });
  }
};

// Optional: Middleware to require existing session
const requireSession = async (req, res, next) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ 
      error: 'Session required. Please start from the beginning.' 
    });
  }
  
  const session = await Session.findOne({ sessionId })
    .populate('userProfileId')
    .populate('trainingPlanId');
    
  if (!session) {
    return res.status(401).json({ 
      error: 'Session expired or invalid.' 
    });
  }
  
  req.session = session;
  req.sessionId = sessionId;
  next();
};

module.exports = { sessionMiddleware, requireSession };