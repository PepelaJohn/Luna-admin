// app/api/financial-records/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import FinancialRecord , {IFinancialRecord} from '@/models/FinancialRecord';
import { connectDB } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Fetch a single financial record
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    const id = (await params).id
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
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
const id = (await params).id
    const body = await request.json();
      console.log(body)

      const existingRecord:IFinancialRecord | null = await FinancialRecord.findById(id);
      if (!id || !existingRecord) {
        return NextResponse.json(
          { success: false, error: 'Financial record not found' },
          { status: 404 }
        );
      }
    // Extract update data

const originalStatus = existingRecord.status?.toLowerCase()
const newstatus = body.status?.toLowerCase()
const statusChanged = newstatus !== originalStatus
    const updateData: any = {
      title: body.title || existingRecord.title ,
      description: body.description || existingRecord.description,
      amount: parseFloat(body.amount) || existingRecord.amount,
      currency: body.currency|| existingRecord.currency || 'USD',
      category: body.category || existingRecord.category,
      date: new Date(body.dateApproved) || existingRecord.date,
      dateApproved: originalStatus !=='approved'&& newstatus === 'approved' ? new Date(body.dateApproved) : existingRecord.dateApproved,
      notes: body.notes || existingRecord.notes || '',
      type: body.type || existingRecord.type,
      status:body.status || existingRecord.status
    };

    // Fetch existing record
    

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
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    const id = (await params).id
    const record = await FinancialRecord.findById(id);

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Financial record not found' },
        { status: 404 }
      );
    }

    // Note: Attachments are stored on ImgBB, so no need to delete local files
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