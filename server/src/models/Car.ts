// server/src/models/Car.ts
import mongoose, { Schema } from "mongoose";

// Interface for the car fields
export interface CarAttrs {
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: "petrol" | "diesel" | "hybrid" | "electric";
  transmission: "automatic" | "manual";
  images: string[];
  displayLocation: "market" | "business" | "both";
}

// Create schema
const CarSchema = new Schema<CarAttrs>(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    mileage: { type: Number, required: true },
    fuel: {
      type: String,
      enum: ["petrol", "diesel", "hybrid", "electric"],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["automatic", "manual"],
      required: true,
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
