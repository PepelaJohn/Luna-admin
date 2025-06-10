
// @/app/api/auth/reset-password/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import User from '@/models/User';
import VerificationCode, { VerificationCodeType } from '@/models/VerificationCode';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, code, newPassword } = resetPasswordSchema.parse(body);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return returnError({
        message: 'Invalid reset code',
        status: 400,
      });
    }

    // Find verification code
    const verificationCode = await VerificationCode.findOne({
      userId: user._id,
      type: VerificationCodeType.PasswordReset,
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationCode) {
      return returnError({
        message: 'Invalid or expired reset code',
        status: 400,
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    
    // Increment session version to invalidate all existing sessions
    await user.incrementSessionVersion();
    
    await user.save();

    // Delete verification code
    await VerificationCode.deleteOne({ _id: verificationCode._id });

    return returnSuccess({
      message: 'Password reset successful',
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

