import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { RedisAdminController } from './redis-admin.controller';

@Module({
  controllers: [AdminController, RedisAdminController],
  providers: [AdminService],
})
export class AdminModule {}