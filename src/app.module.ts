import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CacheModule } from './cache/cache.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { AuthModule } from './auth/auth.module';
import { TodosModule } from './todos/todos.module';
import { ProfileModule } from './profile/profile.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    CacheModule,
    RateLimitModule,
    AuthModule,
    TodosModule,
    ProfileModule,
    AdminModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
