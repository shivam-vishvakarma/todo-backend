import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private redisService: RedisService,
    private prismaService: PrismaService,
  ) {}

  async checkHealth() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const database = checks[0];
    const redis = checks[1];

    return {
      status: database.status === 'fulfilled' && redis.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: database.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          message: database.status === 'fulfilled' ? 'Connected' : (database as PromiseRejectedResult).reason?.message || 'Connection failed',
        },
        redis: {
          status: redis.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          message: redis.status === 'fulfilled' ? 'Connected' : (redis as PromiseRejectedResult).reason?.message || 'Connection failed',
        },
      },
    };
  }

  private async checkDatabase(): Promise<void> {
    await this.prismaService.$queryRaw`SELECT 1`;
  }

  private async checkRedis(): Promise<void> {
    await this.redisService.set('health-check', 'ok', 10);
    const result = await this.redisService.get('health-check');
    if (result !== 'ok') {
      throw new Error('Redis health check failed');
    }
    await this.redisService.del('health-check');
  }
}