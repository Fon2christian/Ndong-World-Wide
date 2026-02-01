#!/usr/bin/env ts-node
/**
 * CLI version of create-admin script that accepts arguments
 * Usage: tsx scripts/create-admin-cli.ts <email> <name> <password>
 */

import mongoose from "mongoose";
import Admin from "../src/models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

async function createAdmin() {
  try {
    const [email, name, password] = process.argv.slice(2);

    if (!email || !name || !password) {
      console.error("❌ Usage: tsx scripts/create-admin-cli.ts <email> <name> <password>");
      console.error("Example: tsx scripts/create-admin-cli.ts admin@example.com 'John Doe' 'SecurePass123!'");
      process.exit(1);
    }

    // Validate password complexity
    if (password.length < 8) {
      console.error("\n❌ Error: Password must be at least 8 characters");
      process.exit(1);
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
      console.error("\n❌ Error: Password must include:");
      console.error("   - At least one uppercase letter (A-Z)");
      console.error("   - At least one lowercase letter (a-z)");
      console.error("   - At least one digit (0-9)");
      console.error("   - At least one special character (!@#$%^&*...)");
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("\n❌ Error: Invalid email format");
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

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.error(`\n❌ Error: Admin with email ${email} already exists`);
      console.log("Use a different email or login with existing credentials.");
      process.exit(1);
    }

    // Create admin
    console.log("🔐 Creating admin account...");
    const admin = await Admin.create({
      email,
      password,
      name,
    });

    console.log("\n✅ Admin account created successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("📧 Email:    ", email);
    console.log("👤 Name:     ", name);
    console.log("🆔 Admin ID: ", admin._id);
    console.log("═══════════════════════════════════════\n");

    console.log("🎉 You can now log in to the admin dashboard!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("\n❌ Error creating admin:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

createAdmin();
