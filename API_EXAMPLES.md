# API Usage Examples

This document provides examples of how to use the Todo Application API.

## Authentication

### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "john",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "password123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "username": "john",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

## Todo Management

### Create a todo
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project",
    "description": "Finish the todo application",
    "status": "PENDING",
    "deadline": "2025-02-15T10:00:00Z"
  }'
```

### Get all todos
```bash
curl -X GET http://localhost:3000/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get specific todo
```bash
curl -X GET http://localhost:3000/todos/todo-id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update todo
```bash
curl -X PATCH http://localhost:3000/todos/todo-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "COMPLETED"
  }'
```

### Delete todo
```bash
curl -X DELETE http://localhost:3000/todos/todo-id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Profile Management

### Get profile
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update profile
```bash
curl -X PATCH http://localhost:3000/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Johnny",
    "lastName": "Smith"
  }'
```

### Change password
```bash
curl -X PATCH http://localhost:3000/profile/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }'
```

## Admin Routes (Admin users only)

### Get all users
```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get user by ID
```bash
curl -X GET http://localhost:3000/admin/users/user-id \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Update user
```bash
curl -X PATCH http://localhost:3000/admin/users/user-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "role": "ADMIN"
  }'
```

### Get all todos (admin view)
```bash
curl -X GET http://localhost:3000/admin/todos \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get system statistics
```bash
curl -X GET http://localhost:3000/admin/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

Response:
```json
{
  "totalUsers": 10,
  "totalTodos": 25,
  "adminUsers": 2,
  "regularUsers": 8,
  "completedTodos": 15,
  "pendingTodos": 10
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Todo not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email or username already exists"
}
```

## Todo Status Values
- `PENDING`: Todo is not started
- `IN_PROGRESS`: Todo is being worked on
- `COMPLETED`: Todo is finished

## User Roles
- `USER`: Regular user with limited access
- `ADMIN`: Administrator with full access to all resources