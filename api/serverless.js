const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("❌ MONGO_URI is not defined in environment variables");
}

// Serverless function handler with connection caching
let isConnected = false;
let app;

async function connectToDatabase() {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
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

// Vercel serverless function handler
module.exports = async function handler(req, res) {
  // Lazy load the app to ensure database connection is established first
  if (!app) {
    await connectToDatabase();
    // Dynamically import the ES module app
    const appModule = await import("../server/dist/app.js");
    app = appModule.default;
  }

  return app(req, res);
};
