// @/app/api/auth/resend-verification/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import User from '@/models/User';
import VerificationCode, { VerificationCodeType } from '@/models/VerificationCode';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { generateVerificationCode } from '@/lib/utils';

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email } = resendSchema.parse(body);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return returnError({
        message: 'User not found',
        status: 404,
      });
    }

    if (user.isEmailVerified) {
      return returnError({
        message: 'Email is already verified',
        status: 400,
      });
    }

    // Delete existing verification codes
    await VerificationCode.deleteMany({
      userId: user._id,
      type: VerificationCodeType.EmailVerification,
    });

    // Generate new verification code
    const code = generateVerificationCode();
    const verificationCode = new VerificationCode({
      userId: user._id,
      type: VerificationCodeType.EmailVerification,
      code,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await verificationCode.save();

    // Send verification email
    await sendVerificationEmail(email, code);

    return returnSuccess({
      message: 'Verification code sent successfully',
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
      message: 'Failed to resend verification code',
      error,
      status: 500,
    });
  }
}