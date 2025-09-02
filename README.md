# Todo Application with Authentication & Authorization

A comprehensive todo application built with NestJS, featuring user authentication, authorization, and admin management capabilities.

## Features

### Authentication & Authorization
- User registration and login with JWT tokens
- Password hashing with bcrypt
- Role-based access control (USER/ADMIN)
- Passport.js integration with local and JWT strategies

### Todo Management
- Create, read, update, delete todos
- Todo status tracking (PENDING, IN_PROGRESS, COMPLETED)
- Deadline management
- User-specific todo access with admin override

### Profile Management
- View and update user profile
- Change password functionality
- Delete user account

### Admin Features
- View all users and their statistics
- Manage user accounts (update/delete)
- View all todos across the system
- System statistics dashboard
- User role management
- Redis cache management and monitoring

### Redis Features
- **Caching**: Automatic caching of frequently accessed data (users, todos, stats)
- **Session Management**: User session tracking with Redis
- **Rate Limiting**: Redis-based rate limiting for API endpoints
- **Cache Invalidation**: Smart cache invalidation on data changes
- **Health Monitoring**: Redis connection health checks
- **Admin Tools**: Cache management and monitoring for administrators

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for caching and session management
- **Authentication**: Passport.js with JWT
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcryptjs
- **Rate Limiting**: Redis-based rate limiting

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database & Redis Setup
1. Install PostgreSQL on your system
2. Install Redis on your system
3. Create a new database for the application
4. Update the `DATABASE_URL` and Redis configuration in `.env` file

### 3. Environment Configuration
Update the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/todoapp?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0
PORT=3000
NODE_ENV="development"
```

### 4. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user (requires authentication)

### Profile Management
- `GET /profile` - Get current user profile
- `PATCH /profile` - Update user profile
- `PATCH /profile/password` - Change password
- `DELETE /profile` - Delete user account

### Todo Management
- `GET /todos` - Get user's todos (admin sees all)
- `POST /todos` - Create new todo
- `GET /todos/:id` - Get specific todo
- `PATCH /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo
- `GET /todos/user/:userId` - Get todos by user ID

### Admin Routes (Admin only)
- `GET /admin/users` - Get all users
- `GET /admin/users/:id` - Get user by ID
- `PATCH /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/todos` - Get all todos
- `GET /admin/stats` - Get system statistics

### Redis Management (Admin only)
- `GET /admin/redis/info` - Get Redis server information
- `GET /admin/redis/keys/:pattern` - Get Redis keys by pattern
- `DELETE /admin/redis/cache/all` - Clear all cache
- `DELETE /admin/redis/cache/user/:userId` - Clear user-specific cache
- `DELETE /admin/redis/cache/todos` - Clear todos cache
- `DELETE /admin/redis/cache/users` - Clear users cache
- `DELETE /admin/redis/cache/stats` - Clear system stats cache
- `POST /admin/redis/cache/warm` - Warm up cache

### Health Check
- `GET /health` - Check application and services health

## Database Schema

### User Model
- `id`: Unique identifier
- `email`: User email (unique)
- `username`: Username (unique)
- `password`: Hashed password
- `firstName`: Optional first name
- `lastName`: Optional last name
- `role`: USER or ADMIN
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Todo Model
- `id`: Unique identifier
- `title`: Todo title
- `description`: Optional description
- `status`: PENDING, IN_PROGRESS, or COMPLETED
- `deadline`: Optional deadline
- `userId`: Reference to user
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Authorization Rules

### Users
- Can only access their own todos and profile
- Cannot access admin routes
- Cannot modify other users' data

### Admins
- Can access all todos and user profiles
- Can manage user accounts
- Can view system statistics
- Have full CRUD access to all resources

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt (12 rounds)
- Input validation and sanitization
- Role-based access control
- Protected routes with guards
- Redis-based rate limiting
- Session management with Redis
- CORS enabled for cross-origin requests

## Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Update `JWT_SECRET` with a strong, unique secret
3. Configure your production database
4. Build the application: `npm run build`
5. Start with: `npm run start:prod`

## License

This project is licensed under the MIT License.