// @/lib/api-middleware.ts
import { NextRequest } from 'next/server';
import { returnError } from '@/lib/response';
import { verifyAuthToken } from '@/lib/auth';

export function withAuth(handler: Function, options?: { roles?: string[] }) {
  return async (request: NextRequest, context?: any) => {
    try {
      const authResult = await verifyAuthToken(request);
      
      if (!authResult.success) {
        return returnError({
          message: 'Unauthorized',
          status: 401,
        });
      }

      // Check role if specified
      if (options?.roles && !options.roles.includes(authResult.user!.role)) {
        return returnError({
          message: 'Insufficient permissions',
          status: 403,
        });
      }

      // Add user to request context
      (request as any).user = authResult.user;
      
      return handler(request, context);
    } catch (error) {
      return returnError({
        message: 'Authentication failed',
        error,
        status: 500,
      });
    }
  };
}










// Package.json dependencies to add:
/*
{
  "dependencies": {
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "resend": "^3.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.0",
    "@types/bcryptjs": "^2.4.0"
  }
}
*/