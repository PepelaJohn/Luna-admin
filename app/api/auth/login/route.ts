
// @/app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { returnSuccess, returnError } from '@/lib/response';
import { connectDB } from '@/lib/db';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return returnError({
        message: 'Invalid credentials',
        status: 401,
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
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
