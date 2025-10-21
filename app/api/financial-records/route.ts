// app/api/financial-records/route.ts
import { NextRequest, NextResponse } from 'next/server';
import FinancialRecord from '@/models/FinancialRecord';
import { connectDB } from '@/lib/db';
import { IUser } from '@/models/User';
/* 
export interface IUser extends Document {
  _id:string;
  name: string;
  email: string;
  password?: string;
  role: "normal" | "corporate" | "admin" | "super_admin" | 'moderator';
  isEmailVerified: boolean;
  isActive: boolean;
  _id:string;
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
  multifactorAuthentication?: boolean;
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

*/
// GET - List all financial records with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const query: any = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      FinancialRecord.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FinancialRecord.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching financial records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new financial record
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const user = (request as any).user as IUser;;
    const userId = user._id;
    if(!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if(user.role !== 'super_admin' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Extract record data
    const recordData = {
      title: body.title,
      description: body.description,
      amount: parseFloat(body.amount),
      currency: body.currency || 'USD',
      category: body.category,
      date: new Date(body.date),
      submittedBy: userId,
      notes: body.notes || '',
      type: body.type,
      attachments: body.attachments || [], // Attachments with imgbb URLs
    };

    // Create the record
    const record = await FinancialRecord.create(recordData);

    return NextResponse.json(
      {
        success: true,
        data: record,
        message: 'Financial record created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating financial record:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create financial record' 
      },
      { status: 500 }
    );
  }
}