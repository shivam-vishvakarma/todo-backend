import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
@Roles(Role.ADMIN)
@RateLimit(RateLimitService.ADMIN_RATE_LIMIT)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(+id);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(+id, updateUserDto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
  }

  @Get('todos')
  getAllTodos() {
    return this.adminService.getAllTodos();
  }

  @Get('stats')
  getSystemStats() {
    return this.adminService.getSystemStats();
  }
}