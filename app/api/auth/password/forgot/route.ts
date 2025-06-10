
// @/app/api/auth/forgot-password/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import User from '@/models/User';
import VerificationCode, { VerificationCodeType } from '@/models/VerificationCode';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { generateVerificationCode } from '@/lib/utils';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return returnSuccess({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Delete any existing password reset codes
    await VerificationCode.deleteMany({
      userId: user._id,
      type: VerificationCodeType.PasswordReset,
    });

    // Generate new verification code
    const code = generateVerificationCode();
    const verificationCode = new VerificationCode({
      userId: user._id,
      type: VerificationCodeType.PasswordReset,
      code,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await verificationCode.save();

    // Send password reset email
    await sendPasswordResetEmail(email, code);

    return returnSuccess({
      message: 'If an account with that email exists, a password reset link has been sent.',
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
      message: 'Password reset failed',
      error,
      status: 500,
    });
  }
}
