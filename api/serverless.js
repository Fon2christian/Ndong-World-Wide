// Import using require for CommonJS compatibility with Vercel
const path = require("path");

// Re-export as ES module for proper handling
let handler;

async function getHandler() {
  if (!handler) {
    // Import the compiled server app
    const mongoose = await import("mongoose");
    const dotenv = await import("dotenv");

    dotenv.default.config();

    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("❌ MONGO_URI is not defined in environment variables");
    }

    // Connect to MongoDB
    let isConnected = false;

    if (!isConnected) {
      try {
        await mongoose.default.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        isConnected = true;
        console.log("✅ MongoDB connected");
      } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        throw err;
      }
    }

    // Import the Express app from the local dist directory
    const appModule = await import("./dist/app.js");
    handler = appModule.default;
  }

  return handler;
}

module.exports = async function(req, res) {
  try {
    const app = await getHandler();
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};
