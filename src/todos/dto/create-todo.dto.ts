import { TodoStatus } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

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