// Load environment variables
require('dotenv').config();

// Simple direct export - let Vercel handle the Express app
module.exports = async (req, res) => {
  try {
    // Lazy-load dependencies to avoid cold start issues
    const mongoose = await import('mongoose');

    // Connect to MongoDB if not already connected
    if (mongoose.default.connection.readyState === 0) {
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error("MONGO_URI is not defined");
      }
      await mongoose.default.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log("✅ MongoDB connected");
    }

    // Import and use the Express app
    const { default: app } = await import('./dist/app.js');

    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
