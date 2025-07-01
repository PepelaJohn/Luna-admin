// @/lib/upstashLoginRateLimit.ts
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

export async function checkUpstashLoginRateLimit(
  request: NextRequest,
  email?: string
) {
  const clientIP = getClientIP(request);
  
  try {
   
    const [ipResult, emailResult, isStrictBlocked] = await Promise.all([
      rateLimiter.checkLoginByIP(clientIP),
      email ? rateLimiter.checkLoginByEmail(email) : null,
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
    console.error('Rate limit check failed:', error);
    
    return {
      allowed: true,
      ipLimit: { allowed: true, remainingAttempts: 10, resetTime: Date.now() + 15 * 60 * 1000, totalHits: 0 },
      emailLimit: null,
      isStrictBlocked: false,
      clientIP,
    };
  }
}

export async function recordUpstashFailedLogin(
  request: NextRequest,
  email: string
) {
  const clientIP = getClientIP(request);
  
  try {
    
    const ipResult = await rateLimiter.checkLoginByIP(clientIP);
    
    if (!ipResult.allowed) {
      const strictResult = await rateLimiter.checkStrictLimit(clientIP);
      
      if (!strictResult.allowed) {
        await rateLimiter.blockKey(clientIP, 24 * 60 * 60);
      }
    }
    
    await rateLimiter.checkLoginByEmail(email);
  } catch (error) {
    console.error('Failed to record failed login:', error);
  }
}