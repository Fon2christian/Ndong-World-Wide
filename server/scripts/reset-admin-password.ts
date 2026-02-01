#!/usr/bin/env ts-node
/**
 * Script to reset admin password
 * Usage: npx tsx scripts/reset-admin-password.ts <email> <new-password>
 */

import mongoose from "mongoose";
import Admin from "../src/models/Admin.js";
import dotenv from "dotenv";

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
    if (newPassword.length < 8) {
      console.error("\n❌ Error: Password must be at least 8 characters");
      process.exit(1);
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasDigit = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
      console.error("\n❌ Error: Password must include:");
      console.error("   - At least one uppercase letter (A-Z)");
      console.error("   - At least one lowercase letter (a-z)");
      console.error("   - At least one digit (0-9)");
      console.error("   - At least one special character (!@#$%^&*...)");
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
    console.error("\n❌ Error resetting password:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

resetPassword();
