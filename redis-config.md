# Upstash Redis Rate Limiting Setup

## 1. Installation

```bash
pnpm install @upstash/redis @upstash/ratelimit
```

## 2. Environment Variables

Add to your `.env.local` file:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-auth-token
```

**How to get these values:**
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a Redis database (or select existing one)
3. Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the dashboard

## 3. File Structure

Create these files in your project:

```
/lib
    /rateLimiting
    ├── upstashRedis.ts              # Redis client setup
    ├── upstashRateLimiter.ts        # Core rate limiting logic
    └── upstashLoginRateLimit.ts     # Login-specific rate limiting

/app/api/auth/login
└── route.ts                     # Updated login route
```

## 4. Rate Limiting Rules

### IP-based Limiting
- **10 attempts** per IP per **15 minutes**
- Sliding window algorithm

### Email-based Limiting  
- **5 attempts** per email per **15 minutes**
- Prevents targeted account attacks

### Strict Mode
- Activates after IP limit exceeded
- **3 attempts** per IP per **hour**
- **24-hour block** for repeat offenders

## 5. Features

✅ **Serverless Optimized** - Perfect for Vercel/Netlify  
✅ **Sliding Window** - More accurate than fixed windows  
✅ **Analytics Built-in** - Track rate limit usage  
✅ **Automatic Failover** - Fails open if Redis is down  
✅ **Multiple Limit Types** - IP, email, and strict mode  
✅ **Progressive Penalties** - Escalating restrictions  

## 6. Response Headers

The implementation adds standard rate limiting headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1672531200000
Retry-After: 900
```

## 7. Manual Reset (Optional)

To manually reset limits for specific users:

```typescript
import { UpstashRateLimiter } from '@/lib/upstashRateLimiter';

const rateLimiter = new UpstashRateLimiter();

// Reset blocks (limits will still apply until window expires)
await rateLimiter.resetLimit('user-ip-or-email');
```

## 8. Monitoring

Check your Upstash dashboard for:
- Request volume
- Rate limit hits
- Error rates
- Geographic distribution

## 9. Testing

Test the rate limiting:

```bash
# Test IP-based limiting (run 11+ times quickly)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

# Should return 429 after 10 attempts
```

## 10. Production Considerations

- **Monitor your Upstash usage** - Rate limiting can increase request volume
- **Adjust limits** based on your user patterns
- **Set up alerts** for unusual rate limit activity
- **Consider IP whitelisting** for trusted networks
- **Log blocked attempts** for security monitoring