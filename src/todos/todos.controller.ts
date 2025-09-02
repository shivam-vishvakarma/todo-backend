import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';
import { RateLimitService } from '../rate-limit/rate-limit.service';

@Controller('todos')
@UseGuards(JwtAuthGuard, RateLimitGuard)
@RateLimit(RateLimitService.API_RATE_LIMIT)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(
    @Body(ValidationPipe) createTodoDto: CreateTodoDto,
    @CurrentUser() user: any,
  ) {
    return this.todosService.create(createTodoDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.todosService.findAll(user.id, user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.todosService.findOne(+id, user.id, user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: any,
  ) {
    return this.todosService.update(+id, updateTodoDto, user.id, user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.todosService.remove(+id, user.id, user.role);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @CurrentUser() user: any) {
    return this.todosService.findByUser(+userId, user.id, user.role);
  }
}