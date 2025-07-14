
import { NextRequest } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';
import { checkUpstashLoginRateLimit, recordUpstashFailedLogin } from '@/lib/rateLimiting/upstashLoginRateLimit';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Check rate limits BEFORE attempting login
    const rateLimitResult = await checkUpstashLoginRateLimit(request, email);
    
    if (!rateLimitResult.allowed) {
      let message = 'Too many login attempts. Please try again later.';
      let retryAfter = 15 * 60; // 15 minutes default
      
      if (rateLimitResult.isStrictBlocked) {
        message = 'Account temporarily suspended due to suspicious activity. Please try again in 24 hours.';
        retryAfter = 24 * 60 * 60; // 24 hours
      } else if (!rateLimitResult.ipLimit.allowed) {
        const resetTime = rateLimitResult.ipLimit.resetTime;
        retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        message = `Too many login attempts from this IP. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`;
      } else if (rateLimitResult.emailLimit && !rateLimitResult.emailLimit.allowed) {
        const resetTime = rateLimitResult.emailLimit.resetTime;
        retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        message = `Too many login attempts for this email. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`;
      }

      const response = returnError({
        message,
        status: 429,
      });
      
      response.headers.set('Retry-After', retryAfter.toString());
      response.headers.set('X-RateLimit-Limit', '10');
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', rateLimitResult.ipLimit.resetTime.toString());
      
      return response;
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Record failed login attempt
      await recordUpstashFailedLogin(request, email);
      
      return returnError({
        message: 'Invalid credentials',
        status: 401,
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Record failed login attempt
      await recordUpstashFailedLogin(request, email);
      
      return returnError({
        message: 'Invalid credentials',
        status: 401,
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return returnError({
        message: 'Please verify your email before logging in',
        status: 401,
      });
    }

    if (!user.isActive) {
      return returnError({
        message: "Your account is inactive. Please contact support for assistance.",
        status: 403
      });
    }

    // Increment session version (invalidates all existing sessions)
    await user.incrementSessionVersion();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        sessionVersion: user.sessionVersion,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    const response = returnSuccess({
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          lastLogin: user.lastLogin,
        },
      },
      message: 'Login successful',
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Add rate limit headers for successful requests
    response.headers.set('X-RateLimit-Limit', '10');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.ipLimit.remainingAttempts.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.ipLimit.resetTime.toString());

    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return returnError({
        message: 'Invalid input data',
        error: error.errors,
        status: 400,
      });
    }

    return returnError({
      message: 'Login failed',
      error,
      status: 500,
    });
  }
}