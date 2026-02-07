import mongoose, { Schema } from "mongoose";

export interface TireAttrs {
  brand?: string;
  size?: string;
  price?: number;
  condition?: "new" | "used";
  images: string[];
  displayLocation: "market" | "business" | "both";
}

const TireSchema = new Schema<TireAttrs>(
  {
    // Fields are optional for business-only items (validated by Zod based on displayLocation)
    brand: { type: String },
    size: { type: String },
    price: { type: Number },
    condition: {
      type: String,
      enum: ["new", "used"],
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

export default mongoose.model<TireAttrs>("Tire", TireSchema);
