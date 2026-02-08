import mongoose, { Schema } from "mongoose";

export interface TireAttrs {
  brand?: string;
  size?: string;
  price?: number;
  condition?: "new" | "used";
  images: string[];
  displayLocation: "market" | "business" | "both";
}

// Fields are conditionally required based on displayLocation
// For business-only items, only images are required
const TireSchema = new Schema<TireAttrs>(
  {
    brand: {
      type: String,
      required: function(this: TireAttrs) { return this.displayLocation !== 'business'; }
    },
    size: {
      type: String,
      required: function(this: TireAttrs) { return this.displayLocation !== 'business'; }
    },
    price: {
      type: Number,
      required: function(this: TireAttrs) { return this.displayLocation !== 'business'; }
    },
    condition: {
      type: String,
      enum: ["new", "used"],
      required: function(this: TireAttrs) { return this.displayLocation !== 'business'; }
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
