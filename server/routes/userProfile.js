// Import Express framework to create router
const express = require('express');

// Create a router instance to define API endpoints
const router = express.Router();

// Import the UserProfile model to interact with the MongoDB collection
const UserProfile = require('../models/UserProfile');

// Helper function to create unique session IDs for users
// This is important for identifying user sessions without requiring login
function generateSessionId() {
  // Combine current timestamp and random string for uniqueness
  // Date.now() gives milliseconds since epoch, ensuring chronological uniqueness
  // Math.random().toString(36) creates an alphanumeric string (base 36)
  // substr(2, 9) takes 9 characters starting from position 2 (skipping '0.' prefix)
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// POST endpoint to create a new user profile
// Route: POST /api/profile
router.post('/', async (req, res) => {
  try {
    // Generate a unique session ID for this user profile
    const sessionId = generateSessionId();
    
    // Extract required fields from request body using object destructuring
    const { basicInfo, experience, goals, equipment, schedule } = req.body;
    
    // Validate that all required fields are present
    // This prevents incomplete profiles from being created
    if (!basicInfo || !experience || !goals || !schedule) {
      // Return 400 Bad Request with details about missing fields
      return res.status(400).json({
        success: false,
        message: 'Missing required profile information',
        required: ['basicInfo', 'experience', 'goals', 'schedule']
      });
    }

    // Create a new UserProfile document instance with data from request
    const userProfile = new UserProfile({
      sessionId,  // Assign the generated session ID
      basicInfo,  // User's basic information (name, age, etc.)
      experience, // Cycling experience level
      goals,      // Training goals
      equipment: equipment || {}, // Equipment details (optional, defaults to empty object)
      schedule    // User's availability for training
    });

    // Save the user profile to MongoDB
    // await pauses execution until the save operation completes
    await userProfile.save();

    // Return 201 Created status with the newly created profile data
    res.status(201).json({
      success: true,
      message: 'User profile created successfully',
      data: {
        sessionId: sessionId,     // Return session ID for future API calls
        profileId: userProfile._id, // MongoDB document ID
        profile: userProfile      // The complete profile object
      }
    });

  } catch (error) {
    // Log the error for server-side debugging
    console.error('Error creating user profile:', error);
    
    // Handle Mongoose validation errors separately for better client feedback
    if (error.name === 'ValidationError') {
      // Return 400 Bad Request with specific validation errors
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        // Map through all validation errors to create a clean error object
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    // Handle any other errors with a generic 500 Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Failed to create user profile',
      error: error.message // Include error message for debugging
    });
  }
});

// GET endpoint to retrieve a user profile by session ID
// Route: GET /api/profile/:sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    // Extract sessionId from URL parameters
    const { sessionId } = req.params;

    // Query MongoDB for a profile with matching sessionId
    // findOne returns the first matching document or null
    const userProfile = await UserProfile.findOne({ sessionId });

    // If no profile is found, return 404 Not Found
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        sessionId // Include the sessionId in response for reference
      });
    }

    // Return 200 OK with the found profile
    res.json({
      success: true,
      data: userProfile // Return the complete profile object
    });

  } catch (error) {
    // Log the error for server-side debugging
    console.error('Error fetching user profile:', error);
    
    // Return 500 Internal Server Error for any unexpected errors
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message // Include error message for debugging
    });
  }
});

// PUT endpoint to update an existing user profile
// Route: PUT /api/profile/:sessionId
router.put('/:sessionId', async (req, res) => {
  try {
    // Extract sessionId from URL parameters
    const { sessionId } = req.params;
    
    // Get update data from request body
    const updates = req.body;

    // Find and update the profile in a single operation
    // Options:
    // - new: true - returns the modified document rather than the original
    // - runValidators: true - ensures updates meet schema validation rules
    const userProfile = await UserProfile.findOneAndUpdate(
      { sessionId }, // Query criteria
      updates,       // Update data
      { new: true, runValidators: true } // Options
    );

    // If no profile is found, return 404 Not Found
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        sessionId // Include the sessionId in response for reference
      });
    }

    // Return 200 OK with the updated profile
    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: userProfile // Return the updated profile
    });

  } catch (error) {
    // Log the error for server-side debugging
    console.error('Error updating user profile:', error);
    
    // Handle Mongoose validation errors separately
    if (error.name === 'ValidationError') {
      // Return 400 Bad Request with specific validation errors
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        // Map through all validation errors to create a clean error object
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    // Handle any other errors with a generic 500 Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message // Include error message for debugging
    });
  }
});

// DELETE endpoint to remove a user profile and related data
// Route: DELETE /api/profile/:sessionId
router.delete('/:sessionId', async (req, res) => {
  try {
    // Extract sessionId from URL parameters
    const { sessionId } = req.params;

    // Find and delete the user profile
    // findOneAndDelete returns the deleted document or null
    const userProfile = await UserProfile.findOneAndDelete({ sessionId });

    // If no profile is found, return 404 Not Found
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        sessionId // Include the sessionId in response for reference
      });
    }

    // Import related models to clean up associated data
    // This prevents orphaned data in the database
    const Session = require('../models/Session');
    const TrainingPlan = require('../models/TrainingPlan');
    
    // Delete all sessions and training plans with the same sessionId
    // deleteMany removes all matching documents without returning them
    await Session.deleteMany({ sessionId });
    await TrainingPlan.deleteMany({ sessionId });

    // Return 200 OK to confirm successful deletion
    res.json({
      success: true,
      message: 'User profile and related data deleted successfully',
      sessionId // Include the sessionId in response for reference
    });

  } catch (error) {
    // Log the error for server-side debugging
    console.error('Error deleting user profile:', error);
    
    // Return 500 Internal Server Error for any unexpected errors
    res.status(500).json({
      success: false,
      message: 'Failed to delete user profile',
      error: error.message // Include error message for debugging
    });
  }
});

// Export the router so it can be mounted in the main Express app
module.exports = router;