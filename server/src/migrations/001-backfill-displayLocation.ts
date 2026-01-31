/**
 * Migration: Backfill displayLocation field
 *
 * This migration adds the displayLocation field to existing Car, Tire, and WheelDrum
 * documents that don't have it set. The field was added to support filtering items
 * between the Market and Business pages.
 *
 * Default value: "market" (matches the schema default)
 *
 * Run this migration once after deploying the schema changes.
 */

import mongoose from "mongoose";
import Car from "../models/Car.js";
import Tire from "../models/Tire.js";
import WheelDrum from "../models/WheelDrum.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Filter to match documents with missing, null, or empty displayLocation
const invalidDisplayLocationFilter = {
  $or: [
    { displayLocation: { $exists: false } },
    { displayLocation: null },
    { displayLocation: "" }
  ]
};

async function backfillDisplayLocation() {
  try {
    // Require MONGO_URI to avoid accidentally migrating the wrong database
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is required");
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Backfill Cars (covers missing, null, and empty values)
    const carsResult = await Car.updateMany(
      invalidDisplayLocationFilter,
      { $set: { displayLocation: "market" } }
    );
    console.log(`📦 Cars: Updated ${carsResult.modifiedCount} documents (${carsResult.matchedCount} matched)`);

    // Backfill Tires
    const tiresResult = await Tire.updateMany(
      invalidDisplayLocationFilter,
      { $set: { displayLocation: "market" } }
    );
    console.log(`🛞 Tires: Updated ${tiresResult.modifiedCount} documents (${tiresResult.matchedCount} matched)`);

    // Backfill WheelDrums
    const wheelDrumsResult = await WheelDrum.updateMany(
      invalidDisplayLocationFilter,
      { $set: { displayLocation: "market" } }
    );
    console.log(`⚙️  WheelDrums: Updated ${wheelDrumsResult.modifiedCount} documents (${wheelDrumsResult.matchedCount} matched)`);

    const totalUpdated = carsResult.modifiedCount + tiresResult.modifiedCount + wheelDrumsResult.modifiedCount;
    console.log(`\n✨ Migration complete! Total documents updated: ${totalUpdated}`);

    // Verify the migration (uses same filter to check for any remaining invalid values)
    console.log("\n🔍 Verification:");
    const carsWithoutLocation = await Car.countDocuments(invalidDisplayLocationFilter);
    const tiresWithoutLocation = await Tire.countDocuments(invalidDisplayLocationFilter);
    const wheelDrumsWithoutLocation = await WheelDrum.countDocuments(invalidDisplayLocationFilter);

    if (carsWithoutLocation === 0 && tiresWithoutLocation === 0 && wheelDrumsWithoutLocation === 0) {
      console.log("✅ All documents now have displayLocation field");
    } else {
      console.warn(`⚠️  Warning: Some documents still missing displayLocation:`);
      console.warn(`   - Cars: ${carsWithoutLocation}`);
      console.warn(`   - Tires: ${tiresWithoutLocation}`);
      console.warn(`   - WheelDrums: ${wheelDrumsWithoutLocation}`);
    }

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exitCode = 1;
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

// Only run when executed directly (not when imported)
// Usage: npx tsx src/migrations/001-backfill-displayLocation.ts
if (import.meta.url === `file://${process.argv[1]}`) {
  backfillDisplayLocation();
}

export { backfillDisplayLocation };
