// @/lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import User, { IUser } from '@/models/User';
import { connectDB } from '@/lib/db';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  sessionVersion: number;
  iat: number;
  exp: number;
}

interface AuthResult {
  success: boolean;
  user?: IUser;
  error?: string;
}

export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  try {
    await connectDB();

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if session is still valid (session version matches)
    if (user.sessionVersion !== decoded.sessionVersion) {
      return { success: false, error: 'Session invalidated' };
    }

    // Check if password was changed after token was issued
    if (user.isPasswordChangedAfter(new Date(decoded.iat * 1000))) {
      return { success: false, error: 'Password changed after token issued' };
    }

    return { success: true, user };
  } catch (error) {
    console.log(error)
    return { success: false, error: 'Invalid token' };
  }
}

export function requireAuth(roles?: string[]) {
  return async (request: NextRequest) => {
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Check role if specified
    if (roles && !roles.includes(authResult.user!.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }

    return { success: true, user: authResult.user };
  };
}

// @/types/auth.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}