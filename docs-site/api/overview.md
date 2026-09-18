# API Overview

Syscend-HRM exposes a RESTful JSON API under `/api/v1/`. The API is designed for integrating Syscend-HRM with mobile apps, third-party HR tools, payroll systems, or custom dashboards.

---

## Base URL

```
https://your-domain.com/api/v1
```

For local development:

```
http://localhost:8000/api/v1
```

---

## Authentication

All endpoints (except `/api/v1/auth/login`) require a **Bearer token** in the `Authorization` header:

```http
Authorization: Bearer {your_token}
```

Tokens are issued via the login endpoint and managed by **Laravel Sanctum**. See [Authentication](/api/authentication) for full details.

---

## Request Format

For `POST`, `PUT`, and `PATCH` requests, send data as JSON with the `Content-Type` header:

```http
Content-Type: application/json
```

Example:

```http
POST /api/v1/employees
Authorization: Bearer eyJ0eXAiOiJKV1Q...
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@company.com",
  "department_id": 3,
  "position_id": 7,
  "hire_date": "2026-04-01"
}
```

---

## Response Format

All successful responses return HTTP 200 (or 201 for created resources) with this structure:

```json
{
  "success": true,
  "message": "OK",
  "data": { ... }
}
```

### Paginated Responses

List endpoints return paginated results with a `meta` object:

```json
{
  "success": true,
  "data": [
    { ... },
    { ... }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 73,
    "from": 1,
    "to": 15
  },
  "links": {
    "first": "https://your-domain.com/api/v1/employees?page=1",
    "last": "https://your-domain.com/api/v1/employees?page=5",
    "prev": null,
    "next": "https://your-domain.com/api/v1/employees?page=2"
  }
}
```

### Pagination Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | 1 | Page number |
| `per_page` | 15 | Results per page (max 100) |

Example: `GET /api/v1/employees?page=2&per_page=25`

---

## Error Responses

All error responses follow a consistent structure:

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "department_id": ["The selected department does not exist."]
  }
}
```

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| **200** | Success — resource returned or action completed |
| **201** | Created — new resource successfully created |
| **204** | No Content — successful delete with no response body |
| **400** | Bad Request — malformed request syntax |
| **401** | Unauthenticated — missing or invalid Bearer token |
| **403** | Forbidden — authenticated but insufficient permissions |
| **404** | Not Found — resource does not exist |
| **422** | Unprocessable Entity — validation failed |
| **429** | Too Many Requests — rate limit exceeded |
| **500** | Internal Server Error — unexpected server error |

---

## Rate Limiting

The API enforces rate limiting to prevent abuse:

| Tier | Limit |
|------|-------|
| Default | 60 requests per minute |
| Authenticated | 120 requests per minute |

When the limit is exceeded, the API returns a `429` response with a `Retry-After` header indicating how many seconds to wait.

---

## Versioning

The current API version is `v1`. The version is included in the URL path (`/api/v1/`). When breaking changes are introduced, a new version (`/api/v2/`) will be released with a deprecation notice for `v1`.

---

## Available Endpoint Groups

| Group | Base Path | Description |
|-------|-----------|-------------|
| [Authentication](/api/authentication) | `/api/v1/auth/` | Login, logout, current user |
| [Employees](/api/employees) | `/api/v1/employees/` | Employee CRUD |
| [Departments & Positions](/api/departments) | `/api/v1/departments/`, `/api/v1/positions/` | Org structure |
| [Attendance](/api/attendance) | `/api/v1/attendance/` | Attendance records, check-in/out |
| [Leave](/api/leave) | `/api/v1/leave/` | Leave types, requests, approvals |
| [Payroll](/api/payroll) | `/api/v1/payroll/` | Payroll runs and payslips |
| [Performance](/api/performance) | `/api/v1/performance/` | Cycles and ratings |
| [Training](/api/training) | `/api/v1/training/` | Courses, sessions, enrollments |
| [Reports](/api/reports) | `/api/v1/reports/` | Analytics endpoints |

---

## Tools for Testing

We recommend using [Hoppscotch](https://hoppscotch.io) or [Postman](https://postman.com) to explore the API.

A Postman collection is available in the repository at `docs/postman/Syscend-HRM.postman_collection.json`.

Import it and set the following environment variables:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:8000/api/v1` |
| `token` | Your Bearer token (obtained from login) |
