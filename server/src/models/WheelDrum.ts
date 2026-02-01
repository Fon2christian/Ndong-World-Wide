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
    // Note: Unlike Tire's binary "new"/"used" condition, WheelDrum uses
    // quality grades (e.g., "Good", "Excellent", "Fair") as free-form text
    // to allow for more nuanced condition descriptions
    condition: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, 'Condition cannot be empty'],
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
