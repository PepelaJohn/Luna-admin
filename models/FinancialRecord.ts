// models/FinancialRecord.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IFinancialRecord extends Document {
  _id:string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  notes?: string;
  type: 'income' | 'expenditure';
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
  submittedBy?: string;
  approvedBy?: string;
  dateSubmitted?: Date;
  dateApproved?: Date;
  datePaid?: Date;
  attachments?: {
    filename: string;
    url: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const FinancialRecordSchema = new Schema<IFinancialRecord>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['income', 'expenditure'],
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    submittedBy: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: String,
      trim: true,
    },
    dateSubmitted: {
      type: Date,
    },
    dateApproved: {
      type: Date,
    },
    datePaid: {
      type: Date,
    },
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
FinancialRecordSchema.index({ type: 1, date: -1 });
FinancialRecordSchema.index({ category: 1 });
FinancialRecordSchema.index({ status: 1 });

export default mongoose.models.FinancialRecord ||
  mongoose.model<IFinancialRecord>('FinancialRecord', FinancialRecordSchema);