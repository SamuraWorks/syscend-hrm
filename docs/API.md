# Syscend-HRM REST API Reference

Base URL: `/api`. All endpoints return JSON.

## Authentication

Bearer token (Laravel Sanctum). Tokens auto-expire after `SANCTUM_TOKEN_EXPIRATION` minutes (default `1440` = 24h).

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Get a token

```
POST /api/v1/auth/login
POST /api/auth/login
```

Body: `{ "email": "...", "password": "..." }`

Responses:
- `200` → `{ "token": "<sanctum-token>", "user": { ... } }`
- `403` → inactive account or account with no roles (`ApiRoleGate` cannot issue a token for a roleless/inactive user).
- `401` → bad credentials.

### Revoke token / whoami

```
POST /api/v1/auth/logout      (authed)
GET  /api/v1/auth/me          (authed)
```

Legacy equivalents: `POST /api/auth/logout`, `GET /api/auth/user`. Extra legacy routes: `POST /api/auth/refresh-token`, `POST /api/auth/change-password`.

### Password reset (public, rate-limited)

```
POST /api/auth/forgot-password    { "email": "..." }
POST /api/auth/reset-password     { "email", "token", "password" }
```

### MFA

`POST /api/auth/mfa/enable`, `POST /api/auth/mfa/verify`, `POST /api/auth/mfa/disable`, `GET /api/auth/mfa/backup-codes`.

MFA is NOT enabled in this deployment — these return `501` with a JSON explanation.

## Rate limiting

| Limiter | Scope | Limit |
|---|---|---|
| `login` | per email + IP | 5 req/min |
| `careers` | per IP | 5 req/min |
| `api` (authed) | per user | 300 req/min |
| `api` (anonymous) | per IP | 60 req/min |

Exceeded requests → `429 Too Many Requests` with a `Retry-After` header.

## Authorization

- Auth tokens only work for **active** users who have **at least one role**.
- Modules under `/api/v1` and the legacy groups both require a valid bearer token.
- Admin-only groups additionally require the `Admin` role: `/api/admin/*`, `/api/auth/sessions/*`.

## v1 API (`/api/v1`)

### Auth
- `POST /auth/login` (public)
- `POST /auth/logout`, `GET /auth/me`

### Employees
- `apiResource('employees')` → `GET/POST /employees`, `GET/PUT/DELETE /employees/{id}`
- Sort param: `?sort=name,asc|name,desc` — only whitelisted columns (see `EmployeeController::SORTABLE`); invalid sort falls back to `name,asc`.

### Organization
- `GET/POST /departments`, `GET/PUT/DELETE /departments/{id}`
- `GET/POST /positions`, `GET/PUT/DELETE /positions/{id}`

### Attendance
- `GET /attendance`
- `POST /attendance/check-in`, `POST /attendance/check-out`
- `GET /attendance/employee/{employee}`

### Leave
- `GET /leave/types`
- `apiResource('leave/requests')` → `GET/POST /leave/requests`, `GET/PUT/DELETE /leave/requests/{leaveRequest}`
- `PATCH /leave/requests/{leaveRequest}/approve`
- `PATCH /leave/requests/{leaveRequest}/reject`

### Payroll
- `GET /payroll/runs`, `GET /payroll/runs/{run}`
- `GET /payroll/payslips`, `GET /payroll/payslips/{payslip}`

### Performance
- `GET /performance/cycles`, `GET /performance/cycles/{cycle}`
- `GET /performance/ratings`, `GET /performance/ratings/{rating}`

### Training
- `GET /training/courses`, `GET /training/courses/{course}`
- `GET /training/sessions`, `GET /training/enrollments`
- `POST /training/enrollments` (enroll), `PATCH /training/enrollments/{enrollment}/complete`

### Reports
- `GET /reports/headcount`, `GET /reports/attendance`, `GET /reports/leave`, `GET /reports/payroll`

## Legacy API (module endpoints)

`GET/POST /api/employees` (incl. `export`, `bulk-import`, per-employee `history`, `documents`), organizations, attendance (`check-in`/`check-out`/`today`/`daily`/`monthly/{id}`/`report`/`mark`/`update`), shifts (incl. `assign`), holidays, leave (`apply`/`pending`/`calendar`/`report`/`approve`/`reject`/`cancel`, `leave-types`, `leave-policies`, `leave-balance/{employee_id}`), recruitment (jobs, applicants, applications `status`/`notes`, interviews, offers, `recruitment/report`), payroll (`salary-components`, `salary-structures`, `salary-assignments`, `payroll/run`, `payslips/{id}`, `payslips/distribute`, `deductions`), performance (goals, appraisals, feedback, `performance/report`), training (`trainings` CRUD + `enroll`/`attendance`/`certificates`/`materials`, `training-materials`, `skills`, `employee-skills`), documents (`documents` CRUD + `versions`/`acknowledge`/`acknowledgments`/`documents-expiring`, `compliance-checklists`), dashboard (`executive`/`hr`/`manager`), reports (all `reports/*` incl. `export`/`custom`/`save`/`saved`/`schedule`), admin only (`admin/users`, `admin/roles`, `admin/permissions`, `admin/system-settings`, `admin/email-templates`, `admin/audit-logs`).

### Run payroll (JSON)

```
POST /api/payroll/run        (authed, throttle:api)
```

Body: `{ "month": 3, "year": 2026, "notes": null }`

Responses:
- `200` → `{ "run": { "id", "month", "year", "title", "status", "total_employees", "total_gross", "total_deductions", "total_net" } }`
- `422` → a run for that month/year already exists.

Generates payslips for every active employee with a salary assignment effective on/before the run month (latest assignment per employee wins). Payroll read endpoints live under `/api/v1/payroll/*`.

## Public endpoints (no auth)

```
GET  /api/careers            (open job postings)
GET  /api/careers/{id}       (single posting)
POST /api/careers/{id}/apply (rate-limited: 5/min/IP)
```

## Error responses

- `401` — missing/invalid/expired token.
- `403` — active-user gate, role gate, or role:Admin gate failed.
- `422` — validation failure (field errors array).
- `429` — rate limit exceeded.
- `501` — MFA not available in this deployment.
- `500` — unexpected server error (production: opaque message; details logged).