#!/usr/bin/env ts-node
/**
 * Script to create the first admin user
 * Usage: npm run create-admin
 */

import mongoose from "mongoose";
import * as readline from "readline";
import Admin from "../src/models/Admin.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

function questionHidden(query: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    let password = "";

    stdout.write(query);

    // Enable raw mode to capture keystrokes
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const onData = (char: string) => {
      const charCode = char.charCodeAt(0);

      // Handle Ctrl+C
      if (charCode === 3) {
        stdout.write("\n");
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.exit(0);
      }

      // Handle Enter/Return
      if (charCode === 13) {
        stdout.write("\n");
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        resolve(password);
        return;
      }

      // Handle Backspace/Delete
      if (charCode === 127 || charCode === 8) {
        if (password.length > 0) {
          password = password.slice(0, -1);
          stdout.write("\b \b");
        }
        return;
      }

      // Handle printable characters
      if (charCode >= 32 && charCode <= 126) {
        password += char;
        stdout.write("*");
      }
    };

    stdin.on("data", onData);
  });
}

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI not found in environment variables");
      console.log("Please set MONGO_URI in your .env file");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Get admin details
    console.log("📝 Create First Admin Account\n");
    console.log("This script will create your first admin user.");
    console.log("You'll use these credentials to log in to the admin dashboard.\n");

    const email = await question("Email address: ");
    const name = await question("Full name: ");
    const password = await questionHidden("Password (min 8 characters, must include uppercase, lowercase, digit, and special character): ");
    const confirmPassword = await questionHidden("Confirm password: ");

    // Validate input
    if (!email || !name || !password) {
      console.error("\n❌ Error: All fields are required");
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error("\n❌ Error: Passwords do not match");
      process.exit(1);
    }

    if (password.length < 8) {
      console.error("\n❌ Error: Password must be at least 8 characters");
      process.exit(1);
    }

    // Validate password complexity
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

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.error(`\n❌ Error: Admin with email ${email} already exists`);
      console.log("Use a different email or login with existing credentials.");
      process.exit(1);
    }

    // Create admin
    console.log("\n🔐 Creating admin account...");
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

    console.log("🎉 You can now log in to the admin dashboard at:");
    console.log("   https://your-domain.com/admin\n");

    console.log("💡 To log in via API:");
    console.log(`
    curl -X POST https://your-domain.com/api/admin/login \\
      -H "Content-Type: application/json" \\
      -d '{
        "email": "${email}",
        "password": "your-password"
      }'
    `);

  } catch (error) {
    console.error("\n❌ Error creating admin:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
  }
}

// Run the script
createAdmin().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
