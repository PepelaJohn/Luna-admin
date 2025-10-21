// app/api/financial-records/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import FinancialRecord, { IFinancialRecord } from '@/models/FinancialRecord';
import { connectDB } from '@/lib/db';
import { IUser } from '@/models/User';
import { withAuth } from '@/lib/api-middleware';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Fetch a single financial record
async function getFinancialRecordHandler(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    const id = (await params).id;
    const record = await FinancialRecord.findById(id);

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Financial record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    console.error('Error fetching financial record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a financial record
async function updateFinancialRecordHandler(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    const id = (await params).id;
    const body = await request.json();
    const user = (request as any).user as IUser;
    const userId = user._id;

    // Check authorization
    if (user.role !== 'super_admin' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Fetch existing record
    const existingRecord: IFinancialRecord | null = await FinancialRecord.findById(id);
    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: 'Financial record not found' },
        { status: 404 }
      );
    }

    // Track status changes
    const originalStatus = existingRecord.status?.toLowerCase();
    const newStatus = body.status?.toLowerCase();
    const statusChanged = newStatus && originalStatus !== newStatus;

    // Build update data
    const updateData: any = {
      title: body.title ?? existingRecord.title,
      description: body.description ?? existingRecord.description,
      amount: body.amount !== undefined ? parseFloat(body.amount) : existingRecord.amount,
      currency: body.currency ?? existingRecord.currency,
      category: body.category ?? existingRecord.category,
      date: body.date ? new Date(body.date) : existingRecord.date,
      notes: body.notes ?? existingRecord.notes,
      type: body.type ?? existingRecord.type,
      status: body.status ?? existingRecord.status,
    };

    // Track approval
    if (statusChanged && newStatus === 'approved') {
      updateData.approvedBy = userId;
      updateData.dateApproved = new Date();
    }

    // Track payment
    if (statusChanged && newStatus === 'paid') {
      updateData.datePaid = new Date();
      // If not already approved, set approval info
      if (originalStatus !== 'approved' && !existingRecord.approvedBy) {
        updateData.approvedBy = userId;
        updateData.dateApproved = new Date();
      }
    }

    // Handle attachments
    const keepExisting = body.keepExistingAttachments !== false;
    let attachments = keepExisting ? [...(existingRecord.attachments ?? [])] : [];

    // Add new attachments if provided
    if (body.attachments && Array.isArray(body.attachments)) {
      attachments = [...attachments, ...body.attachments];
    }

    updateData.attachments = attachments;

    // Update the record
    const record = await FinancialRecord.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: record,
      message: 'Financial record updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating financial record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a financial record
async function deleteFinancialRecordHandler(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    const id = (await params).id;
    const user = (request as any).user as IUser;

    // Check authorization - only super_admin can delete
    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Only super admins can delete records' },
        { status: 403 }
      );
    }

    const record = await FinancialRecord.findById(id);

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Financial record not found' },
        { status: 404 }
      );
    }

    await FinancialRecord.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Financial record deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting financial record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Export with middleware
export const GET = withAuth(getFinancialRecordHandler);
export const PUT = withAuth(updateFinancialRecordHandler);
export const DELETE = withAuth(deleteFinancialRecordHandler);