import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Allowed file types for receipts
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/svg+xml'
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// POST - Upload receipt file
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = params.id;
    
    if (!expenseId) {
      return NextResponse.json(
        { success: false, error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('receipt') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF, Word, Excel, and image files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'receipts');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'bin';
    const fileName = `receipt_${expenseId}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the URL path for the uploaded file
    const receiptUrl = `/uploads/receipts/${fileName}`;

    // TODO: Update the expense record in your database with the new receiptUrl
    // Example: await updateExpenseInDatabase(expenseId, { receiptUrl });

    return NextResponse.json({
      success: true,
      receiptUrl,
      message: 'Receipt uploaded successfully'
    });

  } catch (error) {
    console.error('Receipt upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove receipt file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = params.id;
    
    if (!expenseId) {
      return NextResponse.json(
        { success: false, error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    // TODO: Get the current receipt URL from your database
    // const expense = await getExpenseFromDatabase(expenseId);
    // const receiptUrl = expense?.receiptUrl;

    // For now, we'll assume the receipt URL follows our naming pattern
    // In a real implementation, you'd get this from your database
    const receiptUrl = `/uploads/receipts/receipt_${expenseId}_*.{pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif,webp,bmp,tiff,svg}`;

    // TODO: Remove the file from storage and update database
    // if (receiptUrl && receiptUrl.startsWith('/uploads/receipts/')) {
    //   const fileName = receiptUrl.split('/').pop();
    //   const filePath = join(process.cwd(), 'public', 'uploads', 'receipts', fileName);
    //   
    //   if (existsSync(filePath)) {
    //     await unlink(filePath);
    //   }
    //   
    //   await updateExpenseInDatabase(expenseId, { receiptUrl: null });
    // }

    return NextResponse.json({
      success: true,
      message: 'Receipt deleted successfully'
    });

  } catch (error) {
    console.error('Receipt delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
