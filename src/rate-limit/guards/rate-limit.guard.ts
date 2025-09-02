import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitService, RateLimitOptions } from '../rate-limit.service';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private rateLimitService: RateLimitService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rateLimitOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Generate key based on IP and user ID if available
    const ip = request.ip || request.connection.remoteAddress;
    const userId = request.user?.id;
    const key = userId ? `user:${userId}` : `ip:${ip}`;

    const result = await this.rateLimitService.isRateLimited(key, rateLimitOptions);

    // Set rate limit headers
    response.setHeader('X-RateLimit-Limit', rateLimitOptions.max);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (result.limited) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests',
          error: 'Too Many Requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}