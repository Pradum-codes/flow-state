# FlowState Backend API (Phase 1 + Phase 2)

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

## Habits

All routes below require bearer token.

### `POST /habits`
Create habit.

```json
{
  "title": "Daily coding",
  "description": "At least 1 hour"
}
```

### `GET /habits`
List owned habits.

### `PATCH /habits/:id`
Update owned habit.

### `DELETE /habits/:id`
Delete owned habit.

### `POST /habits/:id/entries`
Create or update a daily habit entry (upsert by date).

```json
{
  "date": "2026-05-20T00:00:00.000Z",
  "completed": true,
  "notes": "Worked on backend"
}
```

### `GET /habits/:id/entries`
List entries with optional filtering and pagination.

Query params:
- `from` (ISO datetime)
- `to` (ISO datetime)
- `page` (default `1`)
- `limit` (default `30`, max `100`)

## Reminders

All routes below require bearer token.

### `POST /reminders`
Create reminder.

```json
{
  "title": "Review sprint board",
  "dueAt": "2026-05-21T10:00:00.000Z",
  "recurrence": "WEEKLY"
}
```

### `GET /reminders`
List reminders.

Query params:
- `isCompleted` (`true|false`)
- `from` (ISO datetime)
- `to` (ISO datetime)

### `PATCH /reminders/:id`
Update owned reminder.

### `DELETE /reminders/:id`
Delete owned reminder.

## Notes

All routes below require bearer token.

### `POST /notes`
Create personal or project-linked note.

```json
{
  "title": "API notes",
  "content": "Remember to add metrics endpoint",
  "projectId": "project-cuid-optional"
}
```

### `GET /notes`
List notes.

Query params:
- `projectId` (optional)

### `PATCH /notes/:id`
Update owned note.

### `DELETE /notes/:id`
Delete owned note.

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
