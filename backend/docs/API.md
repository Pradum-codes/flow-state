# FlowState Backend API (Phase 1-5)

Base URL: `http://localhost:4000/api/v1`

## Core Headers
- `Authorization: Bearer <token>` for protected routes.
- `X-Request-Id` is returned on every response.

## Health
### `GET /health`
Liveness check.

### `GET /health/readiness`
Readiness check with dependency verification (database).

## Auth
### `POST /auth/register`
### `POST /auth/login`
### `GET /auth/me`

Auth endpoints are protected by stricter anti-bruteforce rate limits.

## Projects
### `POST /projects`
### `GET /projects`
### `GET /projects/:id`
### `PATCH /projects/:id`
### `DELETE /projects/:id`

## Tasks
### `POST /projects/:projectId/tasks`
### `GET /projects/:projectId/tasks`
Query:
- `status`: `TODO|IN_PROGRESS|DONE`
- `priority`: `LOW|MEDIUM|HIGH`
- `dueFrom`, `dueTo`: ISO datetime
- `page`, `limit`

### `PATCH /tasks/:id`
### `DELETE /tasks/:id`

## Habits
### `POST /habits`
### `GET /habits`
### `PATCH /habits/:id`
### `DELETE /habits/:id`
### `POST /habits/:id/entries`
### `GET /habits/:id/entries`

## Reminders
### `POST /reminders`
### `GET /reminders`
### `PATCH /reminders/:id`
### `DELETE /reminders/:id`

## Notes
### `POST /notes`
### `GET /notes`
### `PATCH /notes/:id`
### `DELETE /notes/:id`

## GitHub Integration
### `POST /integrations/github/connect`
### `DELETE /integrations/github/disconnect`
### `GET /integrations/github/status`
### `POST /github/sync`
### `GET /github/activity`
### `GET /github/summary`

## Analytics and Dashboard (Phase 4)
### `GET /dashboard/overview`
Returns dashboard-ready aggregates:
- active projects
- due-today tasks
- upcoming/overdue reminders
- habits today summary
- GitHub connection + last 7 day event count

### `GET /analytics/productivity-score`
Query:
- `from` (ISO datetime, optional)
- `to` (ISO datetime, optional)
Computes a weighted score (tasks 50%, habits 30%, reminders 20%).

### `GET /analytics/weekly-progress`
Query:
- `weeks` (1-24, default `8`)
Returns week buckets with counts for tasks, habits, reminders, and GitHub events.

### `GET /analytics/heatmap`
Query:
- `days` (7-365, default `90`)
Returns day buckets for activity heatmap rendering.

Timezone strategy for analytics rollups: `UTC`.

## Security and Reliability (Phase 5)
Implemented globally:
- secure HTTP headers
- request body size limits
- structured request logging with request id
- global API rate limits
- auth-specific stricter rate limits
- CORS allowlist support via env

## Error Contract
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
- `DEPENDENCY_UNAVAILABLE`

## Environment Knobs (Phase 5)
- `CORS_ORIGIN` (default `*`, comma-separated origins supported)
- `REQUEST_BODY_LIMIT` (default `1mb`)
- `RATE_LIMIT_WINDOW_MS` (default `60000`)
- `RATE_LIMIT_MAX` (default `120`)
- `AUTH_RATE_LIMIT_WINDOW_MS` (default `60000`)
- `AUTH_RATE_LIMIT_MAX` (default `10`)

## Local Setup
1. `npm install`
2. `npx prisma generate`
3. `npx prisma db push`
4. `npm run dev`
