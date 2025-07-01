// @/lib/upstashRateLimiter.ts
import { getUpstashRedis } from './upstashRedis';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: number;
  totalHits: number;
}

export class UpstashRateLimiter {
  private redis: Redis;

  constructor() {
    this.redis = getUpstashRedis();
  }

  private createRateLimiter(windowMs: number, maxAttempts: number) {
    return new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.slidingWindow(maxAttempts, `${windowMs}ms`),
      analytics: true,
    });
  }

  async checkLoginByIP(ip: string): Promise<RateLimitResult> {
    const ratelimit = this.createRateLimiter(15 * 60 * 1000, 10); // 10 per 15 min
    const result = await ratelimit.limit(`login_ip:${ip}`);

    return {
      allowed: result.success,
      remainingAttempts: result.remaining,
      resetTime: result.reset,
      totalHits: result.limit - result.remaining,
    };
  }

  async checkLoginByEmail(email: string): Promise<RateLimitResult> {
    const ratelimit = this.createRateLimiter(15 * 60 * 1000, 5); // 5 per 15 min
    const result = await ratelimit.limit(`login_email:${email.toLowerCase()}`);

    return {
      allowed: result.success,
      remainingAttempts: result.remaining,
      resetTime: result.reset,
      totalHits: result.limit - result.remaining,
    };
  }

  async checkStrictLimit(ip: string): Promise<RateLimitResult> {
    const ratelimit = this.createRateLimiter(60 * 60 * 1000, 3); // 3 per hour
    const result = await ratelimit.limit(`login_strict:${ip}`);

    return {
      allowed: result.success,
      remainingAttempts: result.remaining,
      resetTime: result.reset,
      totalHits: result.limit - result.remaining,
    };
  }

  async isBlocked(key: string): Promise<boolean> {
    try {
      const blocked = await this.redis.exists(`block:${key}`);
      return blocked === 1;
    } catch (error) {
      console.error('Block check error:', error);
      return false;
    }
  }

  async blockKey(key: string, durationSeconds: number): Promise<void> {
    try {
      await this.redis.setex(`block:${key}`, durationSeconds, '1');
    } catch (error) {
      console.error('Block key error:', error);
    }
  }

  async resetLimit(key: string): Promise<void> {
    try {
      await this.redis.del(`block:${key}`);
    } catch (error) {
      console.error('Reset limit error:', error);
    }
  }

   // Registration rate limiting methods
  async checkRegistrationByIP(ip: string): Promise<RateLimitResult> {
    const ratelimit = this.createRateLimiter(60 * 60 * 1000, 3); // 3 registrations per hour
    const result = await ratelimit.limit(`register_ip:${ip}`);

    return {
      allowed: result.success,
      remainingAttempts: result.remaining,
      resetTime: result.reset,
      totalHits: result.limit - result.remaining,
    };
  }

  async checkRegistrationByEmail(email: string): Promise<RateLimitResult> {
    const ratelimit = this.createRateLimiter(24 * 60 * 60 * 1000, 1); // 1 registration per day per email
    const result = await ratelimit.limit(`register_email:${email.toLowerCase()}`);

    return {
      allowed: result.success,
      remainingAttempts: result.remaining,
      resetTime: result.reset,
      totalHits: result.limit - result.remaining,
    };
  }

  async checkRegistrationStrictLimit(ip: string): Promise<RateLimitResult> {
    const ratelimit = this.createRateLimiter(24 * 60 * 60 * 1000, 5); // 5 registrations per day (strict)
    const result = await ratelimit.limit(`register_strict:${ip}`);

    return {
      allowed: result.success,
      remainingAttempts: result.remaining,
      resetTime: result.reset,
      totalHits: result.limit - result.remaining,
    };
  }
}

