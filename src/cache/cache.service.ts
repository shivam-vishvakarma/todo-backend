import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  constructor(private redisService: RedisService) {}

  // Generic cache methods
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisService.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.redisService.set(key, JSON.stringify(value), ttl);
  }

  async del(key: string): Promise<number> {
    return await this.redisService.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redisService.exists(key)) === 1;
  }

  // User-specific cache methods
  async getUserTodos(userId: number): Promise<any[] | null> {
    return await this.get(`user:${userId}:todos`);
  }

  async setUserTodos(userId: number, todos: any[], ttl: number = 300): Promise<void> {
    await this.set(`user:${userId}:todos`, todos, ttl);
  }

  async invalidateUserTodos(userId: number): Promise<void> {
    await this.del(`user:${userId}:todos`);
  }

  async getUserProfile(userId: number): Promise<any | null> {
    return await this.get(`user:${userId}:profile`);
  }

  async setUserProfile(userId: number, profile: any, ttl: number = 600): Promise<void> {
    await this.set(`user:${userId}:profile`, profile, ttl);
  }

  async invalidateUserProfile(userId: number): Promise<void> {
    await this.del(`user:${userId}:profile`);
  }

  // Admin cache methods
  async getAllUsers(): Promise<any[] | null> {
    return await this.get('admin:all-users');
  }

  async setAllUsers(users: any[], ttl: number = 300): Promise<void> {
    await this.set('admin:all-users', users, ttl);
  }

  async invalidateAllUsers(): Promise<void> {
    await this.del('admin:all-users');
  }

  async getAllTodos(): Promise<any[] | null> {
    return await this.get('admin:all-todos');
  }

  async setAllTodos(todos: any[], ttl: number = 300): Promise<void> {
    await this.set('admin:all-todos', todos, ttl);
  }

  async invalidateAllTodos(): Promise<void> {
    await this.del('admin:all-todos');
  }

  async getSystemStats(): Promise<any | null> {
    return await this.get('admin:system-stats');
  }

  async setSystemStats(stats: any, ttl: number = 180): Promise<void> {
    await this.set('admin:system-stats', stats, ttl);
  }

  async invalidateSystemStats(): Promise<void> {
    await this.del('admin:system-stats');
  }

  // Session management
  async setUserSession(userId: number, sessionData: any, ttl: number = 86400): Promise<void> {
    await this.redisService.hSet(`session:${userId}`, 'data', JSON.stringify(sessionData));
    await this.redisService.expire(`session:${userId}`, ttl);
  }

  async getUserSession(userId: number): Promise<any | null> {
    const sessionData = await this.redisService.hGet(`session:${userId}`, 'data');
    return sessionData ? JSON.parse(sessionData) : null;
  }

  async deleteUserSession(userId: number): Promise<void> {
    await this.redisService.del(`session:${userId}`);
  }

  // Rate limiting helpers
  async incrementRateLimit(key: string, ttl: number = 3600): Promise<number> {
    const current = await this.redisService.incr(key);
    if (current === 1) {
      await this.redisService.expire(key, ttl);
    }
    return current;
  }

  async getRateLimit(key: string): Promise<number> {
    const value = await this.redisService.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  // Bulk cache invalidation
  async invalidateUserCache(userId: number): Promise<void> {
    const keys = await this.redisService.keys(`user:${userId}:*`);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.redisService.del(key)));
    }
  }

  async invalidateAllCache(): Promise<void> {
    await this.redisService.flushAll();
  }

  // Cache warming methods
  async warmUserCache(userId: number, todos: any[], profile: any): Promise<void> {
    await Promise.all([
      this.setUserTodos(userId, todos),
      this.setUserProfile(userId, profile),
    ]);
  }
}