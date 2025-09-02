import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

export interface UserSession {
  userId: number;
  username: string;
  role: string;
  loginTime: string;
  lastActivity: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionService {
  constructor(private cacheService: CacheService) {}

  async createSession(sessionData: Omit<UserSession, 'loginTime' | 'lastActivity'>): Promise<void> {
    const session: UserSession = {
      ...sessionData,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    await this.cacheService.setUserSession(sessionData.userId, session);
  }

  async getSession(userId: number): Promise<UserSession | null> {
    return await this.cacheService.getUserSession(userId);
  }

  async updateLastActivity(userId: number): Promise<void> {
    const session = await this.getSession(userId);
    if (session) {
      session.lastActivity = new Date().toISOString();
      await this.cacheService.setUserSession(userId, session);
    }
  }

  async deleteSession(userId: number): Promise<void> {
    await this.cacheService.deleteUserSession(userId);
  }

  async isSessionValid(userId: number, maxInactiveMinutes: number = 60): Promise<boolean> {
    const session = await this.getSession(userId);
    if (!session) {
      return false;
    }

    const lastActivity = new Date(session.lastActivity);
    const now = new Date();
    const inactiveMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

    return inactiveMinutes <= maxInactiveMinutes;
  }

  async getActiveSessions(): Promise<UserSession[]> {
    // This would require scanning Redis keys, which is expensive
    // In a real application, you might maintain a separate index
    return [];
  }
}