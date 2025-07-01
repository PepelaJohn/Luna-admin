// @/app/api/auth/register/route.ts (Updated with Rate Limiting)
import { NextRequest } from 'next/server';
import { z } from 'zod';
import User from '@/models/User';
import VerificationCode, { VerificationCodeType } from '@/models/VerificationCode';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { generateVerificationCode } from '@/lib/utils';
import { checkUpstashRegistrationRateLimit, recordUpstashFailedRegistration } from '@/lib/rateLimiting/upstashRegistrationRateLimit';

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

    // Check rate limits BEFORE processing registration
    const rateLimitResult = await checkUpstashRegistrationRateLimit(request, email);
    
    if (!rateLimitResult.allowed) {
      let message = 'Too many registration attempts. Please try again later.';
      let retryAfter = 60 * 60; // 1 hour default
      
      if (rateLimitResult.isStrictBlocked) {
        message = 'IP temporarily blocked due to suspicious activity. Please try again in 24 hours.';
        retryAfter = 24 * 60 * 60; // 24 hours
      } else if (!rateLimitResult.ipLimit.allowed) {
        const resetTime = rateLimitResult.ipLimit.resetTime;
        retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        message = `Too many registration attempts from this IP. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`;
      } else if (rateLimitResult.emailLimit && !rateLimitResult.emailLimit.allowed) {
        const resetTime = rateLimitResult.emailLimit.resetTime;
        retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        message = `Email has already been used for registration recently. Please try again in ${Math.ceil(retryAfter / 3600)} hours.`;
      }

      const response = returnError({
        message,
        status: 429,
      });
      
      response.headers.set('Retry-After', retryAfter.toString());
      response.headers.set('X-RateLimit-Limit', '3');
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', rateLimitResult.ipLimit.resetTime.toString());
      
      return response;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Record failed registration attempt for duplicate email
      await recordUpstashFailedRegistration(request, email, 'duplicate_email');
      
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
      isActive: false
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
    try {
      await sendVerificationEmail(email, code);
    } catch (emailError) {
      // If email sending fails, we should still consider the registration successful
      // but log the error for monitoring
      console.error('Failed to send verification email:', emailError);
    }

    // Return success response with rate limit headers
    const response = returnSuccess({
      message: 'Registration successful. Please check your email for verification code.',
      status: 201,
    });

    // Add rate limit headers for successful requests
    response.headers.set('X-RateLimit-Limit', '3');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.ipLimit.remainingAttempts.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.ipLimit.resetTime.toString());

    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      // Record failed registration for validation errors
      const body = await request.json().catch(() => ({}));
      await recordUpstashFailedRegistration(request, body.email, 'validation_error');
      
      return returnError({
        message: 'Invalid input data',
        error: error.errors,
        status: 400,
      });
    }

    // Record failed registration for server errors
    const body = await request.json().catch(() => ({}));
    await recordUpstashFailedRegistration(request, body.email, 'server_error');

    return returnError({
      message: 'Registration failed',
      error,
      status: 500,
    });
  }
}