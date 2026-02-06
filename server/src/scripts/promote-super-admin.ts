/**
 * Migration Script: Promote First Admin to Super Admin
 *
 * This script promotes the first admin account to super_admin role.
 * Run this once after deploying the role-based access control feature.
 *
 * Usage:
 *   npx tsx src/scripts/promote-super-admin.ts [email]
 *
 * If email is provided, promotes that specific admin.
 * If no email is provided, promotes the oldest admin account.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

async function promoteSuperAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("❌ MONGO_URI is not defined in environment variables");
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Get email from command line argument
    const targetEmail = process.argv[2];

    let admin;
    if (targetEmail) {
      // Find specific admin by email
      admin = await Admin.findOne({ email: targetEmail });
      if (!admin) {
        console.error(`❌ No admin found with email: ${targetEmail}`);
        await mongoose.connection.close();
        process.exit(1);
      }
    } else {
      // Find the first (oldest) admin
      admin = await Admin.findOne().sort({ createdAt: 1 });
      if (!admin) {
        console.error("❌ No admin accounts found in database");
        await mongoose.connection.close();
        process.exit(1);
      }
    }

    // Check if already super admin
    if (admin.role === "super_admin") {
      console.log(`ℹ️  Admin ${admin.email} is already a super admin`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Promote to super admin
    admin.role = "super_admin";
    await admin.save();

    console.log("✅ Successfully promoted admin to super_admin");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);

    // Show all admins and their roles
    const allAdmins = await Admin.find().select("name email role createdAt");
    console.log("\n📋 All Admin Accounts:");
    allAdmins.forEach((a) => {
      console.log(`   - ${a.email} (${a.name}) - Role: ${a.role}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error promoting admin:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

promoteSuperAdmin();
