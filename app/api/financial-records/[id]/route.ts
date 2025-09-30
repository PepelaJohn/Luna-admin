// app/api/financial-records/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import FinancialRecord from '@/models/FinancialRecord';
import { connectDB } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Fetch a single financial record
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();

    const record = await FinancialRecord.findById(params.id);

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

    const body = await request.json();
      console.log(body)
    // Extract update data
    const updateData: any = {
      title: body.title,
      description: body.description,
      amount: parseFloat(body.amount),
      currency: body.currency || 'USD',
      category: body.category,
      date: new Date(body.date),
      notes: body.notes || '',
      type: body.type,
    };

    // Fetch existing record
    const existingRecord = await FinancialRecord.findById(params.id);
    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: 'Financial record not found' },
        { status: 404 }
      );
    }

    // Handle attachments
    const keepExisting = body.keepExistingAttachments !== false;
    let attachments = keepExisting ? [...existingRecord.attachments] : [];

    // Add new attachments if provided
    if (body.attachments && Array.isArray(body.attachments)) {
      attachments = [...attachments, ...body.attachments];
    }

    updateData.attachments = attachments;

    // Update the record
    const record = await FinancialRecord.findByIdAndUpdate(
      params.id,
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

    const record = await FinancialRecord.findById(params.id);

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Financial record not found' },
        { status: 404 }
      );
    }

    // Note: Attachments are stored on ImgBB, so no need to delete local files
    await FinancialRecord.findByIdAndDelete(params.id);

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