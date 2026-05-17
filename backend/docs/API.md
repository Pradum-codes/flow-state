# FlowState Backend API (Phase 1)

Base URL: `http://localhost:4000/api/v1`

## Auth

### `POST /auth/register`
Create user and return JWT.

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Flow User"
}
```

Response `201`:
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "name": "Flow User"
    }
  }
}
```

### `POST /auth/login`
Login and return JWT.

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### `GET /auth/me`
Get current authenticated user.

Header:
`Authorization: Bearer <token>`

## Projects

All routes below require bearer token.

### `POST /projects`
Create project.

Request:
```json
{
  "name": "FlowState API",
  "description": "Phase 1 implementation",
  "status": "ACTIVE"
}
```

### `GET /projects`
List user projects with pagination.

Query params:
- `page` (default `1`)
- `limit` (default `20`, max `50`)
- `sort` (`createdAt|updatedAt|name`)
- `order` (`asc|desc`)

### `GET /projects/:id`
Get single owned project.

### `PATCH /projects/:id`
Update owned project.

### `DELETE /projects/:id`
Delete owned project.

## Tasks

All routes below require bearer token.

### `POST /projects/:projectId/tasks`
Create task under owned project.

Request:
```json
{
  "title": "Implement auth route",
  "description": "POST /auth/register",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-05-25T10:00:00.000Z"
}
```

### `GET /projects/:projectId/tasks`
List tasks with optional filters and pagination.

Query params:
- `status` (`TODO|IN_PROGRESS|DONE`)
- `priority` (`LOW|MEDIUM|HIGH`)
- `dueFrom` (ISO datetime)
- `dueTo` (ISO datetime)
- `page` (default `1`)
- `limit` (default `30`, max `100`)

### `PATCH /tasks/:id`
Update owned task fields (`title`, `description`, `status`, `priority`, `dueDate`).

### `DELETE /tasks/:id`
Delete owned task.

## Health

### `GET /health`
Simple health endpoint.

Response:
```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## Error Contract

All errors follow:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  }
}
```

Common codes:
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `API_ERROR`
- `INTERNAL_ERROR`

## Local Setup

1. Copy env file:
```bash
cp .env.example .env
```
2. Install dependencies:
```bash
npm install
```
3. Generate Prisma client:
```bash
npx prisma generate
```
4. Create/apply database schema:
```bash
npx prisma db push
```
5. Run server:
```bash
npm run dev
```
