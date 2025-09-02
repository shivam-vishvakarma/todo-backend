import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Post,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CacheService } from '../cache/cache.service';
import { RedisService } from '../redis/redis.service';
import { Role } from 'generated/prisma';

@Controller('admin/redis')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class RedisAdminController {
  constructor(
    private cacheService: CacheService,
    private redisService: RedisService,
  ) {}

  @Get('info')
  async getRedisInfo() {
    const client = this.redisService.getClient();
    const info = await client.info();
    const dbSize = await client.dbSize();

    return {
      info: this.parseRedisInfo(info),
      dbSize,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('keys/:pattern')
  async getKeys(@Param('pattern') pattern: string) {
    const keys = await this.redisService.keys(pattern || '*');
    return {
      pattern,
      count: keys.length,
      keys: keys.slice(0, 100), // Limit to first 100 keys
    };
  }

  @Delete('cache/all')
  async clearAllCache() {
    await this.cacheService.invalidateAllCache();
    return { message: 'All cache cleared successfully' };
  }

  @Delete('cache/user/:userId')
  async clearUserCache(@Param('userId') userId: string) {
    await this.cacheService.invalidateUserCache(+userId);
    return { message: `Cache cleared for user ${userId}` };
  }

  @Delete('cache/todos')
  async clearTodosCache() {
    await this.cacheService.invalidateAllTodos();
    return { message: 'Todos cache cleared successfully' };
  }

  @Delete('cache/users')
  async clearUsersCache() {
    await this.cacheService.invalidateAllUsers();
    return { message: 'Users cache cleared successfully' };
  }

  @Delete('cache/stats')
  async clearStatsCache() {
    await this.cacheService.invalidateSystemStats();
    return { message: 'System stats cache cleared successfully' };
  }

  @Post('cache/warm')
  async warmCache() {
    // This would typically warm up frequently accessed data
    return { message: 'Cache warming initiated' };
  }

  private parseRedisInfo(info: string): Record<string, any> {
    const sections: Record<string, any> = {};
    let currentSection = 'general';

    info.split('\r\n').forEach((line) => {
      if (line.startsWith('#')) {
        currentSection = line.substring(2).toLowerCase();
        sections[currentSection] = {};
      } else if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (sections[currentSection]) {
          sections[currentSection][key] = isNaN(Number(value))
            ? value
            : Number(value);
        }
      }
    });

    return sections;
  }
}
