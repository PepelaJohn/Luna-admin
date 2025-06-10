// models/Partner.js
import mongoose from 'mongoose';

const PartnerSchema = new mongoose.Schema({

  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true,
    maxlength: [50, 'Contact person name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    enum: {
      values: ['retail', 'healthcare', 'ecommerce', 'logistics', 'food', 'other'],
      message: 'Please select a valid industry'
    }
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: {
      values: ['b2b', 'b2c', 'both'],
      message: 'Please select a valid business type'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },

 
  monthlyOrders: {
    type: String,
    enum: {
      values: ['0-100', '100-500', '500-1000', '1000-5000', '5000+', ''],
      message: 'Please select a valid monthly orders range'
    }
  },
  averageOrderValue: {
    type: String,
    enum: {
      values: ['0-1000', '1000-5000', '5000-10000', '10000+', ''],
      message: 'Please select a valid average order value range'
    }
  },
  currentDeliveryMethod: {
    type: String,
    trim: true,
    maxlength: [200, 'Current delivery method cannot exceed 200 characters']
  },
  partnershipGoals: {
    type: String,
    trim: true,
    maxlength: [1000, 'Partnership goals cannot exceed 1000 characters']
  },
  additionalInfo: {
    type: String,
    trim: true,
    maxlength: [1000, 'Additional information cannot exceed 1000 characters']
  },

  // Metadata
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PartnerSchema.index({ email: 1 });
PartnerSchema.index({ companyName: 1 });
PartnerSchema.index({ status: 1 });
PartnerSchema.index({ submittedAt: -1 });

// Virtual for formatted submission date
PartnerSchema.virtual('formattedSubmissionDate').get(function() {
  return this.submittedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Static method to get partners by status
PartnerSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ submittedAt: -1 });
};

// Instance method to approve partnership
PartnerSchema.methods.approve = function(reviewerId: any, notes: any) {
  this.status = 'approved';
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  if (notes) this.notes = notes;
  return this.save();
};

// Instance method to reject partnership
PartnerSchema.methods.reject = function(reviewerId: any, notes: any) {
  this.status = 'rejected';
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  if (notes) this.notes = notes;
  return this.save();
};

export default mongoose.models.Partner || mongoose.model('Partner', PartnerSchema);