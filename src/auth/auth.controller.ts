import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';
import { RateLimitService } from '../rate-limit/rate-limit.service';

@Controller('auth')
@UseGuards(RateLimitGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @RateLimit(RateLimitService.AUTH_RATE_LIMIT)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit(RateLimitService.AUTH_RATE_LIMIT)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }
}