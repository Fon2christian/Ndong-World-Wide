// Load environment variables
require('dotenv').config();

let cachedApp = null;

// Simple direct export - let Vercel handle the Express app
module.exports = async (req, res) => {
  try {
    if (!cachedApp) {
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

      // Import the Express app
      const appModule = await import('./dist/app.js');

      // Debug: log what we're getting
      console.log("App module keys:", Object.keys(appModule));
      console.log("App module default:", appModule.default);
      console.log("Is default a function?", typeof appModule.default === 'function');

      // Try different ways to get the app
      cachedApp = appModule.default || appModule.app || appModule;
    }

    // Check if we have a valid handler
    if (typeof cachedApp !== 'function') {
      throw new Error(`App is not a function. Type: ${typeof cachedApp}, Keys: ${Object.keys(cachedApp || {}).join(', ')}`);
    }

    // Let Express handle the request
    return cachedApp(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: error.stack
    });
  }
};
