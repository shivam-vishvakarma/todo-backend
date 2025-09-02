import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests
  keyGenerator?: (req: any) => string;
}

@Injectable()
export class RateLimitService {
  constructor(private redisService: RedisService) {}

  async isRateLimited(
    key: string,
    options: RateLimitOptions,
  ): Promise<{ limited: boolean; remaining: number; resetTime: number }> {
    const windowStart = Math.floor(Date.now() / options.windowMs) * options.windowMs;
    const redisKey = `rate_limit:${key}:${windowStart}`;

    const current = await this.redisService.incr(redisKey);
    
    if (current === 1) {
      // Set expiration for the first request in this window
      await this.redisService.expire(redisKey, Math.ceil(options.windowMs / 1000));
    }

    const remaining = Math.max(0, options.max - current);
    const resetTime = windowStart + options.windowMs;

    return {
      limited: current > options.max,
      remaining,
      resetTime,
    };
  }

  async resetRateLimit(key: string): Promise<void> {
    const keys = await this.redisService.keys(`rate_limit:${key}:*`);
    if (keys.length > 0) {
      await Promise.all(keys.map(k => this.redisService.del(k)));
    }
  }

  // Predefined rate limit configurations
  static readonly AUTH_RATE_LIMIT: RateLimitOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
  };

  static readonly API_RATE_LIMIT: RateLimitOptions = {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  };

  static readonly ADMIN_RATE_LIMIT: RateLimitOptions = {
    windowMs: 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute for admin
  };
}