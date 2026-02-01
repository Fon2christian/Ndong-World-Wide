// MongoDB connection caching
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const mongoose = await import("mongoose");
  const dotenv = await import("dotenv");

  dotenv.default.config();

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("❌ MONGO_URI is not defined in environment variables");
  }

  try {
    await mongoose.default.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedDb = mongoose.default.connection;
    console.log("✅ MongoDB connected");
    return cachedDb;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

// Cache the Express app
let app = null;

async function getApp() {
  if (!app) {
    await connectToDatabase();
    const appModule = await import("./dist/app.js");
    app = appModule.default;
  }
  return app;
}

// Vercel serverless function handler
module.exports = async function(req, res) {
  try {
    const expressApp = await getApp();
    // Call the Express app as a request handler
    expressApp(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        message: error.message
      });
    }
  }
};
