// server/src/models/Contact.ts
import mongoose, { Schema } from "mongoose";

// Interface for the contact inquiry fields
export interface ContactAttrs {
  name: string;
  furigana: string;
  email: string;
  phone: string;
  inquiryDetails?: string;
  status?: "new" | "in_progress" | "resolved";
  emailSent?: boolean;
  isRead?: boolean;
}

// Create schema
const ContactSchema = new Schema<ContactAttrs>(
  {
    name: { type: String, required: true },
    furigana: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    inquiryDetails: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved"],
      default: "new",
    },
    emailSent: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add indexes for query performance
ContactSchema.index({ createdAt: -1 }); // For sorting all contacts by creation date
ContactSchema.index({ status: 1, createdAt: -1 }); // For filtering by status and sorting
ContactSchema.index({ isRead: 1, createdAt: -1 }); // For filtering by read status and sorting

// Export model
export default mongoose.model<ContactAttrs>("Contact", ContactSchema);
