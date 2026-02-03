import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Interface for Admin document
export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  resetPasswordAttempts?: number;
  lastPasswordResetRequest?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): Promise<string>;
  validateResetToken(token: string): Promise<boolean>;
  clearResetToken(): void;
}

// Create schema
const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    resetPasswordAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lastPasswordResetRequest: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
AdminSchema.pre("save", async function () {
  // Only hash if password is modified
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
AdminSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to create password reset token
AdminSchema.methods.createPasswordResetToken = async function (): Promise<string> {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token and store
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiration to 1 hour from now
  this.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

  // Reset attempts counter
  this.resetPasswordAttempts = 0;

  // Update last request timestamp
  this.lastPasswordResetRequest = new Date();

  // Return unhashed token (sent to user via email)
  return resetToken;
};

// Method to validate reset token
AdminSchema.methods.validateResetToken = async function (
  token: string
): Promise<boolean> {
  // Hash the provided token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Check if token matches and hasn't expired
  if (
    this.resetPasswordToken !== hashedToken ||
    !this.resetPasswordExpires ||
    this.resetPasswordExpires < new Date()
  ) {
    return false;
  }

  // Check attempt limit (max 5 attempts)
  if (this.resetPasswordAttempts && this.resetPasswordAttempts >= 5) {
    return false;
  }

  // Increment attempts
  this.resetPasswordAttempts = (this.resetPasswordAttempts || 0) + 1;

  return true;
};

// Method to clear reset token
AdminSchema.methods.clearResetToken = function (): void {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
  this.resetPasswordAttempts = 0;
};

// Export model
export default mongoose.model<IAdmin>("Admin", AdminSchema);
