// @/models/Log.ts - Improved Log Model
import mongoose, { Document, Schema } from 'mongoose';

export interface ILog extends Document {
  action: string;
  entity: string;
  entityId: mongoose.Types.ObjectId;
  performedBy: mongoose.Types.ObjectId;
  metadata?: { 
    old?: any; 
    new?: any; 
    changes?: string[];
    reason?: string;
    error? :string;
  } | null;
  ip: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'partial';
  createdAt: Date;
  updatedAt: Date;
}

const logSchema = new Schema<ILog>({
  action: { 
    type: String, 
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'view', 'export', 'import', 'activate', 'deactivate']
  },
  entity: { 
    type: String, 
    required: true,
    enum: ['User', 'Subscriber', 'Partner', 'System', 'Settings']
  },
  entityId: { type: Schema.Types.ObjectId, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index:true },
  metadata: {
    old: { type: Schema.Types.Mixed },
    new: { type: Schema.Types.Mixed },
    changes: [{ type: String }],
    reason: { type: String },
    error: { type: String }
    
  },
  ip: { type: String, required: true },
  userAgent: { type: String },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'low' 
  },
  status: { 
    type: String, 
    enum: ['success', 'failed', 'partial'], 
    default: 'success' 
  }
}, { 
  timestamps: true,
  // Add indexes for better query performance
  
});

export default mongoose.models.Log || mongoose.model<ILog>('Log', logSchema);
