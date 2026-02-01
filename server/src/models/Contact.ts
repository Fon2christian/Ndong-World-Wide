// server/src/models/Contact.ts
import mongoose, { Schema, Document } from "mongoose";

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

// Document interface with Mongoose methods
export interface ContactDocument extends ContactAttrs, Document {}

// Create schema
const ContactSchema = new Schema<ContactDocument>(
  {
    name: { type: String, required: true },
    furigana: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          // More strict email validation:
          // - At least 2 characters before @
          // - No consecutive dots
          // - Domain has at least 2 characters
          // - TLD has at least 2 characters
          return /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i.test(v);
        },
        message: (props: any) => `${props.value} is not a valid email address!`
      }
    },
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
export default mongoose.model<ContactDocument>("Contact", ContactSchema);
