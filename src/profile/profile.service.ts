import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async getProfile(userId: number) {
    // Check cache first
    const cachedProfile = await this.cacheService.getUserProfile(userId);
    if (cachedProfile) {
      return cachedProfile;
    }

    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
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

    // Cache the profile
    if (profile) {
      await this.cacheService.setUserProfile(userId, profile);
    }

    return profile;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const { email, username, ...rest } = updateProfileDto;

    // Check if email or username is already taken by another user
    if (email || username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                email ? { email } : {},
                username ? { username } : {},
              ].filter(obj => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (existingUser) {
        throw new ConflictException('Email or username already taken');
      }
    }

    const updatedProfile = await this.prisma.user.update({
      where: { id: userId },
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

    // Update cache
    await this.cacheService.setUserProfile(userId, updatedProfile);
    await this.cacheService.invalidateAllUsers();

    return updatedProfile;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async deleteProfile(userId: number) {
    await this.prisma.user.delete({
      where: { id: userId },
    });

    // Clear all user-related cache
    await this.cacheService.invalidateUserCache(userId);
    await this.cacheService.invalidateAllUsers();
    await this.cacheService.invalidateAllTodos();
    await this.cacheService.invalidateSystemStats();

    return { message: 'Profile deleted successfully' };
  }
}