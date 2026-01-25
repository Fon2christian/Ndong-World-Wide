import mongoose, { Schema } from "mongoose";

export interface WheelDrumAttrs {
  brand: string;
  size: string;
  price: number;
  condition: string;
  images: string[];
  displayLocation: "market" | "business" | "both";
}

const WheelDrumSchema = new Schema<WheelDrumAttrs>(
  {
    brand: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    condition: { type: String, required: true },
    images: { type: [String], default: [] },
    displayLocation: {
      type: String,
      enum: ["market", "business", "both"],
      default: "market",
    },
  },
  { timestamps: true }
);

export default mongoose.model<WheelDrumAttrs>("WheelDrum", WheelDrumSchema);
