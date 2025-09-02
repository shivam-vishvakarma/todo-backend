import { TodoStatus } from '@prisma/client';
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';

export class UpdateTodoDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TodoStatus)
  @IsOptional()
  status?: TodoStatus;

  @IsDateString()
  @IsOptional()
  deadline?: string;
}