
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
      console.log(entry)
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
    if (action === 'delete') return 'critical';
    if (action === 'create') return 'medium';
    
    if (action === 'update' && changes) {
      const criticalFields = ['role', 'permissions', 'status', 'isActive'];
      const sensitiveFields = ['email', 'password', 'phone'];
      
      if (changes.some(field => criticalFields.includes(field))) return 'critical';
      if (changes.some(field => sensitiveFields.includes(field))) return 'high';
      if (changes.length > 5) return 'medium';
    }
    
    return 'low';
  }
}