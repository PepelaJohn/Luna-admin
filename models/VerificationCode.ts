// Updated VerificationCode Model (@/models/VerificationCode.ts)
export  enum VerificationCodeType {
  EmailVerification = "email_verification",
  PasswordReset = "password_reset",
}

import mongoose, { Document } from "mongoose";

export interface verificationCodeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: VerificationCodeType;
  code: string; // Added code field
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const verificationCodeSchema = new mongoose.Schema<verificationCodeDocument>(
  {
    userId: {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(VerificationCodeType),
    },
    code: {
      type: String,
      required: true,
      length: 6,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
verificationCodeSchema.index({ userId: 1, type: 1, code: 1 });

export default mongoose.models.VerificationCode ||  
  mongoose.model<verificationCodeDocument>("VerificationCode", verificationCodeSchema, "verification_codes");
