import mongoose, { Schema } from "mongoose";

export interface WheelDrumAttrs {
  brand?: string;
  size?: string;
  price?: number;
  condition?: string;
  images: string[];
  displayLocation: "market" | "business" | "both";
}

// Fields are conditionally required based on displayLocation
// For business-only items, only images are required
const WheelDrumSchema = new Schema<WheelDrumAttrs>(
  {
    brand: {
      type: String,
      required: function(this: WheelDrumAttrs) { return this.displayLocation !== 'business'; }
    },
    size: {
      type: String,
      required: function(this: WheelDrumAttrs) { return this.displayLocation !== 'business'; }
    },
    price: {
      type: Number,
      required: function(this: WheelDrumAttrs) { return this.displayLocation !== 'business'; }
    },
    // Note: Unlike Tire's binary "new"/"used" condition, WheelDrum uses
    // quality grades (e.g., "Good", "Excellent", "Fair") as free-form text
    // to allow for more nuanced condition descriptions
    condition: {
      type: String,
      trim: true,
      required: function(this: WheelDrumAttrs) { return this.displayLocation !== 'business'; },
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
