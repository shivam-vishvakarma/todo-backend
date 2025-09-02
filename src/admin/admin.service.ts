import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async getAllUsers() {
    // Check cache first
    const cachedUsers = await this.cacheService.getAllUsers();
    if (cachedUsers) {
      return cachedUsers;
    }

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            todos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Cache the results
    await this.cacheService.setAllUsers(users);
    return users;
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        todos: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            deadline: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { email, username, ...rest } = updateUserDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if email or username is already taken by another user
    if (email || username) {
      const conflictUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                email ? { email } : {},
                username ? { username } : {},
              ].filter(obj => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (conflictUser) {
        throw new ConflictException('Email or username already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email,
        username,
        ...rest,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Invalidate relevant caches
    await this.cacheService.invalidateUserProfile(id);
    await this.cacheService.invalidateAllUsers();
    await this.cacheService.invalidateSystemStats();

    return updatedUser;
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    // Clear all related cache
    await this.cacheService.invalidateUserCache(id);
    await this.cacheService.invalidateAllUsers();
    await this.cacheService.invalidateAllTodos();
    await this.cacheService.invalidateSystemStats();

    return { message: 'User deleted successfully' };
  }

  async getAllTodos() {
    // Check cache first
    const cachedTodos = await this.cacheService.getAllTodos();
    if (cachedTodos) {
      return cachedTodos;
    }

    const todos = await this.prisma.todo.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Cache the results
    await this.cacheService.setAllTodos(todos);
    return todos;
  }

  async getSystemStats() {
    // Check cache first
    const cachedStats = await this.cacheService.getSystemStats();
    if (cachedStats) {
      return cachedStats;
    }

    const [totalUsers, totalTodos, adminUsers, completedTodos] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.todo.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.todo.count({ where: { status: 'COMPLETED' } }),
    ]);

    const stats = {
      totalUsers,
      totalTodos,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      completedTodos,
      pendingTodos: totalTodos - completedTodos,
    };

    // Cache the results
    await this.cacheService.setSystemStats(stats);
    return stats;
  }
}