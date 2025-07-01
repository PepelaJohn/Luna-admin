
// @/app/api/auth/verify-email/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import User from '@/models/User';
import VerificationCode, { VerificationCodeType } from '@/models/VerificationCode';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, code } = verifySchema.parse(body);
    console.log(code, email)
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return returnError({
        message: 'User not found',
        status: 404,
      });
    }

    // Find verification code
    const verificationCode = await VerificationCode.findOne({
      userId: user._id,
      type: VerificationCodeType.EmailVerification,
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationCode) {
      return returnError({
        message: 'Invalid or expired verification code',
        status: 400,
      });
    }

    // Update user
    user.isEmailVerified = true;
    await user.save();

    // Delete verification code
    await VerificationCode.deleteOne({ _id: verificationCode._id });

    return returnSuccess({
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return returnError({
        message: 'Invalid input data',
        error: error.errors,
        status: 400,
      });
    }

    return returnError({
      message: 'Email verification failed',
      error,
      status: 500,
    });
  }
}
