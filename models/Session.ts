import mongoose, { Document } from "mongoose";
import { timeFromNow } from "../utils/date";

export interface SessionDoc extends Document {
  userId: mongoose.Types.ObjectId;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  device: string;
  browser: string;
  location: string;
}

const sessionSchema = new mongoose.Schema<SessionDoc>(
  {
    userId: {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    userAgent: String,
    device: String,
    browser: String,
    location: String,
    expiresAt: {
      type: Date,
      required: true,
      default: timeFromNow("d", 30),
    },
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model<SessionDoc>("Session", sessionSchema);
