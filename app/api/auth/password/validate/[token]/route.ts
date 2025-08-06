// api/auth/password/forgot/route.ts
import { NextRequest, NextResponse } from 'next/server';
import VerificationCode, { VerificationCodeType } from '@/models/VerificationCode';
import { connectDB } from '@/lib/db';



// const RESEND_COOLDOWN_MINUTES = 2;


export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const token = request.url.split('/').pop();

    const verificationCode = await VerificationCode.findById(token);

    if(!verificationCode || verificationCode.type !== VerificationCodeType.PasswordReset) {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 400 }
      );
    }
 

    return NextResponse.json(
      { 
        message: 'The token is valid',
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error in forgot password handler:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }

    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 503 } 
      );
    }

    if (error.code === 11000) { 
      return NextResponse.json(
        { error: 'A password reset request is already in progress' },
        { status: 409 } 
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

