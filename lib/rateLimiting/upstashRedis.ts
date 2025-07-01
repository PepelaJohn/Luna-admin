// @/lib/upstashRedis.ts
import { Redis } from '@upstash/redis';
import { getEnvironmentVariable } from '../utils';

let redis: Redis | null = null;



 const url = getEnvironmentVariable('UPSTASH_REDIS_REST_URL')
const token = getEnvironmentVariable('UPSTASH_REDIS_REST_TOKEN')


export function getUpstashRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url,
      token,
    });
  }
  return redis;
}