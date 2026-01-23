import mongoose, { Schema } from "mongoose";

export interface TireAttrs {
  brand: string;
  size: string;
  price: number;
  condition: "new" | "used";
  images: string[];
}

const TireSchema = new Schema<TireAttrs>(
  {
    brand: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    condition: {
      type: String,
      enum: ["new", "used"],
      required: true,
    },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<TireAttrs>("Tire", TireSchema);
