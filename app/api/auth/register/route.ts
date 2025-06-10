// @/app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import User from '@/models/User';
import VerificationCode, { VerificationCodeType } from '@/models/VerificationCode';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { generateVerificationCode } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['normal', 'corporate', 'admin']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, email, password, role } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return returnError({
        message: 'User already exists with this email',
        status: 400,
      });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || 'normal',
    });

    await user.save();

    // Generate verification code
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
      message: 'Registration successful. Please check your email for verification code.',
      status: 201,
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
      message: 'Registration failed',
      error,
      status: 500,
    });
  }
}
