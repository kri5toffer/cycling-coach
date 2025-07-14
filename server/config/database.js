const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection string explanation:
    // - mongodb://localhost:27017 - local MongoDB instance
    // - cycling_ai_coach - database name (created automatically if doesn't exist)
    // We use environment variables for flexibility between development and production
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cycling_ai_coach');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;