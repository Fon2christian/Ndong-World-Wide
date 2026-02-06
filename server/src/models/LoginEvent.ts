import { Schema, model, type Document } from 'mongoose';
import type { Types } from 'mongoose';

export interface ILoginEvent extends Document {
  adminId?: Types.ObjectId;
  email: string;
  adminName: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const loginEventSchema = new Schema<ILoginEvent>({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  adminName: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  failureReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
loginEventSchema.index({ adminId: 1, timestamp: -1 });
loginEventSchema.index({ email: 1, timestamp: -1 });
loginEventSchema.index({ timestamp: -1 });

export default model<ILoginEvent>('LoginEvent', loginEventSchema);
