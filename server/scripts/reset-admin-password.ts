#!/usr/bin/env ts-node
/**
 * Script to reset admin password
 * Usage: npx tsx scripts/reset-admin-password.ts <email> <new-password>
 */

import mongoose from "mongoose";
import Admin from "../src/models/Admin.js";
import dotenv from "dotenv";
import { validatePassword, displayValidationErrors } from "./utils/validation.js";

dotenv.config();

async function resetPassword() {
  try {
    const [email, newPassword] = process.argv.slice(2);

    if (!email || !newPassword) {
      console.error("❌ Usage: npx tsx scripts/reset-admin-password.ts <email> <new-password>");
      console.error("Example: npx tsx scripts/reset-admin-password.ts admin@example.com 'NewSecurePass123!'");
      process.exit(1);
    }

    // Validate password complexity
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      displayValidationErrors(passwordValidation.errors);
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI not found in environment variables");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.error(`\n❌ Error: No admin found with email ${email}`);
      process.exit(1);
    }

    // Update password
    console.log("🔐 Resetting password...");
    admin.password = newPassword;
    await admin.save();

    console.log("\n✅ Password reset successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("📧 Email:    ", email);
    console.log("👤 Name:     ", admin.name);
    console.log("🆔 Admin ID: ", admin._id);
    console.log("═══════════════════════════════════════\n");

    console.log("🎉 You can now log in with your new password!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("\n❌ Error resetting password:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    process.exit(1);
  }
}

resetPassword();
