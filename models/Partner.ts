// models/Partner.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IPartner extends Document {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  companyName: string;
  industry?: string;
  region: string;
  interest: string;
  deliveryNeeds?: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  contactedAt?: Date;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  approvedDate?: string;
  phone?:string;
}

const PartnerSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    phone:String,
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      index:true,
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    approvedDate: {
      type:String
    },
    industry: {
      type: String,
      enum: ['healthcare', 'government', 'logistics', 'retail', 'agriculture', 'ngo', 'other'],
      trim: true,
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      enum: ['nairobi', 'central', 'coast', 'western', 'eastern', 'northern', 'rift-valley', 'national'],
    },
    interest: {
      type: String,
      required: [true, 'Interest area is required'],
      enum: [
        'partnership',
        'medical-delivery',
        'emergency-services',
        'logistics-solution',
        'pilot-program',
        'consultation'
      ],
    },
    deliveryNeeds: {
      type: String,
      trim: true,
      maxlength: [1000, 'Delivery needs cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "approved", "rejected"],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    contactedAt: {
      type: Date,
    },
    followUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance

PartnerSchema.index({ status: 1 });
PartnerSchema.index({ priority: 1 });
PartnerSchema.index({ region: 1 });
PartnerSchema.index({ industry: 1 });
PartnerSchema.index({ createdAt: -1 });

// Virtual for full name
PartnerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Middleware to automatically set priority based on interest and industry
PartnerSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set high priority for healthcare, government, and partnership interests
    if (
      this.industry === 'healthcare' || 
      this.industry === 'government' || 
      this.interest === 'partnership'
    ) {
      this.priority = 'high';
    } else if (this.interest === 'pilot-program' || this.interest === 'medical-delivery') {
      this.priority = 'medium';
    } else {
      this.priority = 'low';
    }
  }
  next();
});

export default mongoose.models.Partner || mongoose.model<IPartner>('Partner', PartnerSchema);
