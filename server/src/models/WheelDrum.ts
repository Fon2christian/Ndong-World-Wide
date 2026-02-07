import mongoose, { Schema } from "mongoose";

export interface WheelDrumAttrs {
  brand?: string;
  size?: string;
  price?: number;
  condition?: string;
  images: string[];
  displayLocation: "market" | "business" | "both";
}

// Fields are optional for business-only items (validated by Zod based on displayLocation)
const WheelDrumSchema = new Schema<WheelDrumAttrs>(
  {
    brand: { type: String },
    size: { type: String },
    price: { type: Number },
    // Note: Unlike Tire's binary "new"/"used" condition, WheelDrum uses
    // quality grades (e.g., "Good", "Excellent", "Fair") as free-form text
    // to allow for more nuanced condition descriptions
    condition: {
      type: String,
      trim: true,
      maxlength: [200, 'Condition cannot exceed 200 characters']
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

export default mongoose.model<WheelDrumAttrs>("WheelDrum", WheelDrumSchema);
