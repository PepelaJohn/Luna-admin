
// @/types/auth.ts (TypeScript types)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'normal' | 'corporate' | 'admin';
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
 
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
      isEmailVerified: boolean;
      lastLogin?: Date;
   
  };
  status: number;
}