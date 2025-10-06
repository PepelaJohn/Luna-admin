import mongoose, { Document, Model, Schema } from "mongoose";

// TypeScript interface for type safety
export interface ISubscriber extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  confirmed: boolean;
  token: string;
  confirmationTokenExpires?: Date;
  subscribedAt: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  isTokenExpired(): boolean;
  markAsConfirmed(): Promise<ISubscriber>;
  unsubscribe(): Promise<ISubscriber>;
  isActive: boolean;
  source?: string;
  tags?: string[];
  preferences?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
  };
}

// Instance methods interface
interface ISubscriberMethods {
  isTokenExpired(): boolean;
  markAsConfirmed(): Promise<ISubscriber>;
  unsubscribe(): Promise<ISubscriber>;
  updatePreferences(preferences: Partial<ISubscriber['preferences']>): Promise<ISubscriber>;
}

// Static methods interface
 //@typescript-eslint/no-empty-object-type
interface ISubscriberModel extends Model<ISubscriber,  ISubscriberMethods> {
  findByEmail(email: string): Promise<ISubscriber | null>;
  findActiveSubscribers(): Promise<ISubscriber[]>;
  findByToken(token: string): Promise<ISubscriber | null>;
  cleanupExpiredTokens(): Promise<number>;
}

const subscriberSchema = new Schema<ISubscriber, ISubscriberModel, ISubscriberMethods>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    },
    
  },
  confirmed: {
    type: Boolean,
    default: false,
    index: true
  },
  token: {
    type: String,
    required: [true, 'Confirmation token is required'],
    unique: true,
    index: true
  },
  confirmationTokenExpires: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    index: { expireAfterSeconds: 0 } // TTL index
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
   
  },
  confirmedAt: {
    type: Date,
   
  },
  unsubscribedAt: {
    type: Date,
    
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  source: {
    type: String
  },
  tags: {
    type: [String],
    default: []
  },
  preferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    categories: {
      type: [String],
      default: []
    }
  }
}, {
  timestamps: { createdAt: 'subscribedAt', updatedAt: true },
  collection: 'subscribers',
  
});


// Instance methods
subscriberSchema.methods.isTokenExpired = function(): boolean {
  if (!this.confirmationTokenExpires) return false;
  return new Date() > this.confirmationTokenExpires;
};

subscriberSchema.methods.markAsConfirmed = async function(): Promise<ISubscriber> {
  this.confirmed = true;
  this.confirmedAt = new Date();
  this.confirmationTokenExpires = undefined;
  return await this.save();
};

subscriberSchema.methods.unsubscribe = async function(): Promise<ISubscriber> {
  this.isActive = false;
  this.unsubscribedAt = new Date();
  return await this.save();
};

subscriberSchema.methods.updatePreferences = async function(
  preferences: Partial<ISubscriber['preferences']>
): Promise<ISubscriber> {
  (this as any).preferences = { ...this.preferences, ...preferences };
  return await this.save();
};

// Static methods
subscriberSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email });
};

subscriberSchema.statics.findActiveSubscribers = function() {
  return this.find({ confirmed: true, isActive: true });
};

subscriberSchema.statics.findByToken = function(token: string) {
  return this.findOne({ 
    token,
    confirmationTokenExpires: { $gt: new Date() }
  });
};

subscriberSchema.statics.cleanupExpiredTokens = async function() {
  const result = await this.deleteMany({
    confirmed: false,
    confirmationTokenExpires: { $lt: new Date() }
  });
  return result.deletedCount || 0;
};

// Create and export the model
const Subscriber = (mongoose.models.Subscriber as ISubscriberModel) || 
  mongoose.model<ISubscriber, ISubscriberModel>('Subscriber', subscriberSchema);

export default Subscriber;
