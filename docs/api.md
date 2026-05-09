# Smart ERP Next API Documentation

## Base URL
`http://localhost:3000`

## Authentication

### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "tenantId": "optional-uuid"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "tenantId": "uuid"
  }
}
```

## Users (Protected)

All endpoints require `Authorization: Bearer <token>`

### List Users
```
GET /users
```

### Get User
```
GET /users/:id
```

### Create User
```
POST /users
{
  "email": "new@example.com",
  "password": "password123",
  "name": "New User",
  "tenantId": "uuid"
}
```

### Update User
```
PATCH /users/:id
{
  "name": "Updated Name"
}
```

### Delete User
```
DELETE /users/:id
```

## Health Check
```
GET /health
Response: { "status": "ok", "timestamp": "iso-string" }
```
