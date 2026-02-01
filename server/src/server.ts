import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("❌ MONGO_URI is not defined in environment variables");
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Parse and validate PORT
const portValue = parseInt(process.env.PORT || '5002', 10);
const PORT = Number.isInteger(portValue) && portValue > 0 && portValue <= 65535
  ? portValue
  : 5002;

if (process.env.PORT && PORT === 5002) {
  console.warn(`⚠️  Invalid PORT value "${process.env.PORT}", using default 5002`);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
