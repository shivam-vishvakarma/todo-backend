import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TodosService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async create(createTodoDto: CreateTodoDto, userId: number) {
    const { deadline, ...rest } = createTodoDto;
    const todo = await this.prisma.todo.create({
      data: {
        ...rest,
        deadline: deadline ? new Date(deadline) : null,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Invalidate user's todos cache
    await this.cacheService.invalidateUserTodos(userId);
    await this.cacheService.invalidateAllTodos();
    await this.cacheService.invalidateSystemStats();

    return todo;
  }

  async findAll(userId: number, userRole: Role) {
    // Check cache first
    if (userRole === Role.ADMIN) {
      const cachedTodos = await this.cacheService.getAllTodos();
      if (cachedTodos) {
        return cachedTodos;
      }
    } else {
      const cachedTodos = await this.cacheService.getUserTodos(userId);
      if (cachedTodos) {
        return cachedTodos;
      }
    }

    // Admin can see all todos, users can only see their own
    const where = userRole === Role.ADMIN ? {} : { userId };
    
    const todos = await this.prisma.todo.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Cache the results
    if (userRole === Role.ADMIN) {
      await this.cacheService.setAllTodos(todos);
    } else {
      await this.cacheService.setUserTodos(userId, todos);
    }

    return todos;
  }

  async findOne(id: number, userId: number, userRole: Role) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    // Admin can access any todo, users can only access their own
    if (userRole !== Role.ADMIN && todo.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto, userId: number, userRole: Role) {
    const todo = await this.findOne(id, userId, userRole);
    
    const { deadline, ...rest } = updateTodoDto;
    const updatedTodo = await this.prisma.todo.update({
      where: { id },
      data: {
        ...rest,
        deadline: deadline ? new Date(deadline) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Invalidate relevant caches
    await this.cacheService.invalidateUserTodos(todo.userId);
    await this.cacheService.invalidateAllTodos();
    await this.cacheService.invalidateSystemStats();

    return updatedTodo;
  }

  async remove(id: number, userId: number, userRole: Role) {
    const todo = await this.findOne(id, userId, userRole);
    
    const deletedTodo = await this.prisma.todo.delete({
      where: { id },
    });

    // Invalidate relevant caches
    await this.cacheService.invalidateUserTodos(todo.userId);
    await this.cacheService.invalidateAllTodos();
    await this.cacheService.invalidateSystemStats();

    return deletedTodo;
  }

  async findByUser(targetUserId: number, currentUserId: number, currentUserRole: Role) {
    // Admin can see any user's todos, users can only see their own
    if (currentUserRole !== Role.ADMIN && targetUserId !== currentUserId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.todo.findMany({
      where: { userId: targetUserId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}