
// @/lib/logger.ts - Logger Service
import Log from '@/models/Log';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

export interface LogEntry {
  action: string;
  entity: string;
  entityId: string | mongoose.Types.ObjectId;
  performedBy: string | mongoose.Types.ObjectId;
  metadata?: {
    old?: any;
    new?: any;
    changes?: string[];
    reason?: string;
    error?:string,
    
  };
  ip: string;
  userAgent?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'success' | 'failed' | 'partial';
}

export class Logger {
  static async log(entry: LogEntry): Promise<void> {
    try {
      await connectDB();
      const logEntry = new Log({
        ...entry,
        entityId: entry.entityId || "unknown",
        performedBy: new mongoose.Types.ObjectId(entry.performedBy),
        severity: entry.severity || 'low',
        status: entry.status || 'success'
      });

      await logEntry.save();
    } catch (error) {
      console.error('Failed to create log entry:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  static async logUserUpdate(
    userId: string,
    performedBy: string,
    oldData: any,
    newData: any,
    ip: string,
    userAgent?: string,
    reason?: string
  ): Promise<void> {
    const changes = this.getChangedFields(oldData, newData);
    
    await this.log({
      action: 'update',
      entity: 'User',
      entityId: userId,
      performedBy,
      metadata: {
        old: oldData,
        new: newData,
        changes,
        reason
      },
      ip,
      userAgent,
      severity: this.determineSeverity('update', 'User', changes),
      status: 'success'
    });
  }

  static async logUserDeletion(
    userId: string,
    performedBy: string,
    userData: any,
    ip: string,
    userAgent?: string,
    reason?: string
  ): Promise<void> {
    await this.log({
      action: 'delete',
      entity: 'User',
      entityId: userId,
      performedBy,
      metadata: {
        old: userData,
        reason
      },
      ip,
      userAgent,
      severity: 'critical',
      status: 'success'
    });
  }

  static async logUserCreation(
    userId: string,
    performedBy: string,
    userData: any,
    ip: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: 'create',
      entity: 'User',
      entityId: userId,
      performedBy,
      metadata: {
        new: userData
      },
      ip,
      userAgent,
      severity: 'medium',
      status: 'success'
    });
  }
  static async logPartnerCreation(
  partnerId: string,
  performedBy: string,
  partnerData: any,
  ip: string,
  userAgent?: string
): Promise<void> {
  await this.log({
    action: 'create',
    entity: 'Partner',
    entityId: partnerId,
    performedBy,
    metadata: {
      new: partnerData
    },
    ip,
    userAgent,
    severity: 'medium',
    status: 'success'
  });
}

static async logPartnerUpdate(
  partnerId: string,
  performedBy: string,
  oldData: any,
  newData: any,
  ip: string,
  userAgent?: string,
  reason?: string
): Promise<void> {
  const changes = this.getChangedFields(oldData, newData);
  
  await this.log({
    action: 'update',
    entity: 'Partner',
    entityId: partnerId,
    performedBy,
    metadata: {
      old: oldData,
      new: newData,
      changes,
      reason
    },
    ip,
    userAgent,
    severity: this.determineSeverity('update', 'Partner', changes),
    status: 'success'
  });
}

static async logPartnerDeletion(
  partnerId: string,
  performedBy: string,
  partnerData: any,
  ip: string,
  userAgent?: string,
  reason?: string
): Promise<void> {
  await this.log({
    action: 'delete',
    entity: 'Partner',
    entityId: partnerId,
    performedBy,
    metadata: {
      old: partnerData,
      reason
    },
    ip,
    userAgent,
    severity: 'high', // Partners might be less critical than users
    status: 'success'
  });
}

  private static getChangedFields(oldData: any, newData: any): string[] {
    const changes: string[] = [];
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
    
    for (const key of allKeys) {
      if (JSON.stringify(oldData?.[key]) !== JSON.stringify(newData?.[key])) {
        changes.push(key);
      }
    }
    
    return changes;
  }

  private static determineSeverity(action: string, entity: string, changes?: string[]): 'low' | 'medium' | 'high' | 'critical' {
  if (action === 'delete') {
    return entity === 'User' ? 'critical' : 'high'; // Users are more critical than partners
  }
  if (action === 'create') return 'medium';
  
  if (action === 'update' && changes) {
    // User-specific critical fields
    const userCriticalFields = ['role', 'permissions', 'status', 'isActive'];
    const userSensitiveFields = ['email', 'password', 'phone'];
    
    // Partner-specific critical fields (adjust based on your Partner model)
    const partnerCriticalFields = ['status', 'isActive', 'contractStatus', 'tierLevel'];
    const partnerSensitiveFields = ['email', 'contactInfo', 'businessDetails', 'paymentInfo'];
    
    if (entity === 'User') {
      if (changes.some(field => userCriticalFields.includes(field))) return 'critical';
      if (changes.some(field => userSensitiveFields.includes(field))) return 'high';
    } else if (entity === 'Partner') {
      if (changes.some(field => partnerCriticalFields.includes(field))) return 'high';
      if (changes.some(field => partnerSensitiveFields.includes(field))) return 'medium';
    }
    
    if (changes.length > 5) return 'medium';
  }
  
  return 'low';
}
}