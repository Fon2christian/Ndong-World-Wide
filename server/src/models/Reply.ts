import mongoose, { Schema, Document } from "mongoose";

// Interface for Reply document
export interface IReply extends Document {
  contactId: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  adminEmail: string;
  subject: string;
  message: string;
  sentAt: Date;
  emailStatus: "sending" | "sent" | "failed";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create schema
const ReplySchema = new Schema<IReply>(
  {
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
      index: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 5000,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    emailStatus: {
      type: String,
      enum: ["sending", "sent", "failed"],
      default: "sending",
      required: true,
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

// Add compound index for efficient queries (fetch replies for a contact, sorted by date)
ReplySchema.index({ contactId: 1, sentAt: -1 });

// Export model
export default mongoose.model<IReply>("Reply", ReplySchema);
