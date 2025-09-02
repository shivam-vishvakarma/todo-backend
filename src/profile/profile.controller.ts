import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';
import { RateLimitService } from '../rate-limit/rate-limit.service';

@Controller('profile')
@UseGuards(JwtAuthGuard, RateLimitGuard)
@RateLimit(RateLimitService.API_RATE_LIMIT)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: any) {
    return this.profileService.getProfile(user.id);
  }

  @Patch()
  updateProfile(
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: any,
  ) {
    return this.profileService.updateProfile(user.id, updateProfileDto);
  }

  @Patch('password')
  changePassword(
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: any,
  ) {
    return this.profileService.changePassword(user.id, changePasswordDto);
  }

  @Delete()
  deleteProfile(@CurrentUser() user: any) {
    return this.profileService.deleteProfile(user.id);
  }
}