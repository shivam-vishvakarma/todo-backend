import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { TodoStatus } from 'generated/prisma';

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
