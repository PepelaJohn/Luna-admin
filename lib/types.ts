// ===========================================
// FILE: src/lib/types.ts
// ===========================================
export interface Partner {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  industry: 'retail' | 'healthcare' | 'ecommerce' | 'logistics' | 'food' | 'other';
  businessType: 'b2b' | 'b2c' | 'both';
  location: string;
  monthlyOrders?: '0-100' | '100-500' | '500-1000' | '1000-5000' | '5000+';
  averageOrderValue?: '0-1000' | '1000-5000' | '5000-10000' | '10000+';
  currentDeliveryMethod?: string;
  partnershipGoals?: string;
  additionalInfo?: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscriber {
  _id: string;
  email: string;
  confirmed: boolean;
  token: string;
  confirmationTokenExpires?: Date;
  subscribedAt: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  isActive: boolean;
  source?: string;
  tags?: string[];
  preferences?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'normal' | 'corporate' | 'admin' | 'super_admin';
  isEmailVerified: boolean;
  avatar?: string;
  sessionVersion: number;
  passwordChangedAt: string | null;
  lastLogin: Date | undefined;
  createdAt: string;
  updatedAt: string;
  __v: number;
  phone?: string;
  isActive:boolean
}



export interface LogResponse {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  performedBy: {
    email:string,
    name:string;
      role: 'normal' | 'corporate' | 'admin' | 'super_admin';
      _id:string

  };
  metadata: Metadata;
  ip: string;
  userAgent: string;
  severity: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

interface Metadata {
  old: any;
  reason?: string;
  changes: any[];
}







export interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: "normal" | "corporate" | "admin";
  isEmailVerified: boolean;
  isActive: boolean;
  reason:string
}
export interface UpdateuserData {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  role?: "normal" | "corporate" | "admin" | "super_admin";
  isEmailVerified?: boolean;
  isActive?: boolean;
  reason?:string
}