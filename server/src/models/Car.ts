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
// Fields are conditionally required based on displayLocation
// For business-only items, only images are required
const CarSchema = new Schema<CarAttrs>(
  {
    brand: {
      type: String,
      required: function(this: CarAttrs) { return this.displayLocation !== 'business'; }
    },
    model: {
      type: String,
      required: function(this: CarAttrs) { return this.displayLocation !== 'business'; }
    },
    year: {
      type: Number,
      required: function(this: CarAttrs) { return this.displayLocation !== 'business'; }
    },
    price: {
      type: Number,
      required: function(this: CarAttrs) { return this.displayLocation !== 'business'; }
    },
    mileage: {
      type: Number,
      required: function(this: CarAttrs) { return this.displayLocation !== 'business'; }
    },
    fuel: {
      type: String,
      enum: ["petrol", "diesel", "hybrid", "electric"],
      required: function(this: CarAttrs) { return this.displayLocation !== 'business'; }
    },
    transmission: {
      type: String,
      enum: ["automatic", "manual"],
      required: function(this: CarAttrs) { return this.displayLocation !== 'business'; }
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
