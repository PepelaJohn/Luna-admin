import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'normal' | 'corporate' | 'admin' | 'super_admin';
  isEmailVerified: boolean;
  isActive:boolean;
  providers: {
    google?: {
      id: string;
      email: string;
    };
    apple?: {
      id: string;
      email: string;
    };
    facebook?: {
      id: string;
      email: string;
    };
  };
  phone: string;
  avatar?: string;
  sessionVersion: number;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementSessionVersion(): Promise<void>;
  isPasswordChangedAfter(timestamp: Date): boolean;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  isActive:{type:Boolean, default:true},
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please enter a valid email']
  },
  phone: {
    type: mongoose.Schema.Types.Mixed
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['normal', 'corporate', 'admin', 'super_admin'],
    default: 'normal'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  providers: {
    google: {
      id: String,
      email: String
    },
    apple: {
      id: String,
      email: String
    },
    facebook: {
      id: String,
      email: String
    }
  },
  avatar: {
    type: String,
    default: null
  },
  sessionVersion: {
    type: Number,
    default: 0,
    min: [0, 'Session version cannot be negative']
  },
  passwordChangedAt: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    if (!this.isNew) {
      this.passwordChangedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword.toString(), this.password.toString());
};

UserSchema.methods.incrementSessionVersion = async function(): Promise<void> {
  this.sessionVersion = (this.sessionVersion || 0) + 1;
  await this.save({ validateBeforeSave: false });
};

UserSchema.methods.isPasswordChangedAfter = function(timestamp: Date): boolean {
  if (!this.passwordChangedAt) return false;
  return this.passwordChangedAt > timestamp;
};



export default mongoose?.models?.User || mongoose.model<IUser>('User', UserSchema);