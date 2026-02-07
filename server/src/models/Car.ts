// server/src/models/Car.ts
import mongoose, { Schema } from "mongoose";

// Interface for the car fields
export interface CarAttrs {
  brand?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
  fuel?: "petrol" | "diesel" | "hybrid" | "electric";
  transmission?: "automatic" | "manual";
  images: string[];
  displayLocation: "market" | "business" | "both";
}

// Create schema
// Fields are optional for business-only items (validated by Zod based on displayLocation)
const CarSchema = new Schema<CarAttrs>(
  {
    brand: { type: String },
    model: { type: String },
    year: { type: Number },
    price: { type: Number },
    mileage: { type: Number },
    fuel: {
      type: String,
      enum: ["petrol", "diesel", "hybrid", "electric"],
    },
    transmission: {
      type: String,
      enum: ["automatic", "manual"],
    },
    images: { type: [String], default: [] },
    displayLocation: {
      type: String,
      enum: ["market", "business", "both"],
      default: "market",
    },
  },
  { timestamps: true }
);

// Export model
export default mongoose.model<CarAttrs>("Car", CarSchema);
