import * as bcrypt from 'bcryptjs';
import { PrismaClient, Role, TodoStatus } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'user',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
    },
  });

  // Create sample todos for the regular user
  const todos = [
    {
      title: 'Complete project documentation',
      description: 'Write comprehensive documentation for the todo application',
      status: TodoStatus.IN_PROGRESS,
      deadline: new Date('2025-02-15'),
      userId: user.id,
    },
    {
      title: 'Review code changes',
      description: 'Review and approve pending pull requests',
      status: TodoStatus.PENDING,
      deadline: new Date('2025-02-10'),
      userId: user.id,
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment',
      status: TodoStatus.COMPLETED,
      userId: user.id,
    },
  ];

  for (const todo of todos) {
    await prisma.todo.create({
      data: todo
    })
  }

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin@example.com / admin123');
  console.log('👤 Regular user: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });