// api/auth/password/forgot/route.ts
import { NextRequest, NextResponse } from 'next/server';
import User from "@/models/User";

import VerificationCode, { VerificationCodeType } from '@/models/VerificationCode';
import { SendPWDResetEmail, sendPasswordChangedEmail } from '@/lib/email';
import { timeFromNow } from '@/utils/date';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';

const RESEND_COOLDOWN_MINUTES = 2;
const PASSWORD_RESET_EXPIRY_HOURS = 24;


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
   
    if (!user) {
      return NextResponse.json(
        { 
          message: 'If an account with that email exists, a password reset link has been sent.',
          instructions: 'Check your email for password reset instructions.'
        },
        { status: 200 }
      );
    }

    // Check for existing password reset codes to prevent spam
    const existingCode = await VerificationCode.findOne({
      userId: user._id,
      type: VerificationCodeType.PasswordReset,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    // If there's a recent password reset code, check cooldown period
    if (existingCode) {
      const timeSinceLastCode = Date.now() - existingCode.createdAt.getTime();
      const cooldownMs = RESEND_COOLDOWN_MINUTES * 60 * 1000;
      
      if (timeSinceLastCode < cooldownMs) {
        const remainingTime = Math.ceil((cooldownMs - timeSinceLastCode) / 1000 / 60);
        return NextResponse.json(
          { 
            error: `Please wait ${remainingTime} minute(s) before requesting another password reset`,
            canRequestAt: new Date(existingCode.createdAt.getTime() + cooldownMs).toISOString()
          },
          { status: 429 } // Too Many Requests
        );
      }
    }

    // Clean up any existing password reset codes for this user
    await VerificationCode.deleteMany({
      userId: user._id,
      type: VerificationCodeType.PasswordReset
    });

    // Create new password reset verification code
    const verificationCode = await VerificationCode.create({
      userId: user._id,
      type: VerificationCodeType.PasswordReset,
      expiresAt: timeFromNow("h", PASSWORD_RESET_EXPIRY_HOURS) // Use utility function for consistency
    });

    // Send password reset email
    try {
      await SendPWDResetEmail({
        name: user.name,
        email: user.email,
        token: verificationCode._id.toString(),
      });
    } catch (emailError) {
      // If email sending fails, clean up the verification code
      await VerificationCode.findByIdAndDelete(verificationCode._id);
      
      console.error('Failed to send password reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Password reset email sent successfully',
        expiresAt: verificationCode.expiresAt.toISOString(),
        instructions: 'Check your email for password reset instructions. The link will expire in 24 hours.'
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



const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const { token, newPassword } = body;

    

    // Validate token
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid token is required' },
        { status: 400 }
      );
    }

    // Enhanced password validation
    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return NextResponse.json(
        { 
          error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          requirements: {
            minLength: 8,
            requiresUppercase: true,
            requiresLowercase: true,
            requiresNumber: true
          }
        },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(token)) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Find and validate the verification code with proper error handling
    const verificationCode = await VerificationCode.findById(token);

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    if (verificationCode.type !== VerificationCodeType.PasswordReset) {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 400 }
      );
    }

    // Check if the token has expired
    if (verificationCode.expiresAt <= new Date()) {
      // Clean up expired token
      await VerificationCode.findByIdAndDelete(token);
      return NextResponse.json(
        { error: 'Token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Find the user associated with the verification code
    const user = await User.findById(verificationCode.userId).select('+password');
    
    if (!user) {
      // Clean up orphaned verification code
      await VerificationCode.findByIdAndDelete(token);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user account is active/not suspended
    if (user.status === 'suspended' || user.status === 'deleted') {
      await VerificationCode.findByIdAndDelete(token);
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Check if the new password is different from the current one
    const isSamePassword = await user.comparePassword(newPassword);
   
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password' },
        { status: 400 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password using atomic operation
    const updateResult = await User.findByIdAndUpdate(
      user._id,
      { 
        password: hashedPassword,
        passwordChangedAt: new Date(),
        // Optionally invalidate all existing sessions
        sessionVersion: (user.sessionVersion || 0) + 1
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updateResult) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Clean up ALL password reset tokens for this user (security measure)
    await VerificationCode.deleteMany({
      userId: user._id,
      type: VerificationCodeType.PasswordReset
    });

    
    // Send password reset email
    try {
      await sendPasswordChangedEmail({
        name: user.name,
        email: user.email,
        
      });
    } catch (emailError) {
      // If email sending fails, clean up the verification code
      await VerificationCode.findByIdAndDelete(verificationCode._id);
      
      console.error('Failed to send password reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Password updated successfully',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error in password reset PATCH handler:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: 'Invalid data provided',
          details: error.message 
        },
        { status: 400 }
      );
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }

    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 503 }
      );
    }

    // Rate limiting or duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Operation failed due to conflict. Please try again.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
