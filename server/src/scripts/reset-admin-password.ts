/**
 * Script: Reset Admin Password
 *
 * Resets the password for a specific admin account.
 *
 * Usage:
 *   npx tsx src/scripts/reset-admin-password.ts <email> <new-password>
 *
 * Example:
 *   npx tsx src/scripts/reset-admin-password.ts admin@example.com MyNewPassword123
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

async function resetPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.error("❌ Usage: npx tsx src/scripts/reset-admin-password.ts <email> <new-password>");
      process.exit(1);
    }

    if (newPassword.length < 8) {
      console.error("❌ Password must be at least 8 characters long");
      process.exit(1);
    }

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("❌ MONGO_URI is not defined in environment variables");
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      console.error(`❌ No admin found with email: ${email}`);
      await mongoose.connection.close();
      process.exit(1);
    }

    // Update password (will be automatically hashed by pre-save hook)
    admin.password = newPassword;
    await admin.save();

    console.log("✅ Password successfully reset");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log("\n✓ You can now login with the new password");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

resetPassword();
