// @/lib/rateLimiting/upstashRegistrationRateLimit.ts
import { UpstashRateLimiter } from './upstashRateLimiter';
import { NextRequest } from 'next/server';

const rateLimiter = new UpstashRateLimiter();

export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

export async function checkUpstashRegistrationRateLimit(
  request: NextRequest,
  email?: string
) {
  const clientIP = getClientIP(request);
  
  try {
    const [ipResult, emailResult, isStrictBlocked] = await Promise.all([
      rateLimiter.checkRegistrationByIP(clientIP),
      email ? rateLimiter.checkRegistrationByEmail(email) : null,
      rateLimiter.isBlocked(clientIP),
    ]);

    const ipAllowed = ipResult.allowed && !isStrictBlocked;
    const emailAllowed = !emailResult || emailResult.allowed;
    const allowed = ipAllowed && emailAllowed;

    return {
      allowed,
      ipLimit: ipResult,
      emailLimit: emailResult,
      isStrictBlocked,
      clientIP,
    };
  } catch (error) {
    console.error('Registration rate limit check failed:', error);
    
    // Fail open but with conservative limits
    return {
      allowed: true,
      ipLimit: { allowed: true, remainingAttempts: 3, resetTime: Date.now() + 60 * 60 * 1000, totalHits: 0 },
      emailLimit: null,
      isStrictBlocked: false,
      clientIP,
    };
  }
}

export async function recordUpstashFailedRegistration(
  request: NextRequest,
  email?: string,
  reason: 'duplicate_email' | 'validation_error' | 'server_error' = 'validation_error'
) {
  const clientIP = getClientIP(request);
  
  try {
    // Check if IP has exceeded limits
    const ipResult = await rateLimiter.checkRegistrationByIP(clientIP);
    
    if (!ipResult.allowed) {
      // Check strict limit for potential blocking
      const strictResult = await rateLimiter.checkRegistrationStrictLimit(clientIP);
      
      if (!strictResult.allowed) {
        // Block IP for 24 hours due to excessive registration attempts
        await rateLimiter.blockKey(clientIP, 24 * 60 * 60);
      }
    }
    
    // Record email-based attempt if email provided
    if (email) {
      await rateLimiter.checkRegistrationByEmail(email);
    }
  } catch (error) {
    console.error('Failed to record failed registration:', error);
  }
}